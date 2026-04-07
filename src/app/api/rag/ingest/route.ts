import { NextResponse } from "next/server";
import { ingest, reingest } from "@/lib/rag/pipeline";

// POST /api/rag/ingest — Ingest a document into the RAG knowledge base
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, source, type, matterId, title, replace } = body as {
      content: string;
      source: string;
      type: string;
      matterId?: string;
      title?: string;
      replace?: boolean;
    };

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "content (string) required" }, { status: 400 });
    }
    if (!source || typeof source !== "string") {
      return NextResponse.json({ error: "source (string) required" }, { status: 400 });
    }
    if (!type || typeof type !== "string") {
      return NextResponse.json({ error: "type (string) required" }, { status: 400 });
    }

    const ingestFn = replace ? reingest : ingest;
    const result = await ingestFn({
      content,
      metadata: { source, type, matterId, title },
      useLegalChunking: true,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ingest failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
