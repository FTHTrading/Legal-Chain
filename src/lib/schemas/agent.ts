import { z } from "zod";

// ── Agent Team ──

export const AgentTeam = z.enum([
  "case_strategy",
  "document_drafting",
  "legal_research",
  "evidence_analysis",
  "client_communications",
  "compliance_audit",
  "forensic_intelligence",
  "workflow_orchestration",
  "infrastructure",
]);

// ── Agent Status ──

export const AgentStatus = z.enum([
  "active",
  "idle",
  "busy",
  "degraded",
  "offline",
  "disabled",
]);

// ── Escalation Trigger ──

export const EscalationTriggerSchema = z.object({
  condition: z.string(), // human-readable condition
  triggerType: z.enum([
    "confidence_below_threshold",
    "privileged_content_detected",
    "court_deadline_imminent",
    "conflicting_authority",
    "novel_legal_issue",
    "high_value_action",
    "client_facing_content",
    "error_or_failure",
    "ethical_concern",
  ]),
  threshold: z.number().optional(),
  escalateTo: z.enum(["supervising_attorney", "case_strategist", "paralegal", "system_admin"]),
  notifyImmediately: z.boolean().default(false),
});
export type EscalationTrigger = z.infer<typeof EscalationTriggerSchema>;

// ── Agent Capability ──

export const AgentCapabilitySchema = z.object({
  name: z.string(),
  description: z.string(),
  inputSchema: z.record(z.string(), z.unknown()).optional(),
  outputSchema: z.record(z.string(), z.unknown()).optional(),
  requiresApproval: z.boolean().default(false),
  maxConfidenceAutoApprove: z.number().min(0).max(1).optional(),
});
export type AgentCapability = z.infer<typeof AgentCapabilitySchema>;

// ── Agent Registry Entry ──

export const AgentSchema = z.object({
  id: z.string(),
  name: z.string(),
  team: AgentTeam,
  mission: z.string(), // one-sentence mission statement

  // Capabilities
  capabilities: z.array(AgentCapabilitySchema).default([]),

  // Governance
  allowedActions: z.array(z.string()).default([]),
  forbiddenActions: z.array(z.string()).default([]),
  escalationTriggers: z.array(EscalationTriggerSchema).default([]),

  // Configuration
  modelPreference: z.string().optional(), // preferred LLM model
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().optional(),
  systemPrompt: z.string().optional(),
  tools: z.array(z.string()).default([]), // MCP tool names

  // Runtime
  status: AgentStatus.default("idle"),
  lastHeartbeat: z.string().datetime().optional(),
  currentTaskId: z.string().uuid().optional(),
  completedTasks: z.number().int().default(0),
  failedTasks: z.number().int().default(0),
  avgResponseTime: z.number().optional(), // milliseconds

  // Apostle Chain integration
  apostleAgentId: z.string().uuid().optional(),
  atpBalance: z.string().optional(),

  // Metadata
  version: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type Agent = z.infer<typeof AgentSchema>;

// ── Agent Action Log ──

export const AgentActionLogSchema = z.object({
  id: z.string().uuid(),
  agentId: z.string(),
  agentName: z.string(),
  matterId: z.string().uuid().optional(),

  // Action
  action: z.string(),
  input: z.record(z.string(), z.unknown()).optional(),
  output: z.record(z.string(), z.unknown()).optional(),

  // Result
  success: z.boolean(),
  error: z.string().optional(),
  confidenceScore: z.number().min(0).max(1).optional(),

  // Approval
  requiredApproval: z.boolean().default(false),
  approvalId: z.string().uuid().optional(),
  escalated: z.boolean().default(false),
  escalationReason: z.string().optional(),

  // Performance
  durationMs: z.number().optional(),
  tokensUsed: z.number().int().optional(),
  model: z.string().optional(),

  // Timestamp
  timestamp: z.string().datetime(),
});
export type AgentActionLog = z.infer<typeof AgentActionLogSchema>;
