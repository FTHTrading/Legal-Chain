/**
 * Orchestrator Type System
 *
 * Defines the full type surface for the UNYKORN // LAW agentic
 * orchestrator — workflows, pipelines, x402 runners, and multi-agent
 * coordination primitives.
 */

import type { Agent, AgentActionLog } from "../schemas/agent";

// ── Execution Status ──

export type StepStatus =
  | "pending"
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "skipped"
  | "awaiting_approval"
  | "escalated"
  | "cancelled";

export type OrchestrationStatus =
  | "draft"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled"
  | "awaiting_approval";

// ── Pipeline Patterns ──

export type PipelinePattern =
  | "sequential"    // Steps execute in order
  | "parallel"      // Steps execute concurrently
  | "conditional"   // Branch based on prior results
  | "fan_out"       // Distribute to multiple agents
  | "fan_in"        // Aggregate multiple agent results
  | "retry"         // Retry failed step with backoff
  | "approval_gate" // Halt until human approves
  | "loop";         // Iterate until condition met

// ── Step Definition ──

export interface StepDef {
  id: string;
  name: string;
  description?: string;

  // Routing
  agentTeam: string;            // Which team handles this step
  agentId?: string;             // Pin to specific agent (optional)
  instruction: string;          // What to tell the agent
  contextBuilder?: string;      // Key for dynamic context assembly

  // Dependencies
  dependsOn?: string[];         // Step IDs that must complete first
  condition?: StepCondition;    // Conditional execution

  // Governance
  requiresApproval?: boolean;
  maxRetries?: number;
  timeoutMs?: number;
  minConfidence?: number;       // Escalate if agent confidence below this

  // x402
  estimatedCostATP?: string;    // Estimated ATP cost for this step
  x402Action?: X402Action;      // Payment action to execute

  // Output
  outputKey?: string;           // Store result under this key in context
}

export interface StepCondition {
  type: "output_contains" | "confidence_above" | "confidence_below" | "step_succeeded" | "step_failed" | "custom";
  stepId?: string;
  value?: string | number;
  evaluator?: string;           // For custom: function key
}

// ── Step Execution Result ──

export interface StepResult {
  stepId: string;
  status: StepStatus;
  agentId: string;
  agentName: string;
  output: string;
  confidenceScore: number;
  toolCallsMade: number;
  tokensUsed: number;
  model: string;
  durationMs: number;
  escalated: boolean;
  escalationReason?: string;
  retryCount: number;
  x402Receipt?: X402Receipt;
  error?: string;
  timestamp: string;
}

// ── Pipeline Definition ──

export interface PipelineDef {
  id: string;
  name: string;
  description?: string;
  pattern: PipelinePattern;
  steps: StepDef[];
  onFailure?: "halt" | "skip" | "retry" | "escalate";
  maxConcurrency?: number;      // For parallel patterns
}

// ── Workflow Definition ──

export interface WorkflowDef {
  id: string;
  name: string;
  description: string;
  version: string;
  category: "intake" | "litigation" | "investigation" | "forensics" | "compliance" | "operations";

  // Execution
  pipelines: PipelineDef[];
  globalContext?: Record<string, unknown>;

  // Governance
  requiresSupervisingAttorney: boolean;
  approvalGates: string[];      // Step IDs where human approval is mandatory

  // x402
  estimatedTotalATP?: string;
  x402Enabled: boolean;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

// ── Orchestration Instance ──

export interface Orchestration {
  id: string;
  workflowId: string;
  workflowName: string;
  matterId?: string;
  status: OrchestrationStatus;

  // Context
  context: Record<string, unknown>;  // Shared context across all steps
  initialInput: Record<string, unknown>;

  // Progress
  currentPipelineIndex: number;
  stepResults: Map<string, StepResult>;
  completedSteps: number;
  totalSteps: number;

  // x402
  totalATPSpent: string;
  x402Receipts: X402Receipt[];

  // Timing
  startedAt: string;
  completedAt?: string;
  lastActivityAt: string;

  // Audit
  actionLog: AgentActionLog[];
  escalations: EscalationRecord[];
}

// ── x402 Payment Types ──

export type X402ActionType =
  | "court_filing_fee"
  | "research_subscription"
  | "expert_witness_deposit"
  | "forensic_analysis"
  | "document_service"
  | "case_registration"
  | "evidence_preservation"
  | "chain_anchor"
  | "agent_operation";

export interface X402Action {
  type: X402ActionType;
  description: string;
  amount: string;                // ATP amount as string (u128)
  asset: "ATP" | "UNY" | "USDF";
  recipient?: string;            // Agent UUID or external address
  matterId?: string;
  requiresPreApproval: boolean;
}

export interface X402Receipt {
  txHash: string;
  from: string;
  to: string;
  asset: string;
  amount: string;
  action: X402ActionType;
  matterId?: string;
  stepId?: string;
  timestamp: string;
  blockHeight?: number;
  settled: boolean;
}

// ── Runner Definition ──

export interface RunnerDef {
  id: string;
  name: string;
  team: string;
  agentId: string;                 // Apostle Chain agent UUID
  walletAddress?: string;
  atpBalance: string;
  capabilities: string[];
  x402Enabled: boolean;
  maxConcurrentTasks: number;
  status: "active" | "idle" | "busy" | "offline" | "suspended";
  lastHeartbeat: string;
}

// ── Escalation ──

export interface EscalationRecord {
  id: string;
  orchestrationId: string;
  stepId: string;
  agentId: string;
  reason: string;
  severity: "low" | "medium" | "high" | "critical";
  escalateTo: string;
  status: "open" | "acknowledged" | "resolved" | "overridden";
  context: Record<string, unknown>;
  timestamp: string;
  resolvedAt?: string;
  resolution?: string;
}

// ── Orchestrator Events ──

export type OrchestratorEvent =
  | { type: "orchestration_started"; orchestrationId: string; workflowId: string }
  | { type: "pipeline_started"; orchestrationId: string; pipelineId: string }
  | { type: "step_started"; orchestrationId: string; stepId: string; agentId: string }
  | { type: "step_completed"; orchestrationId: string; stepId: string; result: StepResult }
  | { type: "step_failed"; orchestrationId: string; stepId: string; error: string }
  | { type: "step_escalated"; orchestrationId: string; stepId: string; reason: string }
  | { type: "approval_required"; orchestrationId: string; stepId: string }
  | { type: "x402_payment"; orchestrationId: string; receipt: X402Receipt }
  | { type: "orchestration_completed"; orchestrationId: string; totalDurationMs: number }
  | { type: "orchestration_failed"; orchestrationId: string; error: string };

// ── Orchestrator Stats ──

export interface OrchestratorStats {
  totalOrchestrations: number;
  activeOrchestrations: number;
  completedOrchestrations: number;
  failedOrchestrations: number;
  totalStepsExecuted: number;
  totalTokensUsed: number;
  totalATPSpent: string;
  totalX402Transactions: number;
  avgOrchestrationDurationMs: number;
  activeRunners: number;
  totalEscalations: number;
}
