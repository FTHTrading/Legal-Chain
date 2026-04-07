import { z } from "zod";

// ── Workflow Type ──

export const WorkflowType = z.enum([
  "case_intake",
  "evidence_ingestion",
  "document_generation",
  "document_review",
  "filing_preparation",
  "discovery_management",
  "settlement_negotiation",
  "trial_preparation",
  "appeal_preparation",
  "client_communication",
  "research_assignment",
  "forensic_investigation",
  "compliance_check",
  "custom",
]);

// ── Task Status ──

export const TaskStatus = z.enum([
  "pending",
  "assigned",
  "in_progress",
  "blocked",
  "awaiting_approval",
  "completed",
  "failed",
  "cancelled",
  "skipped",
]);

// ── Task Priority ──

export const TaskPriority = z.enum(["low", "normal", "high", "urgent", "court_deadline"]);

// ── Task Definition ──

export const TaskSchema = z.object({
  id: z.string().uuid(),
  workflowId: z.string().uuid(),
  matterId: z.string().uuid(),

  // Task info
  title: z.string(),
  description: z.string().optional(),
  taskType: z.string(), // free-form type label

  // Assignment
  assignedTo: z.string().uuid().optional(), // user ID
  assignedToName: z.string().optional(),
  assignedToAgent: z.string().optional(), // agent ID if automated
  requiredRole: z.string().optional(),

  // Status
  status: TaskStatus,
  priority: TaskPriority.default("normal"),

  // Dependencies
  dependsOn: z.array(z.string().uuid()).default([]), // task IDs
  blockedBy: z.string().uuid().optional(),
  blockedReason: z.string().optional(),

  // Evidence / outputs
  inputs: z.array(z.object({
    type: z.string(),
    referenceId: z.string().uuid().optional(),
    label: z.string(),
  })).default([]),
  outputs: z.array(z.object({
    type: z.string(),
    referenceId: z.string().uuid().optional(),
    label: z.string(),
  })).default([]),

  // Approval gate
  requiresApproval: z.boolean().default(false),
  approvalId: z.string().uuid().optional(),

  // Timestamps
  createdAt: z.string().datetime(),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  dueDate: z.string().optional(),

  // Notes
  notes: z.string().optional(),
});
export type Task = z.infer<typeof TaskSchema>;

// ── Workflow ──

export const WorkflowSchema = z.object({
  id: z.string().uuid(),
  matterId: z.string().uuid(),
  matterTitle: z.string().optional(),

  // Workflow definition
  workflowType: WorkflowType,
  title: z.string(),
  description: z.string().optional(),

  // Status
  status: z.enum(["draft", "active", "paused", "completed", "failed", "cancelled"]),

  // Tasks
  tasks: z.array(TaskSchema).default([]),
  completedTasks: z.number().int().default(0),
  totalTasks: z.number().int().default(0),

  // Ownership
  createdBy: z.string().uuid(),
  createdByName: z.string(),
  supervisorId: z.string().uuid().optional(),
  supervisorName: z.string().optional(),

  // Timestamps
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  dueDate: z.string().optional(),
});
export type Workflow = z.infer<typeof WorkflowSchema>;
