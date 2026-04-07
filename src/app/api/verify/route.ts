/**
 * EXTERNAL VERIFIER API — /api/verify
 *
 * Standalone bundle verification for third parties.
 * Accepts a truth bundle (JSON) and validates integrity
 * without requiring access to the app's internal state.
 *
 * POST /api/verify              — verify a full export bundle
 * POST /api/verify?mode=entity  — verify a single entity chain within a bundle
 */

import { NextRequest, NextResponse } from "next/server";
import { ReplayEngine } from "@/lib/kernel/replay";
import type { ExportBundle } from "@/lib/kernel/replay";
import type { EntityType } from "@/lib/kernel/state";

const engine = new ReplayEngine();

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") ?? "bundle";

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // ── Bundle verification ─────────────────────────────────────────────
  if (mode === "bundle") {
    const bundle = body as unknown as ExportBundle;

    if (bundle.format !== "unykorn-truth-bundle-v1") {
      return NextResponse.json(
        { error: "Unknown bundle format. Expected 'unykorn-truth-bundle-v1'." },
        { status: 400 },
      );
    }

    const result = engine.verifyBundle(bundle);

    // Also run per-entity verification for detail
    const entityKeys = new Set(
      bundle.truthRecords.map((r: { entityType: string; entityId: string }) => `${r.entityType}:${r.entityId}`)
    );
    const entityResults = Array.from(entityKeys).map(key => {
      const [et, eid] = key.split(":", 2);
      return engine.verify(bundle.truthRecords, et as EntityType, eid);
    });

    return NextResponse.json({
      verified: result.valid,
      bundleFingerprint: bundle.bundleFingerprint,
      issues: result.issues,
      totalRecords: bundle.recordCount,
      entityResults: entityResults.map(r => ({
        entityType: r.entityType,
        entityId: r.entityId,
        totalVersions: r.totalVersions,
        valid: r.valid,
        brokenAt: r.brokenAt,
      })),
      brokenEntities: entityResults.filter(r => !r.valid).length,
      timestamp: new Date().toISOString(),
    });
  }

  // ── Single entity verification within a bundle ──────────────────────
  if (mode === "entity") {
    const bundle = body.bundle as ExportBundle | undefined;
    const entityType = body.entityType as EntityType | undefined;
    const entityId = body.entityId as string | undefined;

    if (!bundle || !entityType || !entityId) {
      return NextResponse.json(
        { error: "mode=entity requires: bundle, entityType, entityId" },
        { status: 400 },
      );
    }

    const result = engine.verify(bundle.truthRecords, entityType, entityId);

    return NextResponse.json({
      entityType,
      entityId,
      totalVersions: result.totalVersions,
      valid: result.valid,
      brokenAt: result.brokenAt,
      details: result.details,
      timestamp: new Date().toISOString(),
    });
  }

  return NextResponse.json(
    { error: "mode must be 'bundle' or 'entity'" },
    { status: 400 },
  );
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/verify",
    description: "External truth bundle verifier — no authentication required for read-only verification",
    methods: {
      POST: {
        "mode=bundle": "Submit a full ExportBundle JSON to verify integrity of all entity chains + bundle fingerprint",
        "mode=entity": "Submit { bundle, entityType, entityId } to verify a single entity chain",
      },
    },
    bundleFormat: "unykorn-truth-bundle-v1",
  });
}
