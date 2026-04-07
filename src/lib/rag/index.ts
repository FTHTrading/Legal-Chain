/**
 * RAG Module — Barrel Export
 */

export { vectorStore } from "./vectorstore";
export type { VectorDocument, DocumentMetadata, SearchResult } from "./vectorstore";

export { chunkText, chunkLegalDocument } from "./chunker";
export type { Chunk } from "./chunker";

export { ingest, reingest, query, pipelineStatus } from "./pipeline";
export type { IngestRequest, IngestResult, QueryRequest, QueryResult } from "./pipeline";
