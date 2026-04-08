/**
 * Proof — Live System Health Check
 *
 * Returns real-time subsystem status, latency, and agent registry.
 * No authentication required — this is a public transparency endpoint.
 */

import { NextResponse } from "next/server";
import { runtimeStatus, initRuntime } from "@/lib/agents/runtime";
import { truthKernel } from "@/lib/kernel";
import { getVaultStats } from "@/lib/privacy/vault";
import { getOrchestratorStats } from "@/lib/orchestrator/orchestrator";
import { listWorkflows } from "@/lib/orchestrator/workflows";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();

  initRuntime();
  const runtime = runtimeStatus();
  const kernel = truthKernel.stats;
  const vault = getVaultStats();
  const orchestrator = getOrchestratorStats();
  const workflows = listWorkflows();

  const aiConfigured =
    !!process.env.OPENAI_API_KEY || !!process.env.ANTHROPIC_API_KEY;

  const latencyMs = Date.now() - start;

  return NextResponse.json({
    status: "operational",
    timestamp: new Date().toISOString(),
    latencyMs,
    subsystems: {
      api: { status: "online", latencyMs },
      ai: {
        status: aiConfigured ? "connected" : "no_key",
        provider: process.env.OPENAI_API_KEY
          ? "openai"
          : process.env.ANTHROPIC_API_KEY
            ? "anthropic"
            : "none",
      },
      vault: {
        status: "online",
        totalRecords: vault.totalRecords,
        anchoredCount: vault.anchoredCount,
      },
      kernel: {
        status: "online",
        truthRecords: kernel.truthRecords,
        evidenceItems: kernel.evidenceItems,
        attestations: kernel.attestations,
        stateRoots: kernel.stateRoots,
      },
      agents: {
        status: "online",
        count: runtime.agentCount,
        active: runtime.agents.filter((a) => a.status === "active").length,
      },
      orchestrator: {
        status: "online",
        workflowCount: workflows.length,
        totalOrchestrations: orchestrator.totalOrchestrations,
        totalStepsExecuted: orchestrator.totalStepsExecuted,
      },
    },
    agents: runtime.agents,
    version: "2.0.0",
    deployment: {
      platform: "Vercel",
      region: process.env.VERCEL_REGION || "local",
      environment: process.env.VERCEL_ENV || "development",
    },
  });
}
