/**
 * KERNEL API — /api/kernel
 *
 * Unified entry point for querying and operating the Truth Kernel.
 *
 * GET  /api/kernel              — kernel stats + layer summary
 * GET  /api/kernel?layer=...    — data from a specific layer
 * POST /api/kernel              — operations (attest, anchor, buildRoot, etc.)
 */

import { NextRequest, NextResponse } from "next/server";
import { truthKernel } from "@/lib/kernel";

// ─── GET ────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const layer = searchParams.get("layer");
  const entityId = searchParams.get("entityId");
  const entityType = searchParams.get("entityType");
  const matterId = searchParams.get("matterId");

  // Default: return full kernel stats
  if (!layer) {
    return NextResponse.json({
      kernel: "unykorn-truth-kernel-v2",
      stats: truthKernel.stats,
      timestamp: new Date().toISOString(),
    });
  }

  switch (layer) {
    case "state": {
      if (entityId && entityType) {
        const canonical = truthKernel.state.canonical(entityType as Parameters<typeof truthKernel.state.canonical>[0], entityId);
        const history = truthKernel.state.history(entityType as Parameters<typeof truthKernel.state.history>[0], entityId);
        return NextResponse.json({ canonical, history, historyLength: history.length });
      }
      if (entityType) {
        const entities = truthKernel.state.entities(entityType as Parameters<typeof truthKernel.state.entities>[0]);
        return NextResponse.json({ entityType, entities, count: entities.length });
      }
      return NextResponse.json({ truthRecords: truthKernel.state.truthCount, entities: truthKernel.state.entityCount });
    }

    case "proof": {
      return NextResponse.json({
        artifacts: truthKernel.proof.artifactCount,
        manifests: truthKernel.proof.manifestCount,
        anchors: truthKernel.proof.anchorCount,
        confirmedAnchors: truthKernel.proof.confirmedAnchors,
      });
    }

    case "attestations": {
      const status = searchParams.get("status") ?? undefined;
      const attesterClass = searchParams.get("attesterClass") ?? undefined;
      const targetId = searchParams.get("targetId") ?? undefined;
      const targetType = searchParams.get("targetType") ?? undefined;
      const minConfidence = searchParams.get("minConfidence");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: Record<string, any> = {};
      if (status) query.status = status;
      if (attesterClass) query.attesterClass = attesterClass;
      if (targetId) query.targetId = targetId;
      if (targetType) query.targetType = targetType;
      if (matterId) query.matterId = matterId;
      if (minConfidence) query.minConfidence = parseFloat(minConfidence);

      const attestations = truthKernel.attestations.query(query);
      return NextResponse.json({ attestations, count: attestations.length });
    }

    case "settlement": {
      return NextResponse.json({
        payments: truthKernel.settlement.paymentCount,
        pendingPayments: truthKernel.settlement.pendingPayments,
        settledTotals: truthKernel.settlement.settledTotal,
      });
    }

    case "roots": {
      const roots = truthKernel.roots.all;
      const latest = truthKernel.roots.latest;
      return NextResponse.json({
        roots,
        latest,
        count: roots.length,
        anchoredCount: truthKernel.roots.anchoredRootCount,
      });
    }

    case "twins": {
      const domain = searchParams.get("domain") ?? undefined;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const models = truthKernel.twins.getModels(domain as any);
      const runs = truthKernel.twins.getRuns(matterId ?? undefined);
      return NextResponse.json({
        models,
        runs,
        modelCount: models.length,
        runCount: runs.length,
      });
    }

    default:
      return NextResponse.json(
        { error: "Unknown layer", validLayers: ["state", "proof", "attestations", "settlement", "roots", "twins"] },
        { status: 400 },
      );
  }
}

// ─── POST ───────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const action = body.action as string;
  if (!action) {
    return NextResponse.json({ error: "Missing 'action' field" }, { status: 400 });
  }

  switch (action) {
    // ── Attestations ────────────────────────────────────────────────
    case "attest": {
      const { targetType, targetId, type, assertion, attesterClass, attesterId, attesterName,
        attesterCredentials, confidence, evidence, matterId: mid, expiresAt, metadata } = body as Record<string, unknown>;
      if (!targetType || !targetId || !type || !assertion || !attesterClass || !attesterId || !attesterName) {
        return NextResponse.json({ error: "Missing required attestation fields" }, { status: 400 });
      }
      const att = truthKernel.attestations.attest({
        targetType: targetType as string,
        targetId: targetId as string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: type as any,
        assertion: assertion as string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        attesterClass: attesterClass as any,
        attesterId: attesterId as string,
        attesterName: attesterName as string,
        attesterCredentials: (attesterCredentials as string) ?? "",
        confidence: typeof confidence === "number" ? confidence : 1,
        evidence: Array.isArray(evidence) ? evidence : [],
        matterId: (mid as string) ?? undefined,
        expiresAt: (expiresAt as string) ?? undefined,
        metadata: (metadata as Record<string, unknown>) ?? {},
      });
      return NextResponse.json({ attestation: att }, { status: 201 });
    }

    case "revoke_attestation": {
      const { attestationId, reason } = body as Record<string, string>;
      if (!attestationId || !reason) {
        return NextResponse.json({ error: "Missing attestationId or reason" }, { status: 400 });
      }
      truthKernel.attestations.revoke(attestationId, reason);
      return NextResponse.json({ revoked: attestationId });
    }

    case "anchor_attestation": {
      const { attestationId, chain, txHash, blockNumber } = body as Record<string, unknown>;
      if (!attestationId || !chain || !txHash) {
        return NextResponse.json({ error: "Missing attestationId, chain, or txHash" }, { status: 400 });
      }
      truthKernel.attestations.anchor(
        attestationId as string, chain as string,
        txHash as string, (blockNumber as number) ?? 0,
      );
      return NextResponse.json({ anchored: attestationId });
    }

    // ── Roots ───────────────────────────────────────────────────────
    case "build_root": {
      const { createdBy } = body as Record<string, string>;
      const root = truthKernel.roots.buildRoot(createdBy || "api");
      return NextResponse.json({ root }, { status: 201 });
    }

    case "anchor_root": {
      const { rootId, chain, txHash, blockNumber } = body as Record<string, unknown>;
      if (!rootId || !chain || !txHash) {
        return NextResponse.json({ error: "Missing rootId, chain, or txHash" }, { status: 400 });
      }
      truthKernel.roots.anchorRoot(rootId as string, chain as string, txHash as string, (blockNumber as number) ?? 0);
      return NextResponse.json({ anchored: rootId });
    }

    case "verify_root": {
      const { rootId } = body as Record<string, string>;
      if (!rootId) {
        return NextResponse.json({ error: "Missing rootId" }, { status: 400 });
      }
      const result = truthKernel.roots.verifyRoot(rootId);
      return NextResponse.json({ verification: result });
    }

    // ── Replay / Export ─────────────────────────────────────────────
    case "export_bundle": {
      const { scope, exportedBy } = body as Record<string, unknown>;
      if (!scope || !exportedBy) {
        return NextResponse.json({ error: "Missing scope or exportedBy" }, { status: 400 });
      }
      const bundle = truthKernel.replay.buildBundle({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        scope: scope as any,
        exportedBy: exportedBy as string,
        truthRecords: truthKernel.state.allRecords,
        attestations: truthKernel.attestations.allAttestations,
        artifacts: truthKernel.proof.allArtifacts,
        manifests: truthKernel.proof.allManifests,
        anchors: truthKernel.proof.allAnchors,
        lineage: truthKernel.proof.allLineage,
        payments: truthKernel.settlement.allPayments,
        milestones: truthKernel.settlement.allMilestones,
        rights: truthKernel.settlement.allRights,
        revenue: truthKernel.settlement.allRevenue,
        roots: truthKernel.roots.all,
      });
      return NextResponse.json({ bundle });
    }

    // ── Twins ───────────────────────────────────────────────────────
    case "register_model": {
      const { domain, modelName, version, description, parameterSchema, sourceHash, createdBy: creator } = body as Record<string, unknown>;
      if (!domain || !modelName || !version || !sourceHash) {
        return NextResponse.json({ error: "Missing required model fields" }, { status: 400 });
      }
      const model = truthKernel.twins.registerModel({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        domain: domain as any,
        modelName: modelName as string,
        version: version as string,
        description: (description as string) ?? "",
        parameterSchema: (parameterSchema as Record<string, unknown>) ?? {},
        sourceHash: sourceHash as string,
        createdBy: (creator as string) ?? "api",
      });
      return NextResponse.json({ model }, { status: 201 });
    }

    case "start_run": {
      const { modelVersionId, scenarioId, createdBy: runner, matterId: runMatter, previousRunId } = body as Record<string, string>;
      if (!modelVersionId || !scenarioId) {
        return NextResponse.json({ error: "Missing modelVersionId or scenarioId" }, { status: 400 });
      }
      const run = truthKernel.twins.startRun({
        modelVersionId, scenarioId,
        createdBy: runner ?? "api",
        matterId: runMatter,
        previousRunId,
      });
      return NextResponse.json({ run }, { status: 201 });
    }

    default:
      return NextResponse.json(
        { error: "Unknown action", action },
        { status: 400 },
      );
  }
}
