import { NextResponse } from "next/server";
import { pipelineStatus } from "@/lib/rag/pipeline";
import { vectorStore } from "@/lib/rag/vectorstore";
import { requirePermission } from "@/lib/rbac";

// GET /api/rag/status — RAG pipeline status
export async function GET() {
  try {
    const status = await pipelineStatus();
    return NextResponse.json(status);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Status check failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/rag/status — Clear vector store (admin only)
export async function DELETE() {
  try {
    await requirePermission("admin:system");
    await vectorStore.clear();
    return NextResponse.json({ cleared: true, timestamp: new Date().toISOString() });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    const message = err instanceof Error ? err.message : "Clear failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
