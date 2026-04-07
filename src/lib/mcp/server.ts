/**
 * UNYKORN // LAW — MCP Server
 *
 * Model Context Protocol server exposing legal tools for external AI agents.
 * Supports stdio transport for VS Code / editor integration.
 *
 * Start: node --loader ts-node/esm src/lib/mcp/server.ts
 * Or via: npm run mcp
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// ── Server Instance ──

const server = new McpServer({
  name: "legal-chain",
  version: "1.0.0",
});

// ── Tool: Search Legal Knowledge (RAG) ──

server.tool(
  "search_legal_knowledge",
  "Search the legal knowledge base using RAG. Returns relevant document chunks for case law, statutes, evidence, and legal briefs.",
  {
    query: z.string().describe("Natural language search query"),
    matterId: z.string().optional().describe("Filter by specific matter ID"),
    documentType: z.string().optional().describe("Filter by document type"),
    topK: z.number().optional().describe("Number of results (default: 5)"),
  },
  async ({ query, matterId, documentType, topK }) => {
    // Dynamic import to avoid circular deps at module load
    const { query: ragQuery } = await import("../rag/pipeline.js");
    const result = await ragQuery({
      query,
      matterId,
      documentType,
      topK: topK || 5,
    });
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              answer: result.answer,
              confidence: result.confidence,
              sourceCount: result.sources.length,
              sources: result.sources.map((s) => ({
                type: s.document.metadata.type,
                source: s.document.metadata.source,
                similarity: s.similarity,
                excerpt: s.document.content.slice(0, 300),
              })),
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ── Tool: Get Matter Details ──

server.tool(
  "get_matter_details",
  "Retrieve full details of a legal matter including parties, claims, evidence, and status.",
  {
    matterId: z.string().describe("The matter ID to look up"),
  },
  async ({ matterId }) => {
    const { ACTIVE_CASES, SEED_MATTER_CREAMER, SEED_MATTER_DELCAMPO, SEED_MATTER_TRON } = await import("../data/seed.js");
    // Try full matter details first
    const detailMap: Record<string, unknown> = {
      "nti-leavitt-2026-001": SEED_MATTER_TRON,
      "state-v-delcampo": SEED_MATTER_DELCAMPO,
      "creamer-drive-169": SEED_MATTER_CREAMER,
    };
    const detail = detailMap[matterId];
    if (detail) {
      return {
        content: [{ type: "text" as const, text: JSON.stringify(detail, null, 2) }],
      };
    }
    const summary = ACTIVE_CASES.find((c: { id: string }) => c.id === matterId);
    return {
      content: [
        {
          type: "text" as const,
          text: summary
            ? JSON.stringify(summary, null, 2)
            : JSON.stringify({ error: `Matter ${matterId} not found` }),
        },
      ],
    };
  }
);

// ── Tool: List Active Cases ──

server.tool(
  "list_active_cases",
  "List all active cases with their current status and key details.",
  {},
  async () => {
    const { ACTIVE_CASES } = await import("../data/seed.js");
    const summary = ACTIVE_CASES.map((c: { id: string; title: string; status: string; type: string }) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      type: c.type,
    }));
    return {
      content: [{ type: "text" as const, text: JSON.stringify(summary, null, 2) }],
    };
  }
);

// ── Tool: Get Forensic Case ──

server.tool(
  "get_forensic_case",
  "Retrieve blockchain forensic case details including traced wallets and transactions.",
  {
    caseId: z.string().optional().describe("Forensic case ID (returns default if omitted)"),
  },
  async () => {
    const { SEED_FORENSIC_TRON } = await import("../data/seed-platform.js");
    return {
      content: [
        { type: "text" as const, text: JSON.stringify(SEED_FORENSIC_TRON, null, 2) },
      ],
    };
  }
);

// ── Tool: Get Approval Queue ──

server.tool(
  "get_approval_queue",
  "Get current items awaiting human approval in the workflow.",
  {
    status: z.enum(["pending", "approved", "rejected", "escalated"]).optional().describe("Filter by status"),
  },
  async ({ status }) => {
    const { SEED_APPROVALS } = await import("../data/seed-platform.js");
    const items = status
      ? SEED_APPROVALS.filter((a: { status: string }) => a.status === status)
      : SEED_APPROVALS;
    return {
      content: [
        { type: "text" as const, text: JSON.stringify({ count: items.length, items }, null, 2) },
      ],
    };
  }
);

// ── Tool: Get Workflow Status ──

server.tool(
  "get_workflow_status",
  "Get the current status of workflow pipelines (intake, litigation).",
  {
    workflowType: z
      .enum(["intake", "litigation", "all"])
      .optional()
      .describe("Which workflow to check"),
  },
  async ({ workflowType }) => {
    const { SEED_WORKFLOW_INTAKE, SEED_WORKFLOW_LITIGATION } = await import(
      "../data/seed-platform.js"
    );
    const type = workflowType || "all";
    const workflows: Record<string, unknown> = {};
    if (type === "intake" || type === "all") workflows.intake = SEED_WORKFLOW_INTAKE;
    if (type === "litigation" || type === "all")
      workflows.litigation = SEED_WORKFLOW_LITIGATION;
    return {
      content: [{ type: "text" as const, text: JSON.stringify(workflows, null, 2) }],
    };
  }
);

// ── Tool: Get Kernel Stats ──

server.tool(
  "get_kernel_stats",
  "Get TruthKernel statistics — truth records, attestations, settlements, evidence items.",
  {},
  async () => {
    const { truthKernel } = await import("../kernel/index.js");
    return {
      content: [
        { type: "text" as const, text: JSON.stringify(truthKernel.stats, null, 2) },
      ],
    };
  }
);

// ── Tool: Get Agent Network ──

server.tool(
  "get_agent_network",
  "Get the status of the agent network — team composition, protocol, and chain details.",
  {},
  async () => {
    const { AGENT_NETWORK } = await import("../data/seed.js");
    return {
      content: [{ type: "text" as const, text: JSON.stringify(AGENT_NETWORK, null, 2) }],
    };
  }
);

// ── Tool: Ingest Document ──

server.tool(
  "ingest_document",
  "Ingest a document into the RAG knowledge base for future retrieval.",
  {
    content: z.string().describe("The full text content to ingest"),
    source: z.string().describe("Source identifier (file path, URL, or label)"),
    type: z.string().describe("Document type: case_law, statute, evidence, brief, correspondence, memo"),
    matterId: z.string().optional().describe("Link to a specific matter"),
    title: z.string().optional().describe("Document title"),
  },
  async ({ content, source, type, matterId, title }) => {
    const { ingest } = await import("../rag/pipeline.js");
    const result = await ingest({
      content,
      metadata: { source, type, matterId, title },
      useLegalChunking: true,
    });
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ── Tool: RAG Pipeline Status ──

server.tool(
  "rag_status",
  "Get the current status of the RAG pipeline — indexed documents, configuration.",
  {},
  async () => {
    const { pipelineStatus } = await import("../rag/pipeline.js");
    const status = await pipelineStatus();
    return {
      content: [{ type: "text" as const, text: JSON.stringify(status, null, 2) }],
    };
  }
);

// ── Tool: Execute Agent Task ──

server.tool(
  "execute_agent_task",
  "Dispatch a task to a specific AI agent on the legal platform.",
  {
    team: z
      .enum([
        "case_strategy",
        "legal_research",
        "evidence_analysis",
        "document_drafting",
        "forensic_intelligence",
        "compliance_audit",
      ])
      .describe("Which agent team should handle this task"),
    instruction: z.string().describe("The task instruction for the agent"),
    matterId: z.string().optional().describe("Matter context for the task"),
    context: z.string().optional().describe("Additional context"),
  },
  async ({ team, instruction, matterId, context }) => {
    const { routeTask } = await import("../agents/runtime.js");
    const result = await routeTask(team, instruction, { matterId, context });
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              agentName: result.agentName,
              output: result.output,
              confidence: result.confidenceScore,
              escalated: result.escalated,
              escalationReason: result.escalationReason,
              toolCallsMade: result.toolCallsMade,
              tokensUsed: result.tokensUsed,
              durationMs: result.durationMs,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ── Resource: System Constitution ──

// ── Tool: Launch Workflow ──

server.tool(
  "launch_workflow",
  "Launch an AI investigation or case-building workflow. Auto-vaults all PII before agents see it.",
  {
    workflowId: z
      .enum(["wf-intake-investigation", "wf-case-file-builder", "wf-full-defense"])
      .describe("Which workflow to launch"),
    matterId: z.string().describe("Matter ID for the case"),
    input: z
      .object({
        clientName: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        matterType: z.string().optional(),
        description: z.string().optional(),
      })
      .describe("Intake data — all PII will be encrypted before agents process it"),
  },
  async ({ workflowId, matterId, input }) => {
    const { launchOrchestration } = await import("../orchestrator/orchestrator.js");
    const { getWorkflow } = await import("../orchestrator/workflows.js");
    const workflow = getWorkflow(workflowId);
    if (!workflow) {
      return {
        content: [
          { type: "text" as const, text: JSON.stringify({ error: `Workflow ${workflowId} not found` }) },
        ],
      };
    }
    const result = await launchOrchestration(workflow, input, matterId);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              id: result.id,
              status: result.status,
              matterId: result.matterId,
              workflowId: result.workflowId,
              note: "All PII has been encrypted in the Web3 Vault. Agents see only vault references.",
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ── Tool: Get Orchestration Status ──

server.tool(
  "get_orchestration_status",
  "Get the status of a running workflow orchestration. Returns no PII — only step summaries.",
  {
    orchestrationId: z.string().describe("The orchestration ID to check"),
  },
  async ({ orchestrationId }) => {
    const { getOrchestration } = await import("../orchestrator/orchestrator.js");
    const result = getOrchestration(orchestrationId);
    if (!result) {
      return {
        content: [
          { type: "text" as const, text: JSON.stringify({ error: "Orchestration not found" }) },
        ],
      };
    }
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ── Tool: Get Vault Stats ──

server.tool(
  "get_vault_stats",
  "Get aggregate statistics about the Web3 Privacy Vault — record counts, anchor status. No PII returned.",
  {},
  async () => {
    const { getVaultStats } = await import("../privacy/vault.js");
    return {
      content: [{ type: "text" as const, text: JSON.stringify(getVaultStats(), null, 2) }],
    };
  }
);

// ── Tool: Create Private Link ──

server.tool(
  "create_private_link",
  "Create a time-limited, HMAC-signed private link for secure case access.",
  {
    matterId: z.string().describe("Matter ID to create link for"),
    scope: z
      .enum([
        "full_case",
        "case_summary",
        "investigation",
        "documents",
        "report_pdf",
        "evidence",
        "financial",
        "defense_plan",
      ])
      .describe("Access scope for the link"),
    expiresInHours: z.number().optional().describe("Link expiry in hours (default: 24)"),
    maxUses: z.number().optional().describe("Maximum usage count (default: 10)"),
  },
  async ({ matterId, scope, expiresInHours, maxUses }) => {
    const { createPrivateLink, buildPrivateLinkURL } = await import(
      "../privacy/private-links.js"
    );
    const link = await createPrivateLink({
      matterId,
      scope: scope as import("../privacy/private-links.js").LinkScope,
      createdBy: "mcp-server",
      expiresInHours: expiresInHours || 24,
      maxUses: maxUses || 10,
    });
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              id: link.id,
              token: link.token,
              url: buildPrivateLinkURL(link.token, "https://law.unykorn.org"),
              scope: link.scope,
              expiresAt: link.expiresAt,
              maxUses: link.maxUses,
              warning: "This token grants access to case data. Share only with authorized parties.",
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ── Tool: Generate Report ──

server.tool(
  "generate_report",
  "Generate a professional legal report (preliminary investigation, case file, or case summary).",
  {
    reportType: z
      .enum(["preliminary_investigation", "full_case_file", "case_summary", "defense_plan"])
      .describe("Type of report to generate"),
    matterId: z.string().describe("Matter ID for the report"),
    orchestrationId: z.string().optional().describe("Orchestration ID for context"),
  },
  async ({ reportType, matterId, orchestrationId }) => {
    const {
      generatePreliminaryReport,
      generateCaseFileReport,
      generateCaseSummary,
    } = await import("../reports/pdf-generator.js");
    const { getOrchestration } = await import("../orchestrator/orchestrator.js");

    const orchestration = orchestrationId ? getOrchestration(orchestrationId) : null;
    const context: Record<string, unknown> = orchestration
      ? { matterId, steps: JSON.stringify(orchestration) }
      : { matterId };

    const matterType = (context.matterType as string) || "general";

    let report: import("../reports/pdf-generator.js").GeneratedReport;
    switch (reportType) {
      case "preliminary_investigation":
        report = generatePreliminaryReport(matterId, matterType, context);
        break;
      case "full_case_file":
        report = generateCaseFileReport(matterId, matterType, context);
        break;
      case "case_summary":
        report = generateCaseSummary(matterId, matterType, "active");
        break;
      default:
        report = generateCaseSummary(matterId, matterType, "active");
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              id: report.id,
              matterId,
              reportType: report.reportType,
              htmlLength: report.html.length,
              generatedAt: report.generatedAt,
              downloadUrl: `/api/reports?id=${report.id}&format=html`,
              note: "Report contains no PII. Parties referenced by role only.",
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.resource(
  "constitution",
  "legal-chain://constitution",
  async () => {
    const { readFile } = await import("fs/promises");
    const { join } = await import("path");
    const content = await readFile(join(process.cwd(), "CONSTITUTION.md"), "utf-8");
    return {
      contents: [{ uri: "legal-chain://constitution", mimeType: "text/markdown", text: content }],
    };
  }
);

// ── Resource: Genesis Rules ──

server.resource(
  "genesis-rules",
  "legal-chain://genesis-rules",
  async () => {
    const { readFile } = await import("fs/promises");
    const { join } = await import("path");
    const content = await readFile(join(process.cwd(), "GENESIS_RULES.md"), "utf-8");
    return {
      contents: [
        { uri: "legal-chain://genesis-rules", mimeType: "text/markdown", text: content },
      ],
    };
  }
);

// ── Start Server ──

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[MCP] Legal-Chain MCP server started on stdio");
}

main().catch((err) => {
  console.error("[MCP] Fatal:", err);
  process.exit(1);
});
