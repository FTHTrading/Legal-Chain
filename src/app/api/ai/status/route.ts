import { NextResponse } from "next/server";
import { availableProviders } from "@/lib/ai/provider";
import { MODEL_CONFIGS } from "@/lib/ai/config";
import { TOOL_DEFINITIONS } from "@/lib/agents/tools";

// GET /api/ai/status — AI infrastructure status
export async function GET() {
  const providers = availableProviders();

  return NextResponse.json({
    status: providers.length > 0 ? "operational" : "no_providers_configured",
    providers,
    models: {
      analysis: MODEL_CONFIGS.analysis.model,
      drafting: MODEL_CONFIGS.drafting.model,
      research: MODEL_CONFIGS.research.model,
      forensics: MODEL_CONFIGS.forensics.model,
      embedding: MODEL_CONFIGS.embedding.model,
    },
    toolCount: TOOL_DEFINITIONS.length,
    tools: TOOL_DEFINITIONS.map((t) => ({ name: t.name, description: t.description })),
    timestamp: new Date().toISOString(),
  });
}
