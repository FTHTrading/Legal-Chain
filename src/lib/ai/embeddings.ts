/**
 * Embedding Service
 *
 * Generates vector embeddings via OpenAI text-embedding-3-small.
 * Used by the RAG pipeline for document indexing and query embedding.
 */

import OpenAI from "openai";

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY required for embeddings");
    _client = new OpenAI({ apiKey });
  }
  return _client;
}

const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";

/**
 * Generate embeddings for one or more texts.
 * Returns an array of float arrays (one per input text).
 */
export async function embed(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const client = getClient();
  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });

  // Sort by index to preserve ordering
  return response.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

/**
 * Generate a single embedding for a query string.
 */
export async function embedQuery(text: string): Promise<number[]> {
  const [result] = await embed([text]);
  return result;
}

/**
 * Cosine similarity between two vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}
