import { NextResponse } from "next/server";
import { complete, type ChatMessage } from "@/lib/ai/provider";
import { MODEL_CONFIGS, TEAM_MODEL_MAP } from "@/lib/ai/config";
import { TOOL_DEFINITIONS, executeTool, getToolsForTeam } from "@/lib/agents/tools";

// POST /api/ai/chat — LLM chat with optional tool calling
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      messages,
      team,
      enableTools,
    }: {
      messages: ChatMessage[];
      team?: string;
      enableTools?: boolean;
    } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages array required" }, { status: 400 });
    }

    // Select model config based on team or default
    const config = team ? TEAM_MODEL_MAP[team] || MODEL_CONFIGS.analysis : MODEL_CONFIGS.analysis;

    // Get tools if enabled
    const tools = enableTools
      ? team
        ? getToolsForTeam(team)
        : TOOL_DEFINITIONS
      : undefined;

    const response = await complete({ messages, config, tools });

    // If tool calls were made, execute them and include results
    let toolResults;
    if (response.toolCalls?.length) {
      toolResults = await Promise.all(
        response.toolCalls.map(async (tc) => ({
          tool: tc.name,
          result: await executeTool(tc.name, tc.arguments),
        }))
      );
    }

    return NextResponse.json({
      content: response.content,
      model: response.model,
      provider: response.provider,
      tokensUsed: response.tokensUsed,
      durationMs: response.durationMs,
      toolCalls: response.toolCalls,
      toolResults,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Chat request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
