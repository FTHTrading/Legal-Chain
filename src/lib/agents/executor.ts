/**
 * Agent Task Executor
 *
 * Executes a single agent task using LLM with tool calling.
 * Implements the governance loop: execute → check confidence → escalate if needed.
 */

import { randomUUID } from "crypto";
import { complete, type ChatMessage, type CompletionResponse } from "../ai/provider";
import { TEAM_MODEL_MAP, type ModelConfig } from "../ai/config";
import { TOOL_DEFINITIONS, executeTool, getToolsForTeam } from "./tools";
import type { Agent, AgentActionLog, EscalationTrigger } from "../schemas/agent";

// ── Types ──

export interface TaskRequest {
  taskId?: string;
  agent: Agent;
  instruction: string;
  context?: string;
  matterId?: string;
  maxToolCalls?: number;
}

export interface TaskResult {
  taskId: string;
  agentId: string;
  agentName: string;
  success: boolean;
  output: string;
  confidenceScore: number;
  toolCallsMade: number;
  tokensUsed: number;
  model: string;
  durationMs: number;
  escalated: boolean;
  escalationReason?: string;
  actionLog: AgentActionLog;
}

// ── Confidence Thresholds ──

const CONFIDENCE_THRESHOLDS = {
  autoApprove: 0.85,   // Above this: auto-approve output
  humanReview: 0.60,   // Between review and approve: flag for human review
  escalate: 0.40,      // Below this: escalate immediately
};

// ── Executor ──

/**
 * Execute a task with a specific agent.
 * Uses LLM function calling to let the agent use its assigned tools.
 * Loops through tool calls until the agent produces a final answer or hits max iterations.
 */
export async function executeTask(req: TaskRequest): Promise<TaskResult> {
  const start = Date.now();
  const taskId = req.taskId || randomUUID();
  const maxIterations = req.maxToolCalls || 5;

  // Get model config for this agent's team
  const modelConfig: ModelConfig = req.agent.modelPreference
    ? { ...TEAM_MODEL_MAP[req.agent.team], model: req.agent.modelPreference }
    : TEAM_MODEL_MAP[req.agent.team] || TEAM_MODEL_MAP.case_strategy;

  // Get tools available to this agent's team
  const tools = getToolsForTeam(req.agent.team);

  // Build system prompt
  const systemPrompt = buildSystemPrompt(req.agent, req.matterId);

  // Initialize conversation
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
  ];

  if (req.context) {
    messages.push({ role: "user", content: `Context:\n${req.context}` });
    messages.push({ role: "assistant", content: "Understood. I have the context. What would you like me to do?" });
  }

  messages.push({ role: "user", content: req.instruction });

  let totalTokens = 0;
  let toolCallsMade = 0;
  let lastResponse: CompletionResponse | null = null;

  // Tool-calling loop
  for (let i = 0; i < maxIterations; i++) {
    const response = await complete({
      messages,
      config: modelConfig,
      tools: tools.length > 0 ? tools : undefined,
    });

    totalTokens += response.tokensUsed;
    lastResponse = response;

    // If no tool calls, the agent is done
    if (!response.toolCalls || response.toolCalls.length === 0) {
      break;
    }

    // Execute each tool call
    for (const toolCall of response.toolCalls) {
      toolCallsMade++;
      const result = await executeTool(toolCall.name, toolCall.arguments);

      // Add tool result to conversation
      messages.push({
        role: "assistant",
        content: `[Tool Call: ${toolCall.name}(${JSON.stringify(toolCall.arguments)})]`,
      });
      messages.push({
        role: "user",
        content: `[Tool Result: ${toolCall.name}]\n${JSON.stringify(result.data, null, 2)}`,
      });
    }
  }

  const output = lastResponse?.content || "No output generated.";
  const durationMs = Date.now() - start;

  // Assess confidence
  const confidenceScore = assessConfidence(output, toolCallsMade, lastResponse);

  // Check escalation triggers
  const escalation = checkEscalation(req.agent, confidenceScore, output);

  // Build action log
  const actionLog: AgentActionLog = {
    id: randomUUID(),
    agentId: req.agent.id,
    agentName: req.agent.name,
    matterId: req.matterId,
    action: req.instruction.slice(0, 200),
    input: { instruction: req.instruction, context: req.context?.slice(0, 500) },
    output: { response: output.slice(0, 2000), toolCallsMade },
    success: true,
    confidenceScore,
    requiredApproval: confidenceScore < CONFIDENCE_THRESHOLDS.autoApprove,
    escalated: escalation.escalated,
    escalationReason: escalation.reason,
    durationMs,
    tokensUsed: totalTokens,
    model: lastResponse?.model || modelConfig.model,
    timestamp: new Date().toISOString(),
  };

  return {
    taskId,
    agentId: req.agent.id,
    agentName: req.agent.name,
    success: true,
    output,
    confidenceScore,
    toolCallsMade,
    tokensUsed: totalTokens,
    model: lastResponse?.model || modelConfig.model,
    durationMs,
    escalated: escalation.escalated,
    escalationReason: escalation.reason,
    actionLog,
  };
}

// ── Helpers ──

function buildSystemPrompt(agent: Agent, matterId?: string): string {
  const parts = [
    `You are ${agent.name}, an AI legal agent on the UNYKORN // LAW platform.`,
    `Team: ${agent.team}`,
    `Mission: ${agent.mission}`,
    "",
    "GOVERNANCE RULES:",
    "- You MUST cite sources for any legal claims",
    "- You MUST flag uncertainty with confidence qualifiers (e.g., 'likely', 'uncertain', 'requires verification')",
    "- You MUST NOT fabricate case citations or legal authorities",
    "- You MUST escalate if you encounter privileged content, ethical concerns, or novel legal issues",
    "- ALL outputs are subject to human review before any client-facing use",
    "- Confidence below 60% triggers automatic escalation to supervising attorney",
    "",
    "Use the available tools to gather information before forming your analysis.",
    "Base your conclusions on retrieved evidence and verified sources only.",
  ];

  if (agent.systemPrompt) {
    parts.push("", "ADDITIONAL INSTRUCTIONS:", agent.systemPrompt);
  }

  if (matterId) {
    parts.push("", `ACTIVE MATTER: ${matterId}`);
  }

  if (agent.forbiddenActions.length > 0) {
    parts.push("", "FORBIDDEN ACTIONS:", ...agent.forbiddenActions.map((a) => `- ${a}`));
  }

  return parts.join("\n");
}

function assessConfidence(output: string, toolCallsMade: number, response: CompletionResponse | null): number {
  let score = 0.7; // baseline

  // Tools used = more grounded
  if (toolCallsMade > 0) score += 0.05 * Math.min(toolCallsMade, 3);

  // Uncertainty markers reduce confidence
  const uncertaintyMarkers = ["uncertain", "unclear", "may not", "insufficient", "unable to determine", "no sources found"];
  for (const marker of uncertaintyMarkers) {
    if (output.toLowerCase().includes(marker)) {
      score -= 0.1;
      break;
    }
  }

  // Very short output suggests incomplete analysis
  if (output.length < 100) score -= 0.15;

  // Response finish reason
  if (response?.finishReason === "length") score -= 0.1; // truncated

  return Math.max(0.1, Math.min(0.99, score));
}

function checkEscalation(
  agent: Agent,
  confidence: number,
  output: string
): { escalated: boolean; reason?: string } {
  // Check confidence threshold
  if (confidence < CONFIDENCE_THRESHOLDS.escalate) {
    return { escalated: true, reason: `Confidence ${confidence.toFixed(2)} below escalation threshold ${CONFIDENCE_THRESHOLDS.escalate}` };
  }

  // Check agent's custom escalation triggers
  for (const trigger of agent.escalationTriggers || []) {
    if (trigger.triggerType === "confidence_below_threshold" && trigger.threshold) {
      if (confidence < trigger.threshold) {
        return { escalated: true, reason: `Agent trigger: confidence ${confidence.toFixed(2)} < ${trigger.threshold}` };
      }
    }

    if (trigger.triggerType === "privileged_content_detected") {
      const privMarkers = ["attorney-client", "work product", "privileged", "confidential"];
      if (privMarkers.some((m) => output.toLowerCase().includes(m))) {
        return { escalated: true, reason: "Privileged content detected in output" };
      }
    }

    if (trigger.triggerType === "ethical_concern") {
      const ethicsMarkers = ["conflict of interest", "ethical", "disqualification", "malpractice"];
      if (ethicsMarkers.some((m) => output.toLowerCase().includes(m))) {
        return { escalated: true, reason: "Ethical concern detected in output" };
      }
    }
  }

  return { escalated: false };
}
