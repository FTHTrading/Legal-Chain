import { NextResponse } from "next/server";
import { initRuntime, runtimeStatus, getAgent, dispatchTask, routeTask } from "@/lib/agents";

/**
 * GET /api/agents/status — Get agent runtime status
 */
export async function GET() {
  const status = runtimeStatus();
  return NextResponse.json(status);
}

/**
 * POST /api/agents/dispatch — Dispatch a task to an agent
 *
 * Body: { agentId: string, instruction: string, context?: string, matterId?: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentId, instruction, context, matterId } = body as {
      agentId?: string;
      instruction?: string;
      context?: string;
      matterId?: string;
    };

    if (!instruction) {
      return NextResponse.json({ error: "instruction is required" }, { status: 400 });
    }

    // Initialize runtime if not running
    const status = runtimeStatus();
    if (!status.isRunning) {
      initRuntime();
    }

    // If agentId specified, dispatch to that agent. Otherwise, auto-route.
    if (agentId) {
      const agent = getAgent(agentId);
      if (!agent) {
        return NextResponse.json({ error: `Agent ${agentId} not found` }, { status: 404 });
      }
      const result = await dispatchTask({ agent, instruction, context, matterId });
      return NextResponse.json(result);
    }

    // Auto-route: infer team from instruction keywords
    const teamKeywords: Record<string, string[]> = {
      case_strategy: ["strategy", "plan", "advise", "case theory", "defense"],
      legal_research: ["research", "case law", "statute", "precedent", "citation", "legal question"],
      evidence_analysis: ["evidence", "exhibit", "document review", "analyze"],
      document_drafting: ["draft", "write", "brief", "motion", "pleading", "letter"],
      forensic_intelligence: ["forensic", "blockchain", "wallet", "trace", "crypto", "transaction"],
      compliance_audit: ["audit", "compliance", "governance", "log", "verify"],
    };
    const lower = instruction.toLowerCase();
    let team = "legal_research"; // default
    for (const [t, keywords] of Object.entries(teamKeywords)) {
      if (keywords.some((k) => lower.includes(k))) {
        team = t;
        break;
      }
    }
    const result = await routeTask(team, instruction, { context, matterId });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Task dispatch failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
