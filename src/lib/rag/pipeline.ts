/**
 * RAG Pipeline — Ingest, Query, and Generate
 *
 * Full retrieval-augmented generation pipeline for legal documents.
 * Ingest: chunk → embed → store
 * Query: embed query → search → augment prompt → generate
 */

import { randomUUID } from "crypto";
import { embed, embedQuery } from "../ai/embeddings";
import { complete, type ChatMessage } from "../ai/provider";
import { MODEL_CONFIGS, RAG_CONFIG } from "../ai/config";
import { vectorStore, type DocumentMetadata, type SearchResult } from "./vectorstore";
import { chunkText, chunkLegalDocument } from "./chunker";

// ── Ingest ──

export interface IngestRequest {
  content: string;
  metadata: Omit<DocumentMetadata, "chunkIndex" | "totalChunks">;
  useLegalChunking?: boolean;
}

export interface IngestResult {
  source: string;
  chunksCreated: number;
  documentIds: string[];
}

/**
 * Ingest a document into the vector store.
 * Chunks the content, generates embeddings, and stores with metadata.
 */
export async function ingest(req: IngestRequest): Promise<IngestResult> {
  // Chunk the document
  const chunks = req.useLegalChunking
    ? chunkLegalDocument(req.content)
    : chunkText(req.content);

  if (chunks.length === 0) {
    return { source: req.metadata.source, chunksCreated: 0, documentIds: [] };
  }

  // Generate embeddings for all chunks in batch
  const texts = chunks.map((c) => c.content);
  const embeddings = await embed(texts);

  // Create vector documents
  const now = new Date().toISOString();
  const docs = chunks.map((chunk, i) => ({
    id: randomUUID(),
    content: chunk.content,
    embedding: embeddings[i],
    metadata: {
      ...req.metadata,
      chunkIndex: chunk.index,
      totalChunks: chunks.length,
    },
    createdAt: now,
  }));

  // Store in vector store
  await vectorStore.add(docs);

  return {
    source: req.metadata.source,
    chunksCreated: docs.length,
    documentIds: docs.map((d) => d.id),
  };
}

/**
 * Re-ingest a source (removes old chunks, adds new ones).
 */
export async function reingest(req: IngestRequest): Promise<IngestResult> {
  await vectorStore.removeBySource(req.metadata.source);
  return ingest(req);
}

// ── Query ──

export interface QueryRequest {
  query: string;
  matterId?: string;
  documentType?: string;
  topK?: number;
  minSimilarity?: number;
}

export interface QueryResult {
  answer: string;
  sources: SearchResult[];
  confidence: number;
  model: string;
  tokensUsed: number;
  durationMs: number;
}

/**
 * RAG query: retrieve relevant chunks and generate an answer.
 */
export async function query(req: QueryRequest): Promise<QueryResult> {
  const start = Date.now();

  // Embed the query
  const queryVec = await embedQuery(req.query);

  // Search vector store
  const filter: Partial<DocumentMetadata> = {};
  if (req.matterId) filter.matterId = req.matterId;
  if (req.documentType) filter.type = req.documentType;

  const sources = await vectorStore.search(
    queryVec,
    req.topK || RAG_CONFIG.topK,
    req.minSimilarity || RAG_CONFIG.minSimilarity,
    filter
  );

  // Build context from retrieved chunks
  const context = sources
    .map(
      (s, i) =>
        `[Source ${i + 1} | ${s.document.metadata.type} | similarity: ${s.similarity.toFixed(3)}]\n${s.document.content}`
    )
    .join("\n\n---\n\n");

  // Build messages for LLM
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `You are a legal research assistant for UNYKORN // LAW. You analyze legal documents, case law, statutes, and evidence with precision.

RULES:
- Base your answer ONLY on the provided context documents
- Cite specific sources using [Source N] notation
- If the context doesn't contain enough information, say so clearly
- Never fabricate legal citations or case law
- Flag any uncertainty with confidence qualifiers
- Maintain attorney-client privilege awareness`,
    },
    {
      role: "user",
      content: sources.length > 0
        ? `Context Documents:\n\n${context}\n\n---\n\nQuestion: ${req.query}`
        : `No relevant documents found in the knowledge base.\n\nQuestion: ${req.query}\n\nPlease indicate that no sources were found and provide general guidance only, clearly labeled as not based on case-specific documents.`,
    },
  ];

  // Generate answer
  const response = await complete({
    messages,
    config: MODEL_CONFIGS.research,
  });

  // Calculate confidence based on source quality
  const avgSimilarity =
    sources.length > 0
      ? sources.reduce((sum, s) => sum + s.similarity, 0) / sources.length
      : 0;
  const confidence = Math.min(avgSimilarity, 0.99);

  return {
    answer: response.content,
    sources,
    confidence,
    model: response.model,
    tokensUsed: response.tokensUsed,
    durationMs: Date.now() - start,
  };
}

// ── Pipeline Status ──

export async function pipelineStatus() {
  const stats = await vectorStore.stats();
  return {
    status: "operational",
    vectorStore: stats,
    config: {
      chunkSize: RAG_CONFIG.chunkSize,
      chunkOverlap: RAG_CONFIG.chunkOverlap,
      topK: RAG_CONFIG.topK,
      minSimilarity: RAG_CONFIG.minSimilarity,
      embeddingModel: MODEL_CONFIGS.embedding.model,
    },
  };
}
