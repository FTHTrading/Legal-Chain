/**
 * Orchestrator API Route
 *
 * POST — Launch a workflow orchestration
 * GET  — List all orchestrations (public view, no PII)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  launchOrchestration,
  listOrchestrations,
  getOrchestratorStats,
} from "@/lib/orchestrator/orchestrator";
import { getWorkflow, listWorkflows } from "@/lib/orchestrator/workflows";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view");

  if (view === "workflows") {
    const workflows = listWorkflows().map(w => ({
      id: w.id,
      name: w.name,
      description: w.description,
      category: w.category,
      pipelineCount: w.pipelines.length,
      totalSteps: w.pipelines.reduce((sum, p) => sum + p.steps.length, 0),
      x402Enabled: w.x402Enabled,
      estimatedTotalATP: w.estimatedTotalATP,
    }));
    return NextResponse.json({ workflows });
  }

  if (view === "stats") {
    return NextResponse.json(getOrchestratorStats());
  }

  // Default: list orchestrations (no PII)
  const orchestrations = listOrchestrations();
  return NextResponse.json({
    count: orchestrations.length,
    orchestrations,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflowId, input, matterId } = body;

    if (!workflowId) {
      return NextResponse.json(
        { error: "workflowId is required" },
        { status: 400 }
      );
    }

    const workflow = getWorkflow(workflowId);
    if (!workflow) {
      return NextResponse.json(
        { error: `Workflow ${workflowId} not found`, available: listWorkflows().map(w => w.id) },
        { status: 404 }
      );
    }

    // Launch orchestration — PII is auto-vaulted inside
    const orchestration = await launchOrchestration(workflow, input || {}, matterId);

    // Return ONLY public-safe data
    return NextResponse.json({
      orchestrationId: orchestration.id,
      workflowName: orchestration.workflowName,
      matterId: orchestration.matterId,
      status: orchestration.status,
      totalSteps: orchestration.totalSteps,
      startedAt: orchestration.startedAt,
      message: "Orchestration launched. All client data secured in Web3 Privacy Vault.",
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Launch failed" },
      { status: 500 }
    );
  }
}
