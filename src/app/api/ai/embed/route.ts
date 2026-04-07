import { NextResponse } from "next/server";
import { embed } from "@/lib/ai/embeddings";

// POST /api/ai/embed — Generate embeddings for texts
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { texts }: { texts: string[] } = body;

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ error: "texts array required" }, { status: 400 });
    }

    if (texts.length > 100) {
      return NextResponse.json({ error: "Maximum 100 texts per request" }, { status: 400 });
    }

    const start = Date.now();
    const embeddings = await embed(texts);

    return NextResponse.json({
      embeddings: embeddings.map((e, i) => ({
        index: i,
        dimensions: e.length,
        embedding: e,
      })),
      count: embeddings.length,
      durationMs: Date.now() - start,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Embedding failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
