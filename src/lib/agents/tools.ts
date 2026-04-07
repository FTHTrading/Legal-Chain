/**
 * Agent Tool Registry
 *
 * Defines all tools available to agents in the legal platform.
 * Each tool maps to a real function in the system (kernel, RAG, API).
 * Tools are exposed via MCP and directly callable by the agent runtime.
 */

import type { ToolDefinition } from "../ai/provider";
import { query as ragQuery } from "../rag/pipeline";
import { vectorStore } from "../rag/vectorstore";
import { truthKernel } from "../kernel";
import {
  ACTIVE_CASES,
  AGENT_NETWORK,
  SEED_MATTER_CREAMER,
  SEED_MATTER_DELCAMPO,
  SEED_MATTER_TRON,
} from "../data/seed";
import {
  SEED_FORENSIC_TRON,
  SEED_APPROVALS,
  SEED_WORKFLOW_INTAKE,
  SEED_WORKFLOW_LITIGATION,
} from "../data/seed-platform";

// Full matter objects indexed by case ID for detail lookup
const MATTER_DETAILS: Record<string, unknown> = {
  "nti-leavitt-2026-001": SEED_MATTER_TRON,
  "state-v-delcampo": SEED_MATTER_DELCAMPO,
  "creamer-drive-169": SEED_MATTER_CREAMER,
};

// ── Tool Result ──

export interface ToolResult {
  success: boolean;
  data: unknown;
  error?: string;
  durationMs: number;
}

// ── Tool Definitions (for LLM function calling) ──

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: "search_legal_knowledge",
    description:
      "Search the legal knowledge base using RAG. Returns relevant document chunks for case law, statutes, evidence, and legal briefs.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Natural language search query" },
        matterId: { type: "string", description: "Optional: filter by specific matter ID" },
        documentType: { type: "string", description: "Optional: filter by document type (case_law, statute, evidence, brief, correspondence)" },
        topK: { type: "number", description: "Number of results to return (default: 5)" },
      },
      required: ["query"],
    },
  },
  {
    name: "get_matter_details",
    description:
      "Retrieve full details of a legal matter including parties, claims, evidence, and status.",
    parameters: {
      type: "object",
      properties: {
        matterId: { type: "string", description: "The matter ID to look up" },
      },
      required: ["matterId"],
    },
  },
  {
    name: "get_case_list",
    description: "List all active cases with their current status and key details.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "analyze_evidence",
    description:
      "Analyze a piece of evidence for relevance, authenticity indicators, and legal implications.",
    parameters: {
      type: "object",
      properties: {
        evidenceId: { type: "string", description: "Evidence item ID" },
        analysisType: {
          type: "string",
          enum: ["relevance", "authenticity", "privilege", "chain_of_custody"],
          description: "Type of analysis to perform",
        },
      },
      required: ["evidenceId", "analysisType"],
    },
  },
  {
    name: "get_forensic_case",
    description:
      "Retrieve blockchain forensic case details including traced wallets and transactions.",
    parameters: {
      type: "object",
      properties: {
        caseId: { type: "string", description: "Forensic case ID (optional — returns default case if omitted)" },
      },
    },
  },
  {
    name: "get_approval_queue",
    description: "Get current items awaiting human approval in the workflow.",
    parameters: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["pending", "approved", "rejected", "escalated"], description: "Filter by status" },
      },
    },
  },
  {
    name: "get_workflow_status",
    description: "Get the current status of workflow pipelines (intake, litigation).",
    parameters: {
      type: "object",
      properties: {
        workflowType: { type: "string", enum: ["intake", "litigation", "all"], description: "Which workflow to check" },
      },
    },
  },
  {
    name: "get_kernel_stats",
    description:
      "Get TruthKernel statistics — truth records, attestations, settlements, evidence items, etc.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_agent_network",
    description: "Get the status of the agent network — team composition, protocol, and chain details.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "settlement_summary",
    description: "Get settlement ledger summary — payments, milestones, rights records.",
    parameters: {
      type: "object",
      properties: {
        matterId: { type: "string", description: "Optional: filter by matter" },
      },
    },
  },
];

// ── Tool Executors ──

type ToolExecutor = (args: Record<string, unknown>) => Promise<unknown>;

const executors: Record<string, ToolExecutor> = {
  async search_legal_knowledge(args) {
    const result = await ragQuery({
      query: args.query as string,
      matterId: args.matterId as string | undefined,
      documentType: args.documentType as string | undefined,
      topK: (args.topK as number) || 5,
    });
    return {
      answer: result.answer,
      confidence: result.confidence,
      sourceCount: result.sources.length,
      sources: result.sources.map((s) => ({
        type: s.document.metadata.type,
        source: s.document.metadata.source,
        similarity: s.similarity,
        excerpt: s.document.content.slice(0, 200),
      })),
    };
  },

  async get_matter_details(args) {
    const matterId = args.matterId as string;
    // Check full matter details first, then summary list
    const detail = MATTER_DETAILS[matterId];
    if (detail) return detail;
    const summary = ACTIVE_CASES.find((c) => c.id === matterId);
    if (!summary) return { error: `Matter ${matterId} not found` };
    return summary;
  },

  async get_case_list() {
    return ACTIVE_CASES.map((c) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      type: c.type,
      amount: c.amount,
      description: c.description,
    }));
  },

  async analyze_evidence(args) {
    const items = truthKernel.evidence.allEvidence;
    const item = items.find((e) => e.id === args.evidenceId);
    if (!item) {
      return { error: `Evidence ${args.evidenceId} not found`, availableCount: items.length };
    }
    return {
      id: item.id,
      analysisType: args.analysisType,
      authenticity: item.authenticity,
      privileged: item.privilege !== "none",
      custodyEvents: item.custodyChain?.length || 0,
      currentHash: item.currentHash,
    };
  },

  async get_forensic_case() {
    return SEED_FORENSIC_TRON;
  },

  async get_approval_queue(args) {
    const status = args.status as string | undefined;
    const items = status
      ? SEED_APPROVALS.filter((a) => a.status === status)
      : SEED_APPROVALS;
    return { count: items.length, items };
  },

  async get_workflow_status(args) {
    const type = (args.workflowType as string) || "all";
    const workflows: Record<string, unknown> = {};
    if (type === "intake" || type === "all") workflows.intake = SEED_WORKFLOW_INTAKE;
    if (type === "litigation" || type === "all") workflows.litigation = SEED_WORKFLOW_LITIGATION;
    return workflows;
  },

  async get_kernel_stats() {
    return truthKernel.stats;
  },

  async get_agent_network() {
    return AGENT_NETWORK;
  },

  async settlement_summary() {
    return {
      payments: truthKernel.settlement.paymentCount,
      pending: truthKernel.settlement.pendingPayments,
      settled: truthKernel.settlement.settledTotal,
      milestones: truthKernel.settlement.allMilestones.length,
    };
  },
};

/**
 * Execute a tool by name with arguments.
 */
export async function executeTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
  const executor = executors[name];
  if (!executor) {
    return { success: false, data: null, error: `Unknown tool: ${name}`, durationMs: 0 };
  }

  const start = Date.now();
  try {
    const data = await executor(args);
    return { success: true, data, durationMs: Date.now() - start };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  }
}

/**
 * Get tool definitions for a specific agent team.
 */
export function getToolsForTeam(team: string): ToolDefinition[] {
  const teamToolMap: Record<string, string[]> = {
    case_strategy: ["search_legal_knowledge", "get_matter_details", "get_case_list", "analyze_evidence", "settlement_summary"],
    document_drafting: ["search_legal_knowledge", "get_matter_details", "get_case_list"],
    legal_research: ["search_legal_knowledge", "get_matter_details", "get_case_list"],
    evidence_analysis: ["search_legal_knowledge", "analyze_evidence", "get_matter_details", "get_forensic_case"],
    client_communications: ["get_matter_details", "get_case_list", "get_approval_queue"],
    compliance_audit: ["get_kernel_stats", "get_approval_queue", "get_workflow_status", "get_agent_network"],
    forensic_intelligence: ["get_forensic_case", "search_legal_knowledge", "get_matter_details"],
    workflow_orchestration: ["get_workflow_status", "get_approval_queue", "get_case_list", "get_kernel_stats"],
    infrastructure: ["get_kernel_stats", "get_agent_network", "get_workflow_status"],
  };

  const allowedTools = teamToolMap[team] || Object.keys(executors);
  return TOOL_DEFINITIONS.filter((t) => allowedTools.includes(t.name));
}
