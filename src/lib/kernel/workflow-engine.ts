/**
 * LEGAL WORKFLOW ENGINE
 *
 * Codifies the Legal Reliability Pipeline (Constitution §VIII)
 * and approval lifecycle into executable workflow steps.
 *
 * Workflow = ordered pipeline stages with gate conditions,
 * role requirements, timeout deadlines, and audit trails.
 * Each stage must pass before the next can begin.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type PipelineStage =
  | "retrieve_facts"         // §VIII step 1
  | "tag_facts"              // §VIII step 2
  | "retrieve_authorities"   // §VIII step 3
  | "validate_authorities"   // §VIII step 4
  | "build_issue_map"        // §VIII step 5
  | "score_confidence"       // §VIII step 6
  | "generate_draft"         // §VIII step 7
  | "run_validations"        // §VIII step 8
  | "package_for_approval";  // Final gate

export type StageStatus =
  | "pending" | "in_progress" | "completed"
  | "failed" | "skipped" | "blocked";

export type WorkflowStatus =
  | "not_started" | "in_progress" | "awaiting_approval"
  | "approved" | "rejected" | "completed" | "cancelled";

export type ApprovalDecision = "approved" | "rejected" | "returned_for_revision";

export interface StageGate {
  /** Role required to advance past this stage */
  requiredRole?: string;
  /** Must have human approval to proceed */
  requiresHumanApproval: boolean;
  /** Maximum hours before escalation */
  timeoutHours?: number;
  /** Preceding stages that must be completed */
  dependsOn: PipelineStage[];
}

export interface StageRecord {
  stage: PipelineStage;
  status: StageStatus;
  startedAt?: string;
  completedAt?: string;
  completedBy?: string;
  completedByRole?: string;
  notes?: string;
  artifacts: string[];  // IDs of evidence/documents produced
  validationErrors: string[];
}

export interface ApprovalRecord {
  id: string;
  workflowId: string;
  decision: ApprovalDecision;
  decidedBy: string;
  decidedByRole: string;
  decidedAt: string;
  reason: string;
  conditions?: string[];  // conditions imposed with approval
}

export interface Workflow {
  id: string;
  matterId: string;
  workflowType: "legal_reliability" | "document_approval" | "evidence_review"
    | "filing_preparation" | "settlement_review" | "client_communication";
  status: WorkflowStatus;
  stages: StageRecord[];
  approvals: ApprovalRecord[];
  assignedTo: string;
  assignedToRole: string;
  supervisingAttorney: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  deadline?: string;
  priority: "critical" | "high" | "normal" | "low";
  metadata: Record<string, unknown>;
}

// ─── Pipeline Gate Definitions ──────────────────────────────────────────────

const PIPELINE_GATES: Record<PipelineStage, StageGate> = {
  retrieve_facts: {
    requiresHumanApproval: false,
    dependsOn: [],
  },
  tag_facts: {
    requiresHumanApproval: false,
    dependsOn: ["retrieve_facts"],
  },
  retrieve_authorities: {
    requiresHumanApproval: false,
    dependsOn: ["tag_facts"],
  },
  validate_authorities: {
    requiresHumanApproval: false,
    dependsOn: ["retrieve_authorities"],
  },
  build_issue_map: {
    requiresHumanApproval: false,
    dependsOn: ["validate_authorities"],
  },
  score_confidence: {
    requiresHumanApproval: false,
    dependsOn: ["build_issue_map"],
  },
  generate_draft: {
    requiresHumanApproval: false,
    dependsOn: ["score_confidence"],
    timeoutHours: 24,
  },
  run_validations: {
    requiresHumanApproval: false,
    dependsOn: ["generate_draft"],
  },
  package_for_approval: {
    requiredRole: "attorney",
    requiresHumanApproval: true,
    dependsOn: ["run_validations"],
    timeoutHours: 48,
  },
};

export const STAGE_ORDER: PipelineStage[] = [
  "retrieve_facts", "tag_facts", "retrieve_authorities",
  "validate_authorities", "build_issue_map", "score_confidence",
  "generate_draft", "run_validations", "package_for_approval",
];

// ─── Storage ────────────────────────────────────────────────────────────────

const KEYS = { workflows: "unykorn_workflows" } as const;

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}

function save(key: string, data: unknown): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(data)); }
  catch { /* storage full */ }
}

// ─── WorkflowEngine ─────────────────────────────────────────────────────────

export class WorkflowEngine {
  private workflows: Workflow[] = [];
  private loaded = false;

  private ensureLoaded(): void {
    if (this.loaded) return;
    this.workflows = load(KEYS.workflows, []);
    this.loaded = true;
  }

  private persist(): void {
    save(KEYS.workflows, this.workflows);
  }

  // ─── Create ────────────────────────────────────────────────────────

  createWorkflow(params: {
    matterId: string;
    workflowType: Workflow["workflowType"];
    assignedTo: string;
    assignedToRole: string;
    supervisingAttorney: string;
    priority: Workflow["priority"];
    deadline?: string;
    metadata?: Record<string, unknown>;
  }): Workflow {
    this.ensureLoaded();
    const now = new Date().toISOString();

    const stages: StageRecord[] = STAGE_ORDER.map(stage => ({
      stage,
      status: "pending" as StageStatus,
      artifacts: [],
      validationErrors: [],
    }));

    const wf: Workflow = {
      id: crypto.randomUUID(),
      matterId: params.matterId,
      workflowType: params.workflowType,
      status: "not_started",
      stages,
      approvals: [],
      assignedTo: params.assignedTo,
      assignedToRole: params.assignedToRole,
      supervisingAttorney: params.supervisingAttorney,
      createdAt: now,
      updatedAt: now,
      deadline: params.deadline,
      priority: params.priority,
      metadata: params.metadata || {},
    };

    this.workflows.push(wf);
    this.persist();
    return wf;
  }

  // ─── Stage Advancement ─────────────────────────────────────────────

  /** Check if a stage can be started. */
  canStartStage(workflowId: string, stage: PipelineStage): { allowed: boolean; reason?: string } {
    this.ensureLoaded();
    const wf = this.workflows.find(w => w.id === workflowId);
    if (!wf) return { allowed: false, reason: "Workflow not found" };
    if (wf.status === "cancelled") return { allowed: false, reason: "Workflow cancelled" };

    const gate = PIPELINE_GATES[stage];
    const stageRec = wf.stages.find(s => s.stage === stage);
    if (!stageRec) return { allowed: false, reason: "Stage not found" };
    if (stageRec.status === "completed") return { allowed: false, reason: "Stage already completed" };

    // Check dependencies
    for (const dep of gate.dependsOn) {
      const depRec = wf.stages.find(s => s.stage === dep);
      if (!depRec || depRec.status !== "completed") {
        return { allowed: false, reason: `Dependency '${dep}' not completed` };
      }
    }

    return { allowed: true };
  }

  /** Start a pipeline stage. */
  startStage(workflowId: string, stage: PipelineStage): StageRecord | null {
    const check = this.canStartStage(workflowId, stage);
    if (!check.allowed) return null;

    const wf = this.workflows.find(w => w.id === workflowId)!;
    const rec = wf.stages.find(s => s.stage === stage)!;

    rec.status = "in_progress";
    rec.startedAt = new Date().toISOString();

    if (wf.status === "not_started") wf.status = "in_progress";
    wf.updatedAt = new Date().toISOString();
    this.persist();
    return rec;
  }

  /** Complete a pipeline stage (optionally attaching artifacts). */
  completeStage(workflowId: string, stage: PipelineStage, params: {
    completedBy: string;
    completedByRole: string;
    notes?: string;
    artifacts?: string[];
  }): StageRecord | null {
    this.ensureLoaded();
    const wf = this.workflows.find(w => w.id === workflowId);
    if (!wf) return null;

    const rec = wf.stages.find(s => s.stage === stage);
    if (!rec || rec.status !== "in_progress") return null;

    const gate = PIPELINE_GATES[stage];
    if (gate.requiredRole && params.completedByRole !== gate.requiredRole) return null;

    rec.status = "completed";
    rec.completedAt = new Date().toISOString();
    rec.completedBy = params.completedBy;
    rec.completedByRole = params.completedByRole;
    rec.notes = params.notes;
    if (params.artifacts) rec.artifacts.push(...params.artifacts);

    // If final stage → workflow awaiting approval
    if (stage === "package_for_approval") {
      wf.status = "awaiting_approval";
    }

    wf.updatedAt = new Date().toISOString();
    this.persist();
    return rec;
  }

  /** Fail a pipeline stage with errors. */
  failStage(workflowId: string, stage: PipelineStage, errors: string[]): StageRecord | null {
    this.ensureLoaded();
    const wf = this.workflows.find(w => w.id === workflowId);
    if (!wf) return null;

    const rec = wf.stages.find(s => s.stage === stage);
    if (!rec || rec.status !== "in_progress") return null;

    rec.status = "failed";
    rec.validationErrors = errors;
    wf.updatedAt = new Date().toISOString();
    this.persist();
    return rec;
  }

  // ─── Approval ──────────────────────────────────────────────────────

  /** Record an approval decision on a workflow. */
  recordApproval(workflowId: string, params: {
    decision: ApprovalDecision;
    decidedBy: string;
    decidedByRole: string;
    reason: string;
    conditions?: string[];
  }): ApprovalRecord | null {
    this.ensureLoaded();
    const wf = this.workflows.find(w => w.id === workflowId);
    if (!wf || wf.status !== "awaiting_approval") return null;

    // Only attorney or supervising_attorney can approve
    if (!["attorney", "supervising_attorney", "system_admin"].includes(params.decidedByRole)) return null;

    const record: ApprovalRecord = {
      id: crypto.randomUUID(),
      workflowId,
      decision: params.decision,
      decidedBy: params.decidedBy,
      decidedByRole: params.decidedByRole,
      decidedAt: new Date().toISOString(),
      reason: params.reason,
      conditions: params.conditions,
    };

    wf.approvals.push(record);

    if (params.decision === "approved") {
      wf.status = "approved";
      wf.completedAt = new Date().toISOString();
    } else if (params.decision === "rejected") {
      wf.status = "rejected";
    } else {
      // returned_for_revision — reset package_for_approval
      wf.status = "in_progress";
      const pkg = wf.stages.find(s => s.stage === "package_for_approval");
      if (pkg) {
        pkg.status = "pending";
        pkg.completedAt = undefined;
        pkg.completedBy = undefined;
      }
    }

    wf.updatedAt = new Date().toISOString();
    this.persist();
    return record;
  }

  // ─── Queries ───────────────────────────────────────────────────────

  get(id: string): Workflow | null {
    this.ensureLoaded();
    return this.workflows.find(w => w.id === id) ?? null;
  }

  getForMatter(matterId: string): Workflow[] {
    this.ensureLoaded();
    return this.workflows.filter(w => w.matterId === matterId);
  }

  getAwaitingApproval(): Workflow[] {
    this.ensureLoaded();
    return this.workflows.filter(w => w.status === "awaiting_approval");
  }

  getOverdue(): Workflow[] {
    this.ensureLoaded();
    const now = new Date().toISOString();
    return this.workflows.filter(w =>
      w.deadline && w.deadline < now && !["completed", "cancelled", "approved"].includes(w.status)
    );
  }

  currentStage(workflowId: string): PipelineStage | null {
    this.ensureLoaded();
    const wf = this.workflows.find(w => w.id === workflowId);
    if (!wf) return null;
    const inProgress = wf.stages.find(s => s.status === "in_progress");
    if (inProgress) return inProgress.stage;
    const nextPending = wf.stages.find(s => s.status === "pending");
    return nextPending?.stage ?? null;
  }

  /** Pipeline progress: 0-100 */
  progress(workflowId: string): number {
    this.ensureLoaded();
    const wf = this.workflows.find(w => w.id === workflowId);
    if (!wf) return 0;
    const completed = wf.stages.filter(s => s.status === "completed").length;
    return Math.round((completed / wf.stages.length) * 100);
  }

  // ─── Stats ────────────────────────────────────────────────────────

  get allWorkflows(): Workflow[] { this.ensureLoaded(); return [...this.workflows]; }
  get workflowCount(): number { this.ensureLoaded(); return this.workflows.length; }
  get awaitingCount(): number { return this.getAwaitingApproval().length; }
  get overdueCount(): number { return this.getOverdue().length; }

  cancel(workflowId: string, reason: string): void {
    this.ensureLoaded();
    const wf = this.workflows.find(w => w.id === workflowId);
    if (!wf || wf.status === "completed" || wf.status === "cancelled") return;
    wf.status = "cancelled";
    wf.updatedAt = new Date().toISOString();
    wf.metadata.cancelReason = reason;
    this.persist();
  }

  reset(): void {
    this.workflows = [];
    this.loaded = true;
    if (typeof window !== "undefined") localStorage.removeItem(KEYS.workflows);
  }
}
