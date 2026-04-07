/**
 * Vault API Route
 *
 * GET  — Vault stats and summaries (no PII)
 * POST — Decrypt specific vault record (requires role auth)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getVaultStats,
  getVaultSummaries,
  vaultStore_decrypt,
  anchorVaultRecord,
} from "@/lib/privacy/vault";

const VAULT_TOKEN = process.env.VAULT_API_TOKEN;

function checkAuth(request: NextRequest): boolean {
  if (!VAULT_TOKEN) return false;
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === VAULT_TOKEN;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const matterId = searchParams.get("matterId");
  const view = searchParams.get("view");

  if (view === "stats") {
    return NextResponse.json(getVaultStats());
  }

  if (matterId) {
    const summaries = getVaultSummaries(matterId);
    return NextResponse.json({
      matterId,
      recordCount: summaries.length,
      records: summaries,
      note: "Vault summaries contain content hashes only. No PII is returned.",
    });
  }

  // Default: global stats
  return NextResponse.json(getVaultStats());
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, recordId, role } = body;

    if (action === "decrypt") {
      if (!checkAuth(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (!recordId || !role) {
        return NextResponse.json(
          { error: "recordId and role are required for decryption" },
          { status: 400 }
        );
      }

      const result = await vaultStore_decrypt(recordId, role);
      if (!result) {
        return NextResponse.json(
          { error: "Access denied or record not found" },
          { status: 403 }
        );
      }

      return NextResponse.json({
        id: result.id,
        fieldType: result.fieldType,
        value: result.value,
        verified: result.verified,
        warning: "This response contains PII. Handle according to data protection policies.",
      });
    }

    if (action === "anchor") {
      if (!recordId) {
        return NextResponse.json(
          { error: "recordId is required" },
          { status: 400 }
        );
      }

      const txHash = body.txHash;
      if (!txHash) {
        return NextResponse.json(
          { error: "txHash is required for anchoring" },
          { status: 400 }
        );
      }

      const ok = anchorVaultRecord(recordId, txHash);
      if (!ok) {
        return NextResponse.json(
          { error: "Record not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ anchored: true, recordId, txHash });
    }

    return NextResponse.json(
      { error: "Invalid action. Use: decrypt, anchor" },
      { status: 400 }
    );
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
