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
];

// ── Public API ──

/**
 * Initialize the agent runtime with default agents.
 */
export function initRuntime(): void {
  if (state.isRunning) return;

  for (const agent of DEFAULT_AGENTS) {
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
