/**
 * Bootstrap script — Ingest governance documents into the RAG knowledge base.
 *
 * Usage: npx tsx scripts/ingest-governance.ts
 * Requires: OPENAI_API_KEY in .env.local (for embeddings)
 *
 * Ingests all governance Markdown files from the project root into the
 * vector store for retrieval by agents and RAG queries.
 */

import { readFile } from "fs/promises";
import { join } from "path";

const ROOT = join(import.meta.dirname, "..");

const GOVERNANCE_DOCS = [
  { file: "CONSTITUTION.md", type: "governance", title: "System Constitution" },
  { file: "GENESIS_RULES.md", type: "governance", title: "Genesis Rules" },
  { file: "MASTER_SYSTEM_REPORT.md", type: "governance", title: "Master System Report" },
  { file: "OPERATOR_RUNBOOK.md", type: "governance", title: "Operator Runbook" },
  { file: "THREAT_MODEL.md", type: "governance", title: "Threat Model" },
  { file: "PROOF_REQUIREMENTS.md", type: "governance", title: "Proof Requirements" },
  { file: "CLAIMS_TO_PROOF_MAP.md", type: "governance", title: "Claims to Proof Map" },
  { file: "ASSET_AND_VALUE_FLOW.md", type: "governance", title: "Asset and Value Flow" },
  { file: "CONTROL_AND_PERMISSIONS_MAP.md", type: "governance", title: "Control and Permissions Map" },
  { file: "VERIFICATION_MATRIX.md", type: "governance", title: "Verification Matrix" },
  { file: "LAUNCH_BLOCKERS.md", type: "governance", title: "Launch Blockers" },
  { file: "PUBLIC_RISK_DISCLOSURE.md", type: "governance", title: "Public Risk Disclosure" },
  { file: "PUBLIC_TRANSPARENCY_PAGE.md", type: "governance", title: "Public Transparency Page" },
  { file: "README.md", type: "memo", title: "System README" },
];

async function main() {
  // Dynamically check for API key
  const dotenv = await import("dotenv");
  dotenv.config({ path: join(ROOT, ".env.local") });

  if (!process.env.OPENAI_API_KEY) {
    console.error("ERROR: OPENAI_API_KEY not set in .env.local");
    console.error("Create .env.local with your key to generate embeddings.");
    process.exit(1);
  }

  // Dynamic imports to use the project's AI/RAG modules
  const { ingest } = await import("../src/lib/rag/pipeline.js");
  const { vectorStore } = await import("../src/lib/rag/vectorstore.js");

  console.log(`Starting governance document ingestion...`);
  console.log(`Documents to ingest: ${GOVERNANCE_DOCS.length}\n`);

  let totalChunks = 0;
  let success = 0;
  let failed = 0;

  for (const doc of GOVERNANCE_DOCS) {
    const filePath = join(ROOT, doc.file);
    try {
      const content = await readFile(filePath, "utf-8");
      if (!content.trim()) {
        console.log(`  SKIP  ${doc.file} (empty)`);
        continue;
      }

      const result = await ingest({
        content,
        metadata: {
          source: doc.file,
          type: doc.type,
          title: doc.title,
        },
        useLegalChunking: true,
        replaceExisting: true,
      });

      totalChunks += result.chunksStored;
      success++;
      console.log(`  OK    ${doc.file} → ${result.chunksStored} chunks`);
    } catch (err) {
      failed++;
      console.error(`  FAIL  ${doc.file}: ${err instanceof Error ? err.message : err}`);
    }
  }

  const stats = vectorStore.stats();
  console.log(`\n--- Ingestion Complete ---`);
  console.log(`Documents: ${success} ingested, ${failed} failed`);
  console.log(`Total chunks in store: ${stats.totalDocuments}`);
  console.log(`Vector store persisted to .legal-chain/vectorstore.json`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
