/**
 * POST /api/chain/polygon/anchor
 *
 * The AI–Blockchain bridge. One call does three things atomically:
 *   1. Pin document content to IPFS (content-addressed CID)
 *   2. Anchor hash + CID to DocumentRegistry + AuditAnchor on Polygon
 *   3. Auto-ingest document into the RAG vector store
 *
 * Body: { content, filename, docType, caseRef?, matterId?, title? }
 * Returns: { ipfsCid, txHash, explorerUrl, docId, anchorId, ragChunks }
 */

import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { getIssuerWallet, getPolygonConfig } from "@/lib/polygon/client";
import { POLYGON_NETWORKS } from "@/lib/polygon/types";
import { DocumentRegistry_ABI, AuditAnchor_ABI } from "@/lib/polygon/abis";
import { pinJSON } from "@/lib/polygon/ipfs";
import { ingest } from "@/lib/rag/pipeline";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      content,
      filename,
      docType,
      caseRef,
      matterId,
      title,
    } = body as {
      content:   string;
      filename:  string;
      docType:   string;
      caseRef?:  string;
      matterId?: string;
      title?:    string;
    };

    // ── Validate ──
    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "content (string) required" }, { status: 400 });
    }
    if (!filename || typeof filename !== "string") {
      return NextResponse.json({ error: "filename (string) required" }, { status: 400 });
    }
    if (!docType || typeof docType !== "string") {
      return NextResponse.json({ error: "docType (string) required" }, { status: 400 });
    }

    const config  = getPolygonConfig();
    const netInfo = POLYGON_NETWORKS[config.network];
    const safeRef = caseRef || "UNANCHORED";

    // ── Step 1: Pin to IPFS ──
    const ipfsResult = await pinJSON({
      content,
      filename,
      caseRef: safeRef,
      docType,
      matterId,
      title,
      anchoredAt: new Date().toISOString(),
    });
    const ipfsCid = ipfsResult.cid;
    const ipfsGatewayUrl = `${process.env.IPFS_GATEWAY_URL || "https://ipfs.io/ipfs"}/${ipfsCid}`;

    // ── Step 2: Anchor on-chain ──
    // Compute keccak256 hash of the content
    const contentHash = ethers.keccak256(ethers.toUtf8Bytes(content));

    const issuer = getIssuerWallet();

    const docRegistry = new ethers.Contract(
      config.contracts.documentRegistry,
      DocumentRegistry_ABI,
      issuer
    );
    const auditAnchor = new ethers.Contract(
      config.contracts.auditAnchor,
      AuditAnchor_ABI,
      issuer
    );

    // Register on DocumentRegistry (includes IPFS CID)
    const regTx = await docRegistry.register(contentHash, safeRef, docType, ipfsCid);
    const regReceipt = await regTx.wait();

    // Also anchor batch hash on AuditAnchor for immutable audit trail
    const anchorTx = await auditAnchor.anchor(contentHash, 1);
    const anchorReceipt = await anchorTx.wait();

    // Parse docId from DocumentRegistry event
    let docId: number | null = null;
    for (const log of regReceipt.logs ?? []) {
      try {
        const iface = new ethers.Interface(DocumentRegistry_ABI);
        const parsed = iface.parseLog(log);
        if (parsed?.name === "DocumentRegistered") {
          docId = Number(parsed.args.docId ?? parsed.args[0]);
        }
      } catch { /* skip unrelated logs */ }
    }

    // Parse anchorId from AuditAnchor event
    let anchorId: number | null = null;
    for (const log of anchorReceipt.logs ?? []) {
      try {
        const iface = new ethers.Interface(AuditAnchor_ABI);
        const parsed = iface.parseLog(log);
        if (parsed?.name === "AuditAnchored") {
          anchorId = Number(parsed.args.anchorId ?? parsed.args[0]);
        }
      } catch { /* skip unrelated logs */ }
    }

    // ── Step 3: Ingest into RAG vectorstore ──
    let ragChunks = 0;
    try {
      const ragResult = await ingest({
        content,
        metadata: {
          source: ipfsCid,
          type: docType,
          matterId,
          title: title || filename,
          tags: ["blockchain-anchored", `caseRef:${safeRef}`, `ipfs:${ipfsCid}`],
        },
        useLegalChunking: true,
      });
      ragChunks = ragResult.chunksCreated;
    } catch (ragErr) {
      // RAG ingest failing (e.g. no OpenAI key) should NOT block anchoring
      console.warn("[anchor] RAG ingest skipped:", ragErr instanceof Error ? ragErr.message : ragErr);
    }

    return NextResponse.json({
      success: true,
      ipfsCid,
      ipfsGatewayUrl,
      contentHash,
      docRegistry: {
        txHash:  regTx.hash,
        docId,
        block:   regReceipt.blockNumber,
        explorerUrl: `${netInfo.explorer}/tx/${regTx.hash}`,
      },
      auditAnchor: {
        txHash:  anchorTx.hash,
        anchorId,
        block:   anchorReceipt.blockNumber,
        explorerUrl: `${netInfo.explorer}/tx/${anchorTx.hash}`,
      },
      rag: {
        ingested: ragChunks > 0,
        chunks: ragChunks,
      },
    }, { status: 201 });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Anchor failed";
    console.error("[anchor]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
