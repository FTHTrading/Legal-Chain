/**
 * Private Case Access API Route
 *
 * Validates HMAC-signed private link tokens before returning
 * any case data. Public access returns NOTHING — you must
 * have a valid signed token to access case information.
 *
 * GET /api/cases/private?token=plk_xxx — Access via private link
 */

import { NextRequest, NextResponse } from "next/server";
import { validatePrivateLink } from "@/lib/privacy/private-links";
import { getVaultSummaries, vaultStore_decrypt } from "@/lib/privacy/vault";
import { getOrchestration, listOrchestrations } from "@/lib/orchestrator/orchestrator";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  // No token = no access. Period.
  if (!token) {
    return NextResponse.json(
      {
        error: "Access denied",
        message: "A valid private link token is required to access case data. " +
          "Contact your attorney for a secure access link.",
      },
      { status: 401 }
    );
  }

  // Validate the token
  const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined;
  const validation = await validatePrivateLink(token, clientIP || undefined);

  if (!validation.valid || !validation.link) {
    return NextResponse.json(
      {
        error: "Invalid or expired link",
        reason: validation.reason,
        message: "This private link is no longer valid. Contact your attorney for a new access link.",
      },
      { status: 403 }
    );
  }

  const link = validation.link;

  // Build response based on link scope
  const response: Record<string, unknown> = {
    matterId: link.matterId,
    scope: link.scope,
    accessGranted: true,
    expiresAt: link.expiresAt,
    remainingUses: link.maxUses - link.usedCount,
  };

  switch (link.scope) {
    case "case_summary": {
      // PII-free summary only
      const orchestrations = listOrchestrations().filter(o => o.matterId === link.matterId);
      response.summary = {
        orchestrationCount: orchestrations.length,
        latestStatus: orchestrations[0]?.status || "no_orchestration",
        completedSteps: orchestrations.reduce((sum, o) => sum + o.completedSteps, 0),
        totalSteps: orchestrations.reduce((sum, o) => sum + o.totalSteps, 0),
      };
      break;
    }

    case "investigation": {
      const orchestrations = listOrchestrations().filter(o => o.matterId === link.matterId);
      response.investigations = orchestrations.map(o => ({
        id: o.id,
        workflowName: o.workflowName,
        status: o.status,
        completedSteps: o.completedSteps,
        totalSteps: o.totalSteps,
        startedAt: o.startedAt,
        completedAt: o.completedAt,
      }));
      break;
    }

    case "full_case": {
      // Full access including vault summaries (not plaintext — summaries only)
      const vaultSummaries = getVaultSummaries(link.matterId);
      const orchestrations = listOrchestrations().filter(o => o.matterId === link.matterId);

      response.vaultRecords = vaultSummaries.map(v => ({
        id: v.id,
        fieldType: v.fieldType,
        contentHash: v.contentHash,
        anchored: v.anchored,
        // NO plaintext ever returned in API response
      }));
      response.orchestrations = orchestrations;

      // If specific vault records are authorized, allow decryption
      if (link.vaultRecordIds.length > 0 && link.requiresWalletAuth) {
        response.decryptionAvailable = true;
        response.authorizedRecords = link.vaultRecordIds;
        response.note = "Wallet signature required to decrypt PII fields.";
      }
      break;
    }

    default: {
      // All other scopes get vault summaries (no plaintext)
      response.vaultSummaries = getVaultSummaries(link.matterId);
      break;
    }
  }

  return NextResponse.json(response);
}
