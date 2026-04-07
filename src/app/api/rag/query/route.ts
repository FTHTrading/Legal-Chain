import { NextResponse } from "next/server";
import { query } from "@/lib/rag/pipeline";

// POST /api/rag/query — RAG query (retrieve + generate)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query: queryText, matterId, documentType, topK, minSimilarity } = body as {
      query: string;
      matterId?: string;
      documentType?: string;
      topK?: number;
      minSimilarity?: number;
    };

    if (!queryText || typeof queryText !== "string") {
      return NextResponse.json({ error: "query (string) required" }, { status: 400 });
    }

    const result = await query({
      query: queryText,
      matterId,
      documentType,
      topK,
      minSimilarity,
    });

    return NextResponse.json({
      answer: result.answer,
      confidence: result.confidence,
      sourceCount: result.sources.length,
      sources: result.sources.map((s) => ({
        type: s.document.metadata.type,
        source: s.document.metadata.source,
        title: s.document.metadata.title,
        similarity: s.similarity,
        rank: s.rank,
        excerpt: s.document.content.slice(0, 300),
      })),
      model: result.model,
      tokensUsed: result.tokensUsed,
      durationMs: result.durationMs,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Query failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
