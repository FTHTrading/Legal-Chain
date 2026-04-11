/**
 * Agent Runtime — Orchestrator
 *
 * Manages the lifecycle of AI agents on the legal platform.
 * Routes tasks to appropriate agents, manages concurrency,
 * tracks action logs, and enforces governance constraints.
 */

import { randomUUID } from "crypto";
import type { Agent, AgentActionLog } from "../schemas/agent";
import { executeTask, type TaskRequest, type TaskResult } from "./executor";
import { MARKETING_AGENTS } from "./marketing-roster";

// ── Runtime State ──

interface RuntimeState {
  agents: Map<string, Agent>;
  actionLog: AgentActionLog[];
  activeTasks: Map<string, TaskRequest>;
  isRunning: boolean;
  startedAt: string | null;
}

const state: RuntimeState = {
  agents: new Map(),
  actionLog: [],
  activeTasks: new Map(),
  isRunning: false,
  startedAt: null,
};

// ── Default Agent Roster ──

const DEFAULT_AGENTS: Agent[] = [
  {
    id: "agent-case-strategist",
    name: "Atlas — Case Strategist",
    team: "case_strategy",
    mission: "Analyze matters for claim viability, risk assessment, and litigation strategy.",
    capabilities: [
      { name: "claim_analysis", description: "Evaluate legal claims for strength and viability", requiresApproval: false },
      { name: "risk_assessment", description: "Assess litigation risk factors", requiresApproval: false },
      { name: "strategy_recommendation", description: "Recommend litigation strategies", requiresApproval: true },
    ],
    allowedActions: ["search_legal_knowledge", "get_matter_details", "get_case_list", "analyze_evidence", "settlement_summary"],
    forbiddenActions: ["Send communications to opposing parties", "File court documents", "Modify settlement amounts"],
    escalationTriggers: [
      { condition: "Low confidence on strategy recommendation", triggerType: "confidence_below_threshold", threshold: 0.70, escalateTo: "supervising_attorney", notifyImmediately: false },
      { condition: "Novel legal issue detected", triggerType: "novel_legal_issue", escalateTo: "supervising_attorney", notifyImmediately: true },
    ],
    tools: ["search_legal_knowledge", "get_matter_details", "get_case_list", "analyze_evidence", "settlement_summary"],
    status: "active",
    completedTasks: 0,
    failedTasks: 0,
    version: "1.0.0",
    createdAt: new Date().toISOString(),
  },
  {
    id: "agent-legal-researcher",
    name: "Lexis — Legal Researcher",
    team: "legal_research",
    mission: "Conduct deep legal research — case law mining, precedent analysis, statutory interpretation.",
    capabilities: [
      { name: "case_law_search", description: "Search and analyze case law", requiresApproval: false },
      { name: "statutory_analysis", description: "Interpret statutes and regulations", requiresApproval: false },
      { name: "precedent_mapping", description: "Map relevant precedent chains", requiresApproval: false },
    ],
    allowedActions: ["search_legal_knowledge", "get_matter_details", "get_case_list"],
    forbiddenActions: ["Draft legal documents", "Communicate with clients", "Modify case data"],
    escalationTriggers: [
      { condition: "Conflicting authority found", triggerType: "conflicting_authority", escalateTo: "supervising_attorney", notifyImmediately: true },
      { condition: "Confidence below threshold", triggerType: "confidence_below_threshold", threshold: 0.65, escalateTo: "case_strategist", notifyImmediately: false },
    ],
    tools: ["search_legal_knowledge", "get_matter_details", "get_case_list"],
    status: "active",
    completedTasks: 0,
    failedTasks: 0,
    version: "1.0.0",
    createdAt: new Date().toISOString(),
  },
  {
    id: "agent-evidence-analyst",
    name: "Sentinel — Evidence Analyst",
    team: "evidence_analysis",
    mission: "Analyze evidence for relevance, authenticity, privilege, and chain-of-custody integrity.",
    capabilities: [
      { name: "evidence_classification", description: "Classify evidence by type and relevance", requiresApproval: false },
      { name: "authenticity_check", description: "Assess evidence authenticity indicators", requiresApproval: false },
      { name: "privilege_screening", description: "Screen for privileged content", requiresApproval: true },
    ],
    allowedActions: ["analyze_evidence", "search_legal_knowledge", "get_matter_details", "get_forensic_case"],
    forbiddenActions: ["Delete evidence", "Modify custody chain", "Waive privilege"],
    escalationTriggers: [
      { condition: "Privileged content detected", triggerType: "privileged_content_detected", escalateTo: "supervising_attorney", notifyImmediately: true },
      { condition: "Confidence below threshold", triggerType: "confidence_below_threshold", threshold: 0.70, escalateTo: "supervising_attorney", notifyImmediately: false },
    ],
    tools: ["analyze_evidence", "search_legal_knowledge", "get_matter_details", "get_forensic_case"],
    status: "active",
    completedTasks: 0,
    failedTasks: 0,
    version: "1.0.0",
    createdAt: new Date().toISOString(),
  },
  {
    id: "agent-document-drafter",
    name: "Scribe — Document Drafter",
    team: "document_drafting",
    mission: "Draft legal documents, briefs, and correspondence under attorney supervision.",
    capabilities: [
      { name: "draft_brief", description: "Draft legal briefs and memoranda", requiresApproval: true },
      { name: "draft_correspondence", description: "Draft client correspondence", requiresApproval: true },
      { name: "draft_pleading", description: "Draft court pleadings", requiresApproval: true },
    ],
    allowedActions: ["search_legal_knowledge", "get_matter_details", "get_case_list"],
    forbiddenActions: ["File documents without review", "Send client communications", "Sign documents"],
    escalationTriggers: [
      { condition: "Client-facing content", triggerType: "client_facing_content", escalateTo: "supervising_attorney", notifyImmediately: false },
      { condition: "Ethical concern in draft", triggerType: "ethical_concern", escalateTo: "supervising_attorney", notifyImmediately: true },
    ],
    tools: ["search_legal_knowledge", "get_matter_details", "get_case_list"],
    status: "active",
    completedTasks: 0,
    failedTasks: 0,
    version: "1.0.0",
    createdAt: new Date().toISOString(),
  },
  {
    id: "agent-forensic-analyst",
    name: "Trace — Forensic Analyst",
    team: "forensic_intelligence",
    mission: "Trace cryptocurrency transactions, analyze wallet clusters, and identify asset flows.",
    capabilities: [
      { name: "wallet_trace", description: "Trace wallet transactions across blockchains", requiresApproval: false },
      { name: "cluster_analysis", description: "Identify related wallet clusters", requiresApproval: false },
      { name: "risk_scoring", description: "Score wallets for fraud/sanctions risk", requiresApproval: false },
    ],
    allowedActions: ["get_forensic_case", "search_legal_knowledge", "get_matter_details"],
    forbiddenActions: ["Freeze assets", "Contact exchanges directly", "File regulatory reports"],
    escalationTriggers: [
      { condition: "High-risk wallet detected", triggerType: "high_value_action", escalateTo: "supervising_attorney", notifyImmediately: true },
    ],
    tools: ["get_forensic_case", "search_legal_knowledge", "get_matter_details"],
    status: "active",
    completedTasks: 0,
    failedTasks: 0,
    version: "1.0.0",
    createdAt: new Date().toISOString(),
  },
  {
    id: "agent-compliance-auditor",
    name: "Guardian — Compliance Auditor",
    team: "compliance_audit",
    mission: "Monitor system compliance, audit agent actions, and ensure governance adherence.",
    capabilities: [
      { name: "action_audit", description: "Audit agent action logs for compliance", requiresApproval: false },
      { name: "governance_check", description: "Verify governance rule adherence", requiresApproval: false },
      { name: "report_generation", description: "Generate compliance reports", requiresApproval: false },
    ],
    allowedActions: ["get_kernel_stats", "get_approval_queue", "get_workflow_status", "get_agent_network"],
    forbiddenActions: ["Modify audit logs", "Override approvals", "Disable agents"],
    escalationTriggers: [
      { condition: "Compliance violation detected", triggerType: "ethical_concern", escalateTo: "system_admin", notifyImmediately: true },
    ],
    tools: ["get_kernel_stats", "get_approval_queue", "get_workflow_status", "get_agent_network"],
    status: "active",
    completedTasks: 0,
    failedTasks: 0,
    version: "1.0.0",
    createdAt: new Date().toISOString(),
  },
  // ── Expanded Agent Roster (20 additional specialized agents) ──
  ...buildAgentBatch([
    // Case Strategy Team
    { id: "themis", name: "Themis — Claim Assessor", team: "case_strategy", mission: "Evaluate legal claims for viability, merit, and damages potential.", caps: [["claim_evaluation", "Assess claim strength and viability", false], ["damages_assessment", "Estimate potential damages", false], ["jurisdiction_check", "Verify jurisdictional requirements", false]], allowed: ["search_legal_knowledge", "get_matter_details", "get_case_list"], forbidden: ["File claims without review", "Contact opposing counsel"] },
    { id: "mercury", name: "Mercury — Settlement Analyst", team: "case_strategy", mission: "Analyze settlement positions, model outcomes, and value dispute resolution paths.", caps: [["settlement_modeling", "Model settlement scenarios and outcomes", false], ["cost_benefit_analysis", "Analyze litigation vs. settlement cost-benefit", false], ["negotiation_strategy", "Develop negotiation frameworks", true]], allowed: ["search_legal_knowledge", "get_matter_details", "settlement_summary"], forbidden: ["Make settlement offers", "Bind parties to agreements"] },
    // Legal Research Team
    { id: "justicia", name: "Justicia — Statutory Interpreter", team: "legal_research", mission: "Interpret statutes, regulations, and administrative rules across jurisdictions.", caps: [["statutory_analysis", "Analyze statutes and regulatory frameworks", false], ["regulatory_mapping", "Map applicable regulations by jurisdiction", false], ["legislative_tracking", "Track pending legislative changes", false]], allowed: ["search_legal_knowledge", "get_matter_details"], forbidden: ["Draft legislation", "Lobby regulators"] },
    { id: "precedent", name: "Precedent — Authority Mapper", team: "legal_research", mission: "Map precedent chains, identify controlling authority, and find distinguishing cases.", caps: [["precedent_chain", "Build precedent authority chains", false], ["authority_ranking", "Rank authority by jurisdiction and recency", false], ["distinguish_cases", "Identify distinguishing factors from adverse authority", false]], allowed: ["search_legal_knowledge", "get_case_list"], forbidden: ["Cite fabricated cases", "Misrepresent holdings"] },
    // Evidence Analysis Team
    { id: "chain-tracker", name: "Chain — Custody Tracker", team: "evidence_analysis", mission: "Track chain-of-custody for all evidence items and flag integrity gaps.", caps: [["custody_tracking", "Monitor evidence chain of custody", false], ["gap_detection", "Detect custody chain gaps or irregularities", false], ["timeline_reconstruction", "Reconstruct evidence handling timeline", false]], allowed: ["analyze_evidence", "get_matter_details"], forbidden: ["Modify custody records", "Destroy evidence metadata"] },
    { id: "shield", name: "Shield — Privilege Screener", team: "evidence_analysis", mission: "Screen documents and communications for attorney-client privilege and work product.", caps: [["privilege_detection", "Detect potentially privileged content", true], ["redaction_recommendation", "Recommend redaction areas", true], ["privilege_log_entry", "Draft privilege log entries", true]], allowed: ["analyze_evidence", "search_legal_knowledge"], forbidden: ["Waive privilege", "Disclose privileged content", "Override attorney decisions"] },
    // Document Drafting Team
    { id: "brief", name: "Brief — Motion Drafter", team: "document_drafting", mission: "Draft motions, briefs, and court filings with proper formatting and citation.", caps: [["motion_drafting", "Draft motions to dismiss, compel, and suppress", true], ["brief_writing", "Draft appellate and trial briefs", true], ["citation_formatting", "Format legal citations per jurisdiction", false]], allowed: ["search_legal_knowledge", "get_matter_details", "get_case_list"], forbidden: ["File documents without review", "Sign pleadings", "E-file with courts"] },
    { id: "clerk", name: "Clerk — Filing Coordinator", team: "document_drafting", mission: "Coordinate document assembly, filing requirements, and deadline tracking.", caps: [["filing_requirements", "Check filing requirements by court", false], ["document_assembly", "Assemble exhibit packages and appendices", false], ["deadline_tracking", "Track filing deadlines and extensions", false]], allowed: ["get_matter_details", "get_workflow_status"], forbidden: ["File documents", "Contact court clerks directly"] },
    // Forensic Intelligence Team
    { id: "nexus", name: "Nexus — Cluster Analyst", team: "forensic_intelligence", mission: "Identify related wallet clusters, entity connections, and fund flow patterns.", caps: [["cluster_analysis", "Identify related wallet clusters", false], ["entity_resolution", "Resolve entities across wallet addresses", false], ["fund_flow_mapping", "Map fund flow patterns across chains", false]], allowed: ["get_forensic_case", "search_legal_knowledge"], forbidden: ["Freeze accounts", "Contact exchanges", "File SARs"] },
    { id: "signal", name: "Signal — Pattern Detector", team: "forensic_intelligence", mission: "Detect transaction patterns indicating fraud, laundering, or sanctions evasion.", caps: [["pattern_detection", "Detect suspicious transaction patterns", false], ["anomaly_scoring", "Score transactions for anomaly indicators", false], ["risk_profiling", "Build risk profiles from transaction history", false]], allowed: ["get_forensic_case", "search_legal_knowledge"], forbidden: ["Report to regulators", "Block transactions"] },
    // Compliance Audit Team
    { id: "warden", name: "Warden — Governance Monitor", team: "compliance_audit", mission: "Monitor all system operations for governance rule adherence and constitution compliance.", caps: [["rule_monitoring", "Monitor operations against governance rules", false], ["constitution_check", "Verify actions comply with system constitution", false], ["violation_reporting", "Generate governance violation reports", false]], allowed: ["get_kernel_stats", "get_agent_network", "get_workflow_status"], forbidden: ["Override governance rules", "Disable monitoring"] },
    { id: "arbiter", name: "Arbiter — Ethics Reviewer", team: "compliance_audit", mission: "Review agent outputs for ethical compliance, bias detection, and fairness.", caps: [["ethics_review", "Review outputs for ethical compliance", false], ["bias_detection", "Detect potential bias in analysis", false], ["fairness_audit", "Audit recommendations for fairness", false]], allowed: ["get_kernel_stats", "get_approval_queue"], forbidden: ["Override ethical determinations", "Suppress violation reports"] },
    // Client Communications Team
    { id: "herald", name: "Herald — Communications Drafter", team: "client_communications", mission: "Draft client communications, status updates, and correspondence under attorney supervision.", caps: [["status_drafting", "Draft case status updates", true], ["correspondence", "Draft formal client correspondence", true], ["notification_assembly", "Assemble notification packages", true]], allowed: ["get_matter_details", "get_workflow_status"], forbidden: ["Send communications directly", "Disclose strategy to clients", "Contact adverse parties"] },
    { id: "advocate", name: "Advocate — Advocacy Coordinator", team: "client_communications", mission: "Coordinate public advocacy, media responses, and community engagement for cases.", caps: [["media_response", "Draft media response frameworks", true], ["advocacy_planning", "Plan public advocacy campaigns", true], ["community_outreach", "Coordinate community support initiatives", true]], allowed: ["get_matter_details", "get_case_list"], forbidden: ["Issue public statements", "Contact media directly", "Make case commitments"] },
    // Workflow Orchestration Team
    { id: "triage", name: "Triage — Intake Scorer", team: "workflow_orchestration", mission: "Score incoming case intakes for urgency, complexity, and resource allocation.", caps: [["urgency_scoring", "Score case urgency based on deadlines and stakes", false], ["complexity_assessment", "Assess case complexity for resource planning", false], ["assignment_recommendation", "Recommend team and resource assignment", false]], allowed: ["get_case_list", "get_matter_details", "get_workflow_status"], forbidden: ["Accept or reject cases", "Commit resources"] },
    { id: "conflict", name: "Conflict — Conflict Checker", team: "workflow_orchestration", mission: "Check for conflicts of interest across all matter parties and personnel.", caps: [["conflict_screening", "Screen new matters against existing parties", false], ["adverse_party_check", "Check for adverse party relationships", false], ["personnel_conflict", "Check for personnel conflicts of interest", false]], allowed: ["get_case_list", "get_matter_details"], forbidden: ["Waive conflicts", "Override conflict determinations"] },
    { id: "calendar", name: "Calendar — Deadline Monitor", team: "workflow_orchestration", mission: "Monitor all case deadlines, statute of limitations, and filing windows.", caps: [["deadline_tracking", "Track court and administrative deadlines", false], ["sol_monitoring", "Monitor statute of limitations windows", false], ["alert_generation", "Generate deadline alerts and escalations", false]], allowed: ["get_matter_details", "get_workflow_status", "get_case_list"], forbidden: ["Extend deadlines unilaterally", "Waive filing requirements"] },
    // Infrastructure Team
    { id: "vault-ops", name: "Vault — Privacy Operations", team: "infrastructure", mission: "Manage privacy vault operations, encryption lifecycle, and access control.", caps: [["encryption_management", "Manage AES-256-GCM encryption operations", false], ["access_monitoring", "Monitor vault access patterns and anomalies", false], ["key_lifecycle", "Manage cryptographic key lifecycle", false]], allowed: ["get_kernel_stats"], forbidden: ["Decrypt without authorization", "Export encryption keys", "Disable encryption"] },
    { id: "anchor", name: "Anchor — Chain Notarizer", team: "infrastructure", mission: "Anchor evidence hashes and audit records to blockchain for tamper-proof verification.", caps: [["hash_anchoring", "Anchor SHA-256 hashes to blockchain", false], ["verification", "Verify anchored records against chain state", false], ["chain_monitoring", "Monitor blockchain confirmations", false]], allowed: ["get_kernel_stats", "get_agent_network"], forbidden: ["Modify anchored records", "Bypass chain verification"] },
    { id: "pulse", name: "Pulse — System Health Monitor", team: "infrastructure", mission: "Monitor system health, agent performance, and infrastructure reliability.", caps: [["health_monitoring", "Monitor all subsystem health metrics", false], ["performance_tracking", "Track agent response times and error rates", false], ["alerting", "Generate system health alerts", false]], allowed: ["get_kernel_stats", "get_agent_network", "get_workflow_status"], forbidden: ["Restart services without approval", "Modify system configuration"] },
  ]),
];

// Agent batch builder — reduces boilerplate for expanded roster
function buildAgentBatch(defs: Array<{
  id: string; name: string; team: Agent["team"]; mission: string;
  caps: Array<[string, string, boolean]>; allowed: string[]; forbidden: string[];
}>): Agent[] {
  return defs.map(d => ({
    id: `agent-${d.id}`,
    name: d.name,
    team: d.team,
    mission: d.mission,
    capabilities: d.caps.map(([n, desc, req]) => ({ name: n, description: desc, requiresApproval: req })),
    allowedActions: d.allowed,
    forbiddenActions: d.forbidden,
    escalationTriggers: [{ condition: "Confidence below threshold", triggerType: "confidence_below_threshold" as const, threshold: 0.60, escalateTo: "supervising_attorney", notifyImmediately: false }],
    tools: d.allowed,
    status: "active" as const,
    completedTasks: 0,
    failedTasks: 0,
    version: "1.0.0",
    createdAt: new Date().toISOString(),
  }));
}

// ── Public API ──

/**
 * Initialize the agent runtime with default agents.
 */
export function initRuntime(): void {
  if (state.isRunning) return;

  for (const agent of DEFAULT_AGENTS) {
    state.agents.set(agent.id, agent);
  }
  for (const agent of MARKETING_AGENTS) {
    state.agents.set(agent.id, agent);
  }

  state.isRunning = true;
  state.startedAt = new Date().toISOString();
}

/**
 * Get runtime status.
 */
export function runtimeStatus() {
  return {
    isRunning: state.isRunning,
    startedAt: state.startedAt,
    agentCount: state.agents.size,
    activeTaskCount: state.activeTasks.size,
    totalActionsLogged: state.actionLog.length,
    agents: Array.from(state.agents.values()).map((a) => ({
      id: a.id,
      name: a.name,
      team: a.team,
      status: a.status,
      completedTasks: a.completedTasks,
      failedTasks: a.failedTasks,
    })),
  };
}

/**
 * Get a specific agent by ID.
 */
export function getAgent(id: string): Agent | undefined {
  return state.agents.get(id);
}

/**
 * Get agents by team.
 */
export function getAgentsByTeam(team: string): Agent[] {
  return Array.from(state.agents.values()).filter((a) => a.team === team);
}

/**
 * Dispatch a task to a specific agent.
 */
export async function dispatchTask(req: TaskRequest): Promise<TaskResult> {
  if (!state.isRunning) {
    initRuntime();
  }

  const agent = state.agents.get(req.agent.id);
  if (!agent) {
    throw new Error(`Agent ${req.agent.id} not registered in runtime`);
  }

  // Mark agent as busy
  agent.status = "busy";
  agent.currentTaskId = req.taskId || randomUUID();

  try {
    const result = await executeTask(req);

    // Update agent state
    agent.status = "active";
    agent.currentTaskId = undefined;
    agent.completedTasks++;
    agent.lastHeartbeat = new Date().toISOString();
    agent.avgResponseTime = agent.avgResponseTime
      ? (agent.avgResponseTime + result.durationMs) / 2
      : result.durationMs;

    // Log action
    state.actionLog.push(result.actionLog);

    return result;
  } catch (err) {
    agent.status = "degraded";
    agent.currentTaskId = undefined;
    agent.failedTasks++;

    throw err;
  }
}

/**
 * Route a task to the best available agent for a given team.
 */
export async function routeTask(
  team: string,
  instruction: string,
  options?: { context?: string; matterId?: string }
): Promise<TaskResult> {
  const teamAgents = getAgentsByTeam(team).filter((a) => a.status === "active" || a.status === "idle");

  if (teamAgents.length === 0) {
    throw new Error(`No available agents for team: ${team}`);
  }

  // Pick the agent with the lowest load (fewest completed tasks = least busy historically)
  const agent = teamAgents.sort((a, b) => (a.completedTasks || 0) - (b.completedTasks || 0))[0];

  return dispatchTask({
    agent,
    instruction,
    context: options?.context,
    matterId: options?.matterId,
  });
}

/**
 * Get the action log, optionally filtered.
 */
export function getActionLog(filters?: {
  agentId?: string;
  matterId?: string;
  escalatedOnly?: boolean;
  limit?: number;
}): AgentActionLog[] {
  let log = [...state.actionLog];

  if (filters?.agentId) log = log.filter((a) => a.agentId === filters.agentId);
  if (filters?.matterId) log = log.filter((a) => a.matterId === filters.matterId);
  if (filters?.escalatedOnly) log = log.filter((a) => a.escalated);

  log.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (filters?.limit) log = log.slice(0, filters.limit);

  return log;
}
