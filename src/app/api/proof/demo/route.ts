/**
 * Proof — Live AI Demo
 *
 * Takes a legal question, routes it to an actual AI agent,
 * and returns the real analysis with metadata proving it ran.
 * Rate-limited to prevent abuse.
 */

import { NextRequest, NextResponse } from "next/server";
import { routeTask, initRuntime } from "@/lib/agents/runtime";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// ── Rate Limiter ──

const rateLimit = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const times = (rateLimit.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (times.length >= MAX_REQUESTS) return true;
  times.push(now);
  rateLimit.set(ip, times);
  return false;
}

// ── Handler ──

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Maximum 5 requests per minute." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { question } = body;

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "A legal question is required." },
        { status: 400 }
      );
    }

    const trimmed = question.trim();
    if (trimmed.length < 10) {
      return NextResponse.json(
        { error: "Please provide more detail (minimum 10 characters)." },
        { status: 400 }
      );
    }

    if (trimmed.length > 500) {
      return NextResponse.json(
        { error: "Question must be under 500 characters." },
        { status: 400 }
      );
    }

    // Ensure runtime is initialized
    initRuntime();

    // Route to case strategy team for analysis
    const result = await routeTask("case_strategy", trimmed, {
      context: [
        "PUBLIC DEMO MODE: A visitor on the UNYKORN // LAW proof page is testing the system.",
        "Provide a general legal analysis of their situation.",
        "Identify relevant legal concepts, potential claims or defenses, and recommended next steps.",
        "Do NOT provide specific legal advice — you are demonstrating the platform's analytical capability.",
        "Be thorough, cite general legal principles, and include a confidence assessment.",
        "Keep the response under 400 words.",
      ].join("\n"),
    });

    return NextResponse.json({
      agent: { name: result.agentName, id: result.agentId },
      analysis: result.output,
      confidence: result.confidenceScore,
      toolsUsed: result.toolCallsMade,
      model: result.model,
      processingTimeMs: result.durationMs,
      tokensUsed: result.tokensUsed,
      escalated: result.escalated,
      escalationReason: result.escalationReason,
      disclaimer:
        "This is AI-generated analysis for demonstration purposes only. It does not constitute legal advice. No attorney-client relationship is formed. Consult a licensed attorney for your specific situation.",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";

    // Provide helpful error for common issues
    if (message.includes("API_KEY") || message.includes("not configured")) {
      return NextResponse.json(
        {
          error: "AI provider temporarily unavailable.",
          detail: "The system's AI connection is being configured. Try again shortly.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
