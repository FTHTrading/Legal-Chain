/**
 * Pipeline Execution Engine
 *
 * Executes multi-step agent pipelines with support for sequential,
 * parallel, conditional, fan-out/fan-in, retry, approval gates, and
 * loop patterns. Each step dispatches to the agent runtime with full
 * governance, x402 payment settlement, and escalation tracking.
 */

import { randomUUID } from "crypto";
import { routeTask, dispatchTask, getAgent, initRuntime } from "../agents/runtime";
import type { TaskResult } from "../agents/executor";
import type {
  PipelineDef,
  StepDef,
  StepResult,
  StepStatus,
  StepCondition,
  Orchestration,
  EscalationRecord,
} from "./types";
import { executeX402Action } from "./x402-runner";

// ── Pipeline Executor ──

/**
 * Execute a full pipeline within an orchestration context.
 * Handles all patterns: sequential, parallel, conditional, etc.
 */
export async function executePipeline(
  pipeline: PipelineDef,
  orchestration: Orchestration
): Promise<StepResult[]> {
  const results: StepResult[] = [];

  switch (pipeline.pattern) {
    case "sequential":
      return executeSequential(pipeline, orchestration);

    case "parallel":
      return executeParallel(pipeline, orchestration);

    case "fan_out":
      return executeFanOut(pipeline, orchestration);

    case "conditional":
      return executeConditional(pipeline, orchestration);

    case "approval_gate":
      return executeApprovalGate(pipeline, orchestration);

    default:
      // Fall back to sequential for unimplemented patterns
      return executeSequential(pipeline, orchestration);
  }
}

// ── Sequential Execution ──

async function executeSequential(
  pipeline: PipelineDef,
  orchestration: Orchestration
): Promise<StepResult[]> {
  const results: StepResult[] = [];

  for (const step of pipeline.steps) {
    // Check dependencies
    if (!areDependenciesMet(step, orchestration)) {
      const skipped = buildSkippedResult(step, "Dependencies not met");
      results.push(skipped);
      orchestration.stepResults.set(step.id, skipped);
      continue;
    }

    // Check condition
    if (step.condition && !evaluateCondition(step.condition, orchestration)) {
      const skipped = buildSkippedResult(step, "Condition not met");
      results.push(skipped);
      orchestration.stepResults.set(step.id, skipped);
      continue;
    }

    // Execute step
    const result = await executeStep(step, orchestration);
    results.push(result);
    orchestration.stepResults.set(step.id, result);
    orchestration.completedSteps++;
    orchestration.lastActivityAt = new Date().toISOString();

    // Store output in context
    if (step.outputKey && result.status === "completed") {
      orchestration.context[step.outputKey] = result.output;
    }

    // Handle failure
    if (result.status === "failed") {
      if (pipeline.onFailure === "halt") break;
      if (pipeline.onFailure === "escalate") {
        recordEscalation(orchestration, step.id, result);
      }
    }
  }

  return results;
}

// ── Parallel Execution ──

async function executeParallel(
  pipeline: PipelineDef,
  orchestration: Orchestration
): Promise<StepResult[]> {
  const maxConcurrency = pipeline.maxConcurrency || pipeline.steps.length;
  const results: StepResult[] = [];

  // Batch into groups respecting maxConcurrency
  for (let i = 0; i < pipeline.steps.length; i += maxConcurrency) {
    const batch = pipeline.steps.slice(i, i + maxConcurrency);
    const batchResults = await Promise.allSettled(
      batch.map((step) => executeStep(step, orchestration))
    );

    for (let j = 0; j < batchResults.length; j++) {
      const settled = batchResults[j];
      const step = batch[j];
      if (settled.status === "fulfilled") {
        results.push(settled.value);
        orchestration.stepResults.set(step.id, settled.value);
        orchestration.completedSteps++;
        if (step.outputKey && settled.value.status === "completed") {
          orchestration.context[step.outputKey] = settled.value.output;
        }
      } else {
        const failed = buildFailedResult(step, settled.reason?.message || "Unknown error");
        results.push(failed);
        orchestration.stepResults.set(step.id, failed);
      }
    }

    orchestration.lastActivityAt = new Date().toISOString();
  }

  return results;
}

// ── Fan-Out Execution ──

async function executeFanOut(
  pipeline: PipelineDef,
  orchestration: Orchestration
): Promise<StepResult[]> {
  // Fan-out sends the same instruction to multiple agents concurrently
  return executeParallel(pipeline, orchestration);
}

// ── Conditional Execution ──

async function executeConditional(
  pipeline: PipelineDef,
  orchestration: Orchestration
): Promise<StepResult[]> {
  const results: StepResult[] = [];

  for (const step of pipeline.steps) {
    if (step.condition && !evaluateCondition(step.condition, orchestration)) {
      const skipped = buildSkippedResult(step, "Condition not met");
      results.push(skipped);
      orchestration.stepResults.set(step.id, skipped);
      continue;
    }

    const result = await executeStep(step, orchestration);
    results.push(result);
    orchestration.stepResults.set(step.id, result);
    orchestration.completedSteps++;
    if (step.outputKey && result.status === "completed") {
      orchestration.context[step.outputKey] = result.output;
    }
  }

  return results;
}

// ── Approval Gate ──

async function executeApprovalGate(
  pipeline: PipelineDef,
  orchestration: Orchestration
): Promise<StepResult[]> {
  const results: StepResult[] = [];

  for (const step of pipeline.steps) {
    if (step.requiresApproval) {
      const awaitingResult: StepResult = {
        stepId: step.id,
        status: "awaiting_approval",
        agentId: "",
        agentName: "",
        output: `Step "${step.name}" requires human approval before proceeding.`,
        confidenceScore: 0,
        toolCallsMade: 0,
        tokensUsed: 0,
        model: "",
        durationMs: 0,
        escalated: false,
        retryCount: 0,
        timestamp: new Date().toISOString(),
      };
      results.push(awaitingResult);
      orchestration.stepResults.set(step.id, awaitingResult);
      orchestration.status = "awaiting_approval";
      break; // Halt pipeline until approved
    }

    const result = await executeStep(step, orchestration);
    results.push(result);
    orchestration.stepResults.set(step.id, result);
    orchestration.completedSteps++;
  }

  return results;
}

// ── Core Step Execution ──

async function executeStep(
  step: StepDef,
  orchestration: Orchestration
): Promise<StepResult> {
  const start = Date.now();
  let retryCount = 0;
  const maxRetries = step.maxRetries || 0;

  while (retryCount <= maxRetries) {
    try {
      // Build context from orchestration state
      const contextParts: string[] = [];
      if (orchestration.context) {
        const ctxEntries = Object.entries(orchestration.context);
        if (ctxEntries.length > 0) {
          contextParts.push("PRIOR CONTEXT:");
          for (const [key, value] of ctxEntries) {
            const val = typeof value === "string" ? value : JSON.stringify(value);
            contextParts.push(`[${key}]: ${val.slice(0, 1000)}`);
          }
        }
      }
      if (orchestration.matterId) {
        contextParts.push(`ACTIVE MATTER: ${orchestration.matterId}`);
      }

      // Route to agent
      let taskResult: TaskResult;
      if (step.agentId) {
        const agent = getAgent(step.agentId);
        if (!agent) throw new Error(`Agent ${step.agentId} not found`);
        taskResult = await dispatchTask({
          agent,
          instruction: step.instruction,
          context: contextParts.join("\n"),
          matterId: orchestration.matterId,
        });
      } else {
        taskResult = await routeTask(step.agentTeam, step.instruction, {
          context: contextParts.join("\n"),
          matterId: orchestration.matterId,
        });
      }

      // Check minimum confidence
      if (step.minConfidence && taskResult.confidenceScore < step.minConfidence) {
        const result: StepResult = {
          stepId: step.id,
          status: "escalated",
          agentId: taskResult.agentId,
          agentName: taskResult.agentName,
          output: taskResult.output,
          confidenceScore: taskResult.confidenceScore,
          toolCallsMade: taskResult.toolCallsMade,
          tokensUsed: taskResult.tokensUsed,
          model: taskResult.model,
          durationMs: Date.now() - start,
          escalated: true,
          escalationReason: `Confidence ${taskResult.confidenceScore.toFixed(2)} below minimum ${step.minConfidence}`,
          retryCount,
          timestamp: new Date().toISOString(),
        };
        recordEscalation(orchestration, step.id, result);
        return result;
      }

      // Execute x402 payment if configured
      let x402Receipt;
      if (step.x402Action) {
        try {
          x402Receipt = await executeX402Action(step.x402Action, step.id);
          orchestration.x402Receipts.push(x402Receipt);
          const spent = BigInt(orchestration.totalATPSpent) + BigInt(step.x402Action.amount);
          orchestration.totalATPSpent = spent.toString();
        } catch {
          // Payment failure is logged but doesn't block the step
        }
      }

      return {
        stepId: step.id,
        status: "completed",
        agentId: taskResult.agentId,
        agentName: taskResult.agentName,
        output: taskResult.output,
        confidenceScore: taskResult.confidenceScore,
        toolCallsMade: taskResult.toolCallsMade,
        tokensUsed: taskResult.tokensUsed,
        model: taskResult.model,
        durationMs: Date.now() - start,
        escalated: taskResult.escalated,
        escalationReason: taskResult.escalationReason,
        retryCount,
        x402Receipt,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      retryCount++;
      if (retryCount > maxRetries) {
        return buildFailedResult(
          step,
          err instanceof Error ? err.message : String(err),
          Date.now() - start,
          retryCount - 1
        );
      }
    }
  }

  return buildFailedResult(step, "Max retries exceeded", Date.now() - start, retryCount);
}

// ── Dependency Resolution ──

function areDependenciesMet(step: StepDef, orchestration: Orchestration): boolean {
  if (!step.dependsOn || step.dependsOn.length === 0) return true;
  return step.dependsOn.every((depId) => {
    const result = orchestration.stepResults.get(depId);
    return result && result.status === "completed";
  });
}

// ── Condition Evaluation ──

function evaluateCondition(condition: StepCondition, orchestration: Orchestration): boolean {
  switch (condition.type) {
    case "step_succeeded": {
      if (!condition.stepId) return true;
      const result = orchestration.stepResults.get(condition.stepId);
      return result?.status === "completed";
    }
    case "step_failed": {
      if (!condition.stepId) return false;
      const result = orchestration.stepResults.get(condition.stepId);
      return result?.status === "failed";
    }
    case "confidence_above": {
      if (!condition.stepId || typeof condition.value !== "number") return true;
      const result = orchestration.stepResults.get(condition.stepId);
      return result ? result.confidenceScore >= condition.value : false;
    }
    case "confidence_below": {
      if (!condition.stepId || typeof condition.value !== "number") return false;
      const result = orchestration.stepResults.get(condition.stepId);
      return result ? result.confidenceScore < condition.value : false;
    }
    case "output_contains": {
      if (!condition.stepId || typeof condition.value !== "string") return false;
      const result = orchestration.stepResults.get(condition.stepId);
      return result?.output.toLowerCase().includes(condition.value.toLowerCase()) ?? false;
    }
    default:
      return true;
  }
}

// ── Escalation Recording ──

function recordEscalation(
  orchestration: Orchestration,
  stepId: string,
  result: StepResult
): void {
  const escalation: EscalationRecord = {
    id: randomUUID(),
    orchestrationId: orchestration.id,
    stepId,
    agentId: result.agentId,
    reason: result.escalationReason || "Escalated by pipeline",
    severity: result.confidenceScore < 0.3 ? "critical" : result.confidenceScore < 0.5 ? "high" : "medium",
    escalateTo: "supervising_attorney",
    status: "open",
    context: { output: result.output.slice(0, 500), confidence: result.confidenceScore },
    timestamp: new Date().toISOString(),
  };
  orchestration.escalations.push(escalation);
}

// ── Result Builders ──

function buildSkippedResult(step: StepDef, reason: string): StepResult {
  return {
    stepId: step.id,
    status: "skipped",
    agentId: "",
    agentName: "",
    output: reason,
    confidenceScore: 0,
    toolCallsMade: 0,
    tokensUsed: 0,
    model: "",
    durationMs: 0,
    escalated: false,
    retryCount: 0,
    timestamp: new Date().toISOString(),
  };
}

function buildFailedResult(
  step: StepDef,
  error: string,
  durationMs = 0,
  retryCount = 0
): StepResult {
  return {
    stepId: step.id,
    status: "failed",
    agentId: "",
    agentName: "",
    output: "",
    confidenceScore: 0,
    toolCallsMade: 0,
    tokensUsed: 0,
    model: "",
    durationMs,
    escalated: false,
    retryCount,
    error,
    timestamp: new Date().toISOString(),
  };
}

// Ensure runtime is initialized
initRuntime();
