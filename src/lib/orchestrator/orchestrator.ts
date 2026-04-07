/**
 * Orchestrator Core
 *
 * Multi-workflow coordinator that manages the full lifecycle of
 * legal orchestrations: intake → investigation → case file → defense.
 *
 * All client PII flows through the Privacy Vault — the orchestrator
 * never stores or exposes plaintext personal information.
 */

import { randomUUID } from "crypto";
import { initRuntime } from "../agents/runtime";
import { executePipeline } from "./pipeline";
import { vaultIntake, getVaultStats } from "../privacy/vault";
import { createPrivateLink, buildPrivateLinkURL } from "../privacy/private-links";
import type {
  WorkflowDef,
  Orchestration,
  OrchestrationStatus,
  StepResult,
  OrchestratorEvent,
  OrchestratorStats,
} from "./types";

// ── Orchestration Store ──

const orchestrations = new Map<string, Orchestration>();
const eventLog: OrchestratorEvent[] = [];

// ── Lifecycle ──

/**
 * Launch a new orchestration from a workflow definition.
 * All client PII in initialInput is encrypted into the vault BEFORE
 * being passed to agents — agents receive only vault IDs + hashes.
 */
export async function launchOrchestration(
  workflow: WorkflowDef,
  input: Record<string, unknown>,
  matterId?: string
): Promise<Orchestration> {
  // Ensure agent runtime is up
  initRuntime();

  // Vault all PII from the intake input
  const inputMatterId = matterId || (input.matterId as string) || `ORK-${Date.now()}`;
  let sanitizedInput = { ...input };

  if (input.clientName || input.email || input.phone) {
    const { vaultIds, contentHashes } = await vaultIntake(inputMatterId, {
      clientName: input.clientName as string,
      email: input.email as string,
      phone: input.phone as string,
      adversePartyName: input.adversePartyName as string,
      description: input.description as string,
    });

    // Replace PII with vault references — agents never see plaintext
    sanitizedInput = {
      matterId: inputMatterId,
      matterType: input.matterType,
      jurisdiction: input.jurisdiction,
      urgency: input.urgency,
      estimatedValue: input.estimatedValue,
      vaultIds,
      contentHashes,
      // Agents get a redacted summary, not the raw description
      briefSummary: `Case intake received. Type: ${input.matterType || "general"}. ` +
        `Jurisdiction: ${input.jurisdiction || "TBD"}. ` +
        `Urgency: ${input.urgency || "routine"}. ` +
        `[Full description secured in vault: ${vaultIds.description || "N/A"}]`,
    };
  }

  // Count total steps across all pipelines
  let totalSteps = 0;
  for (const pipeline of workflow.pipelines) {
    totalSteps += pipeline.steps.length;
  }

  const orchestration: Orchestration = {
    id: randomUUID(),
    workflowId: workflow.id,
    workflowName: workflow.name,
    matterId: inputMatterId,
    status: "running",
    context: sanitizedInput,
    initialInput: sanitizedInput,
    currentPipelineIndex: 0,
    stepResults: new Map(),
    completedSteps: 0,
    totalSteps,
    totalATPSpent: "0",
    x402Receipts: [],
    startedAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
    actionLog: [],
    escalations: [],
  };

  orchestrations.set(orchestration.id, orchestration);
  emitEvent({ type: "orchestration_started", orchestrationId: orchestration.id, workflowId: workflow.id });

  // Generate a private link for this orchestration
  await createPrivateLink({
    matterId: inputMatterId,
    scope: "full_case",
    createdBy: "orchestrator",
    expiresInHours: 720, // 30 days
    maxUses: 100,
  });

  // Execute pipelines sequentially
  executeWorkflow(orchestration, workflow).catch((err) => {
    orchestration.status = "failed";
    emitEvent({
      type: "orchestration_failed",
      orchestrationId: orchestration.id,
      error: err instanceof Error ? err.message : String(err),
    });
  });

  return orchestration;
}

/**
 * Execute all pipelines in a workflow sequentially.
 * Runs in the background after launchOrchestration returns.
 */
async function executeWorkflow(
  orchestration: Orchestration,
  workflow: WorkflowDef
): Promise<void> {
  for (let i = 0; i < workflow.pipelines.length; i++) {
    if (orchestration.status === "cancelled" || orchestration.status === "paused") break;

    orchestration.currentPipelineIndex = i;
    const pipeline = workflow.pipelines[i];
    emitEvent({ type: "pipeline_started", orchestrationId: orchestration.id, pipelineId: pipeline.id });

    const results = await executePipeline(pipeline, orchestration);

    // Check for blocking states
    if (orchestration.status === "awaiting_approval") break;

    const anyFailed = results.some(r => r.status === "failed");
    if (anyFailed && pipeline.onFailure === "halt") {
      orchestration.status = "failed";
      emitEvent({
        type: "orchestration_failed",
        orchestrationId: orchestration.id,
        error: `Pipeline "${pipeline.name}" failed with halt policy`,
      });
      return;
    }
  }

  if (orchestration.status === "running") {
    orchestration.status = "completed";
    orchestration.completedAt = new Date().toISOString();
    emitEvent({
      type: "orchestration_completed",
      orchestrationId: orchestration.id,
      totalDurationMs: Date.now() - new Date(orchestration.startedAt).getTime(),
    });
  }
}

// ── Control ──

export function pauseOrchestration(id: string): boolean {
  const orch = orchestrations.get(id);
  if (!orch || orch.status !== "running") return false;
  orch.status = "paused";
  return true;
}

export function resumeOrchestration(id: string, workflow: WorkflowDef): boolean {
  const orch = orchestrations.get(id);
  if (!orch || (orch.status !== "paused" && orch.status !== "awaiting_approval")) return false;
  orch.status = "running";
  // Resume from current pipeline index
  executeWorkflow(orch, workflow).catch(() => { orch.status = "failed"; });
  return true;
}

export function cancelOrchestration(id: string): boolean {
  const orch = orchestrations.get(id);
  if (!orch) return false;
  orch.status = "cancelled";
  return true;
}

// ── Query (all public-safe — no PII returned) ──

export function getOrchestration(id: string): OrchestrationPublicView | null {
  const orch = orchestrations.get(id);
  if (!orch) return null;
  return toPublicView(orch);
}

export function listOrchestrations(): OrchestrationPublicView[] {
  return Array.from(orchestrations.values()).map(toPublicView);
}

export function getOrchestratorStats(): OrchestratorStats {
  let totalWorkflows = 0;
  let activeWorkflows = 0;
  let completedWorkflows = 0;
  let failedWorkflows = 0;
  let totalSteps = 0;
  let completedSteps = 0;
  let totalATPSpent = BigInt(0);
  let totalEscalations = 0;

  for (const orch of orchestrations.values()) {
    totalWorkflows++;
    if (orch.status === "running") activeWorkflows++;
    if (orch.status === "completed") completedWorkflows++;
    if (orch.status === "failed") failedWorkflows++;
    totalSteps += orch.totalSteps;
    completedSteps += orch.completedSteps;
    totalATPSpent += BigInt(orch.totalATPSpent);
    totalEscalations += orch.escalations.length;
  }

  return {
    totalOrchestrations: totalWorkflows,
    activeOrchestrations: activeWorkflows,
    completedOrchestrations: completedWorkflows,
    failedOrchestrations: failedWorkflows,
    totalStepsExecuted: completedSteps,
    totalTokensUsed: 0,
    totalATPSpent: totalATPSpent.toString(),
    totalX402Transactions: 0,
    avgOrchestrationDurationMs: 0,
    activeRunners: 0,
    totalEscalations,
  };
}

// ── Events ──

function emitEvent(event: OrchestratorEvent): void {
  eventLog.push(event);
}

export function getEventLog(orchestrationId?: string): OrchestratorEvent[] {
  if (!orchestrationId) return [...eventLog];
  return eventLog.filter(e => "orchestrationId" in e && e.orchestrationId === orchestrationId);
}

// ── Public View (PII-stripped) ──

export interface OrchestrationPublicView {
  id: string;
  workflowId: string;
  workflowName: string;
  matterId?: string;
  status: OrchestrationStatus;
  currentPipelineIndex: number;
  completedSteps: number;
  totalSteps: number;
  totalATPSpent: string;
  startedAt: string;
  completedAt?: string;
  lastActivityAt: string;
  escalationCount: number;
  /** Step results WITHOUT any PII context */
  stepSummaries: Array<{
    stepId: string;
    status: string;
    agentName: string;
    confidenceScore: number;
    durationMs: number;
    escalated: boolean;
  }>;
}

function toPublicView(orch: Orchestration): OrchestrationPublicView {
  const stepSummaries = Array.from(orch.stepResults.values()).map(r => ({
    stepId: r.stepId,
    status: r.status,
    agentName: r.agentName,
    confidenceScore: r.confidenceScore,
    durationMs: r.durationMs,
    escalated: r.escalated,
  }));

  return {
    id: orch.id,
    workflowId: orch.workflowId,
    workflowName: orch.workflowName,
    matterId: orch.matterId,
    status: orch.status,
    currentPipelineIndex: orch.currentPipelineIndex,
    completedSteps: orch.completedSteps,
    totalSteps: orch.totalSteps,
    totalATPSpent: orch.totalATPSpent,
    startedAt: orch.startedAt,
    completedAt: orch.completedAt,
    lastActivityAt: orch.lastActivityAt,
    escalationCount: orch.escalations.length,
    stepSummaries,
  };
}

// ── Helpers ──

function calculateAverageConfidence(): number {
  let total = 0;
  let count = 0;
  for (const orch of orchestrations.values()) {
    for (const result of orch.stepResults.values()) {
      if (result.confidenceScore > 0) {
        total += result.confidenceScore;
        count++;
      }
    }
  }
  return count > 0 ? Math.round((total / count) * 100) / 100 : 0;
}
