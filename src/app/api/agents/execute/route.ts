import { NextResponse } from "next/server";
import { routeTask, getAgent, dispatchTask } from "@/lib/agents/runtime";

// POST /api/agents/execute — Execute a task via agent runtime
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { team, agentId, instruction, matterId, context } = body as {
      team?: string;
      agentId?: string;
      instruction: string;
      matterId?: string;
      context?: string;
    };

    if (!instruction || typeof instruction !== "string") {
      return NextResponse.json({ error: "instruction (string) required" }, { status: 400 });
    }

    if (!team && !agentId) {
      return NextResponse.json({ error: "team or agentId required" }, { status: 400 });
    }

    let result;

    if (agentId) {
      const agent = getAgent(agentId);
      if (!agent) {
        return NextResponse.json({ error: `Agent ${agentId} not found` }, { status: 404 });
      }
      result = await dispatchTask({ agent, instruction, matterId, context });
    } else {
      result = await routeTask(team!, instruction, { matterId, context });
    }

    return NextResponse.json({
      taskId: result.taskId,
      agentName: result.agentName,
      output: result.output,
      confidence: result.confidenceScore,
      escalated: result.escalated,
      escalationReason: result.escalationReason,
      toolCallsMade: result.toolCallsMade,
      tokensUsed: result.tokensUsed,
      model: result.model,
      durationMs: result.durationMs,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Task execution failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
