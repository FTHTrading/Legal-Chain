/**
 * INTAKE SCORING API — /api/intake-scoring
 *
 * Exposes civil legal need triage and criminal severity scoring.
 *
 * POST /api/intake-scoring  { type: "civil", data }   → scored civil need
 * POST /api/intake-scoring  { type: "criminal", data } → scored criminal need
 * GET  /api/intake-scoring?type=civil                  → category defaults
 * GET  /api/intake-scoring?type=criminal               → level defaults
 */

import { NextRequest, NextResponse } from "next/server";
import {
  computeCivilComposite,
  CATEGORY_URGENCY_DEFAULTS,
  type CivilLegalCategory,
} from "@/lib/schemas/civil-legal-needs";
import {
  computeCriminalComposite,
  applyMultipliers,
  LEVEL_DEFAULTS,
  type CriminalSeverityLevel,
  type SeverityMultiplier,
} from "@/lib/schemas/criminal-severity";

// ─── GET ────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (type === "civil") {
    return NextResponse.json({
      type: "civil",
      categoryDefaults: CATEGORY_URGENCY_DEFAULTS,
      axes: ["timeSensitivity", "stabilityRisk", "collateralConsequences", "vulnerablePartyFactor"],
      scoreRange: { min: 1, max: 10 },
    });
  }

  if (type === "criminal") {
    return NextResponse.json({
      type: "criminal",
      levelDefaults: LEVEL_DEFAULTS,
      axes: ["libertyRisk", "familyStabilityRisk", "collateralConsequences", "timeSensitivity"],
      scoreRange: { min: 1, max: 10 },
      note: "libertyRisk weighted 1.5x in composite",
    });
  }

  return NextResponse.json({
    endpoint: "/api/intake-scoring",
    methods: {
      GET: "?type=civil | ?type=criminal — returns scoring defaults",
      POST: "{ type, triage, multipliers? } — computes composite score",
    },
  });
}

// ─── POST ───────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const type = body.type as string | undefined;

  if (type === "civil") {
    const triage = body.triage as {
      timeSensitivity?: number;
      stabilityRisk?: number;
      collateralConsequences?: number;
      vulnerablePartyFactor?: number;
    } | undefined;

    if (!triage) {
      return NextResponse.json({ error: "Missing triage axes" }, { status: 400 });
    }

    const axes = {
      timeSensitivity: clamp(triage.timeSensitivity ?? 5),
      stabilityRisk: clamp(triage.stabilityRisk ?? 5),
      collateralConsequences: clamp(triage.collateralConsequences ?? 5),
      vulnerablePartyFactor: clamp(triage.vulnerablePartyFactor ?? 5),
    };

    const composite = computeCivilComposite(axes);

    // Optionally apply category defaults as baseline
    const category = body.category as CivilLegalCategory | undefined;
    const defaults = category ? CATEGORY_URGENCY_DEFAULTS[category] : undefined;

    return NextResponse.json({
      type: "civil",
      composite,
      axes,
      category,
      categoryDefaults: defaults,
      priority: priorityFromScore(composite),
      timestamp: new Date().toISOString(),
    });
  }

  if (type === "criminal") {
    const triage = body.triage as {
      libertyRisk?: number;
      familyStabilityRisk?: number;
      collateralConsequences?: number;
      timeSensitivity?: number;
    } | undefined;

    if (!triage) {
      return NextResponse.json({ error: "Missing triage axes" }, { status: 400 });
    }

    const axes = {
      libertyRisk: clamp(triage.libertyRisk ?? 5),
      familyStabilityRisk: clamp(triage.familyStabilityRisk ?? 5),
      collateralConsequences: clamp(triage.collateralConsequences ?? 5),
      timeSensitivity: clamp(triage.timeSensitivity ?? 5),
    };

    let composite = computeCriminalComposite(axes);

    // Apply multipliers if provided
    const multipliers = body.multipliers as SeverityMultiplier[] | undefined;
    if (multipliers && multipliers.length > 0) {
      composite = applyMultipliers(composite, multipliers);
    }

    const level = body.level as CriminalSeverityLevel | undefined;
    const defaults = level ? LEVEL_DEFAULTS[level] : undefined;

    return NextResponse.json({
      type: "criminal",
      composite,
      axes,
      level,
      levelDefaults: defaults,
      multipliersApplied: multipliers?.length ?? 0,
      priority: priorityFromScore(composite),
      timestamp: new Date().toISOString(),
    });
  }

  return NextResponse.json(
    { error: "type must be 'civil' or 'criminal'" },
    { status: 400 },
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function clamp(v: number, min = 1, max = 10): number {
  return Math.max(min, Math.min(max, v));
}

function priorityFromScore(score: number): string {
  if (score >= 8.5) return "critical";
  if (score >= 6.5) return "high";
  if (score >= 4.0) return "normal";
  return "low";
}
