/**
 * TWIN BINDINGS
 *
 * Connects digital twins (simulation runs, model versions, scenario
 * assumptions, output artifacts) to the Truth Kernel's lifecycle.
 *
 * A TwinRun captures a deterministic execution of a model against
 * assumptions, producing output artifacts that can be attested to,
 * approved through transition gates, and trigger settlement payouts.
 *
 * Domain-agnostic: works for energy sims, financial models, RWA
 * valuations, Genesis Protocol runs, or any system where model
 * outputs drive real-world decisions.
 */

import { fingerprint } from "./state";

// ─── Types ──────────────────────────────────────────────────────────────────

export type TwinDomain =
  | "energy" | "financial" | "rwa" | "genesis" | "legal"
  | "insurance" | "infrastructure" | "environmental" | "custom";

export type RunStatus =
  | "pending" | "running" | "completed" | "failed"
  | "approved" | "rejected" | "superseded";

export interface ModelVersion {
  id: string;
  domain: TwinDomain;
  modelName: string;
  version: string;
  description: string;
  parameterSchema: Record<string, unknown>;
  sourceHash: string;      // hash of model source/config
  createdAt: string;
  createdBy: string;
  matterId?: string;
}

export interface ScenarioAssumptions {
  id: string;
  modelVersionId: string;
  label: string;
  parameters: Record<string, unknown>;
  assumptions: Record<string, unknown>;
  assumptionFingerprint: string;
  createdAt: string;
  createdBy: string;
}

export interface TwinRun {
  id: string;
  modelVersionId: string;
  scenarioId: string;
  status: RunStatus;
  /** Determinism */
  inputFingerprint: string;
  outputFingerprint?: string;
  /** Outputs */
  outputArtifactIds: string[];   // proof layer artifact IDs
  outputSummary: Record<string, unknown>;
  /** Timing */
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  /** Approval gate */
  approvalId?: string;          // approval record ID if gated
  approvedBy?: string;
  /** Settlement trigger */
  paymentEventId?: string;      // settlement payment triggered by run
  milestoneGateId?: string;     // milestone gate met by run
  /** Lineage */
  previousRunId?: string;       // superseded run
  matterId?: string;
  createdAt: string;
  createdBy: string;
  metadata: Record<string, unknown>;
}

export interface Entitlement {
  id: string;
  twinRunId: string;
  partyId: string;
  partyName: string;
  entitlementType: "payout" | "credit" | "offset" | "rebate" | "dividend" | "royalty";
  amount: string;
  asset: string;
  condition: string;           // human-readable condition
  met: boolean;
  metAt?: string;
  matterId?: string;
  createdAt: string;
}

// ─── Storage ────────────────────────────────────────────────────────────────

const KEYS = {
  models: "unykorn_truth_twin_models",
  scenarios: "unykorn_truth_twin_scenarios",
  runs: "unykorn_truth_twin_runs",
  entitlements: "unykorn_truth_twin_entitlements",
} as const;

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

// ─── TwinRegistry ───────────────────────────────────────────────────────────

export class TwinRegistry {
  private models: ModelVersion[] = [];
  private scenarios: ScenarioAssumptions[] = [];
  private runs: TwinRun[] = [];
  private entitlements: Entitlement[] = [];
  private loaded = false;

  private ensureLoaded(): void {
    if (this.loaded) return;
    this.models = load(KEYS.models, []);
    this.scenarios = load(KEYS.scenarios, []);
    this.runs = load(KEYS.runs, []);
    this.entitlements = load(KEYS.entitlements, []);
    this.loaded = true;
  }

  private persist(): void {
    save(KEYS.models, this.models);
    save(KEYS.scenarios, this.scenarios);
    save(KEYS.runs, this.runs);
    save(KEYS.entitlements, this.entitlements);
  }

  // ─── Models ─────────────────────────────────────────────────────────

  registerModel(params: {
    domain: TwinDomain;
    modelName: string;
    version: string;
    description: string;
    parameterSchema: Record<string, unknown>;
    sourceHash: string;
    createdBy: string;
    matterId?: string;
  }): ModelVersion {
    this.ensureLoaded();
    const model: ModelVersion = {
      id: crypto.randomUUID(),
      ...params,
      createdAt: new Date().toISOString(),
    };
    this.models.push(model);
    this.persist();
    return model;
  }

  getModel(id: string): ModelVersion | null {
    this.ensureLoaded();
    return this.models.find(m => m.id === id) ?? null;
  }

  getModels(domain?: TwinDomain): ModelVersion[] {
    this.ensureLoaded();
    return domain ? this.models.filter(m => m.domain === domain) : [...this.models];
  }

  // ─── Scenarios ──────────────────────────────────────────────────────

  createScenario(params: {
    modelVersionId: string;
    label: string;
    parameters: Record<string, unknown>;
    assumptions: Record<string, unknown>;
    createdBy: string;
  }): ScenarioAssumptions {
    this.ensureLoaded();
    const scenario: ScenarioAssumptions = {
      id: crypto.randomUUID(),
      modelVersionId: params.modelVersionId,
      label: params.label,
      parameters: params.parameters,
      assumptions: params.assumptions,
      assumptionFingerprint: fingerprint({ params: params.parameters, assumptions: params.assumptions }),
      createdAt: new Date().toISOString(),
      createdBy: params.createdBy,
    };
    this.scenarios.push(scenario);
    this.persist();
    return scenario;
  }

  getScenarios(modelVersionId: string): ScenarioAssumptions[] {
    this.ensureLoaded();
    return this.scenarios.filter(s => s.modelVersionId === modelVersionId);
  }

  // ─── Runs ───────────────────────────────────────────────────────────

  /** Start a new twin run. */
  startRun(params: {
    modelVersionId: string;
    scenarioId: string;
    createdBy: string;
    matterId?: string;
    previousRunId?: string;
    metadata?: Record<string, unknown>;
  }): TwinRun {
    this.ensureLoaded();

    const scenario = this.scenarios.find(s => s.id === params.scenarioId);
    const inputFingerprint = fingerprint({
      modelVersionId: params.modelVersionId,
      scenarioId: params.scenarioId,
      assumptionFingerprint: scenario?.assumptionFingerprint,
    });

    // Supersede previous run if provided
    if (params.previousRunId) {
      const prev = this.runs.find(r => r.id === params.previousRunId);
      if (prev && prev.status !== "superseded") prev.status = "superseded";
    }

    const run: TwinRun = {
      id: crypto.randomUUID(),
      modelVersionId: params.modelVersionId,
      scenarioId: params.scenarioId,
      status: "running",
      inputFingerprint,
      outputArtifactIds: [],
      outputSummary: {},
      startedAt: new Date().toISOString(),
      previousRunId: params.previousRunId,
      matterId: params.matterId,
      createdAt: new Date().toISOString(),
      createdBy: params.createdBy,
      metadata: params.metadata || {},
    };
    this.runs.push(run);
    this.persist();
    return run;
  }

  /** Complete a run with outputs. */
  completeRun(runId: string, outputs: {
    outputArtifactIds: string[];
    outputSummary: Record<string, unknown>;
  }): TwinRun | null {
    this.ensureLoaded();
    const run = this.runs.find(r => r.id === runId);
    if (!run || run.status !== "running") return run ?? null;

    run.status = "completed";
    run.outputArtifactIds = outputs.outputArtifactIds;
    run.outputSummary = outputs.outputSummary;
    run.outputFingerprint = fingerprint(outputs);
    run.completedAt = new Date().toISOString();
    run.durationMs = run.startedAt
      ? new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()
      : undefined;

    this.persist();
    return run;
  }

  /** Fail a run. */
  failRun(runId: string): void {
    this.ensureLoaded();
    const run = this.runs.find(r => r.id === runId);
    if (run && run.status === "running") {
      run.status = "failed";
      run.completedAt = new Date().toISOString();
      this.persist();
    }
  }

  /** Approve a completed run (gate for settlement triggers). */
  approveRun(runId: string, approvalId: string, approvedBy: string): void {
    this.ensureLoaded();
    const run = this.runs.find(r => r.id === runId);
    if (run && run.status === "completed") {
      run.status = "approved";
      run.approvalId = approvalId;
      run.approvedBy = approvedBy;
      this.persist();
    }
  }

  /** Link a settlement payment to a run. */
  linkPayment(runId: string, paymentEventId: string, milestoneGateId?: string): void {
    this.ensureLoaded();
    const run = this.runs.find(r => r.id === runId);
    if (run) {
      run.paymentEventId = paymentEventId;
      if (milestoneGateId) run.milestoneGateId = milestoneGateId;
      this.persist();
    }
  }

  getRun(id: string): TwinRun | null {
    this.ensureLoaded();
    return this.runs.find(r => r.id === id) ?? null;
  }

  getRuns(matterId?: string): TwinRun[] {
    this.ensureLoaded();
    return matterId
      ? this.runs.filter(r => r.matterId === matterId)
      : [...this.runs];
  }

  // ─── Entitlements ─────────────────────────────────────────────────

  /** Create an entitlement derived from a twin run. */
  createEntitlement(params: {
    twinRunId: string;
    partyId: string;
    partyName: string;
    entitlementType: Entitlement["entitlementType"];
    amount: string;
    asset: string;
    condition: string;
    matterId?: string;
  }): Entitlement {
    this.ensureLoaded();
    const ent: Entitlement = {
      id: crypto.randomUUID(),
      ...params,
      met: false,
      createdAt: new Date().toISOString(),
    };
    this.entitlements.push(ent);
    this.persist();
    return ent;
  }

  /** Mark an entitlement condition as met. */
  meetEntitlement(id: string): void {
    this.ensureLoaded();
    const ent = this.entitlements.find(e => e.id === id);
    if (ent && !ent.met) {
      ent.met = true;
      ent.metAt = new Date().toISOString();
      this.persist();
    }
  }

  getEntitlements(twinRunId: string): Entitlement[] {
    this.ensureLoaded();
    return this.entitlements.filter(e => e.twinRunId === twinRunId);
  }

  // ─── Stats ────────────────────────────────────────────────────────

  get modelCount(): number { this.ensureLoaded(); return this.models.length; }
  get runCount(): number { this.ensureLoaded(); return this.runs.length; }
  get completedRunCount(): number {
    this.ensureLoaded();
    return this.runs.filter(r => r.status === "completed" || r.status === "approved").length;
  }
  get entitlementCount(): number { this.ensureLoaded(); return this.entitlements.length; }

  /** Purge all twin data. */
  reset(): void {
    this.models = []; this.scenarios = []; this.runs = []; this.entitlements = [];
    this.loaded = true;
    if (typeof window === "undefined") return;
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  }
}
