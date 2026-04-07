/**
 * Orchestration Detail API Route
 *
 * GET  — Get orchestration status (public view, no PII)
 * POST — Control orchestration (pause, resume, cancel)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getOrchestration,
  pauseOrchestration,
  resumeOrchestration,
  cancelOrchestration,
  getEventLog,
} from "@/lib/orchestrator/orchestrator";
import { getWorkflow } from "@/lib/orchestrator/workflows";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const include = searchParams.get("include");

  const orchestration = getOrchestration(id);
  if (!orchestration) {
    return NextResponse.json({ error: "Orchestration not found" }, { status: 404 });
  }

  const response: Record<string, unknown> = { ...orchestration };

  if (include === "events") {
    response.events = getEventLog(id);
  }

  return NextResponse.json(response);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "pause": {
        const ok = pauseOrchestration(id);
        if (!ok) return NextResponse.json({ error: "Cannot pause this orchestration" }, { status: 400 });
        return NextResponse.json({ status: "paused", orchestrationId: id });
      }

      case "resume": {
        const orch = getOrchestration(id);
        if (!orch) return NextResponse.json({ error: "Orchestration not found" }, { status: 404 });
        const workflow = getWorkflow(orch.workflowId);
        if (!workflow) return NextResponse.json({ error: "Workflow definition not found" }, { status: 404 });
        const ok = resumeOrchestration(id, workflow);
        if (!ok) return NextResponse.json({ error: "Cannot resume this orchestration" }, { status: 400 });
        return NextResponse.json({ status: "resumed", orchestrationId: id });
      }

      case "cancel": {
        const ok = cancelOrchestration(id);
        if (!ok) return NextResponse.json({ error: "Orchestration not found" }, { status: 404 });
        return NextResponse.json({ status: "cancelled", orchestrationId: id });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: pause, resume, cancel" },
          { status: 400 }
        );
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
