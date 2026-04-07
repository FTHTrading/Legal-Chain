/**
 * In-Memory Vector Store
 *
 * Stores document chunks with their embeddings for similarity search.
 * Persists to disk as JSON for durability between restarts.
 * Suitable for legal workloads (hundreds to low-thousands of documents).
 */

import { cosineSimilarity } from "../ai/embeddings";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

// ── Types ──

export interface VectorDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: DocumentMetadata;
  createdAt: string;
}

export interface DocumentMetadata {
  source: string;          // file path, URL, or matter ID
  type: string;            // "legal_brief" | "case_law" | "statute" | "evidence" | "correspondence" | etc
  matterId?: string;       // linked matter
  title?: string;
  author?: string;
  chunkIndex?: number;     // position within original document
  totalChunks?: number;
  tags?: string[];
}

export interface SearchResult {
  document: VectorDocument;
  similarity: number;
  rank: number;
}

// ── Vector Store ──

const STORE_DIR = join(process.cwd(), ".legal-chain");
const STORE_FILE = join(STORE_DIR, "vectorstore.json");

class VectorStore {
  private documents: Map<string, VectorDocument> = new Map();
  private loaded = false;

  /** Load store from disk on first access. */
  private async ensureLoaded(): Promise<void> {
    if (this.loaded) return;
    try {
      const data = await readFile(STORE_FILE, "utf-8");
      const docs: VectorDocument[] = JSON.parse(data);
      for (const doc of docs) {
        this.documents.set(doc.id, doc);
      }
    } catch {
      // File doesn't exist yet — start fresh
    }
    this.loaded = true;
  }

  /** Persist store to disk. */
  private async save(): Promise<void> {
    await mkdir(STORE_DIR, { recursive: true });
    const docs = Array.from(this.documents.values());
    await writeFile(STORE_FILE, JSON.stringify(docs), "utf-8");
  }

  /** Add documents with pre-computed embeddings. */
  async add(docs: VectorDocument[]): Promise<void> {
    await this.ensureLoaded();
    for (const doc of docs) {
      this.documents.set(doc.id, doc);
    }
    await this.save();
  }

  /** Remove documents by ID. */
  async remove(ids: string[]): Promise<number> {
    await this.ensureLoaded();
    let removed = 0;
    for (const id of ids) {
      if (this.documents.delete(id)) removed++;
    }
    if (removed > 0) await this.save();
    return removed;
  }

  /** Remove all documents matching a source. */
  async removeBySource(source: string): Promise<number> {
    await this.ensureLoaded();
    const toRemove: string[] = [];
    for (const [id, doc] of this.documents) {
      if (doc.metadata.source === source) toRemove.push(id);
    }
    return this.remove(toRemove);
  }

  /**
   * Search by embedding vector. Returns top-k results above min similarity.
   */
  async search(
    queryEmbedding: number[],
    topK: number = 5,
    minSimilarity: number = 0.7,
    filter?: Partial<DocumentMetadata>
  ): Promise<SearchResult[]> {
    await this.ensureLoaded();

    const results: SearchResult[] = [];

    for (const doc of this.documents.values()) {
      // Apply metadata filter
      if (filter) {
        if (filter.matterId && doc.metadata.matterId !== filter.matterId) continue;
        if (filter.type && doc.metadata.type !== filter.type) continue;
        if (filter.source && doc.metadata.source !== filter.source) continue;
      }

      const similarity = cosineSimilarity(queryEmbedding, doc.embedding);
      if (similarity >= minSimilarity) {
        results.push({ document: doc, similarity, rank: 0 });
      }
    }

    // Sort by similarity descending, take top-k
    results.sort((a, b) => b.similarity - a.similarity);
    const topResults = results.slice(0, topK);
    topResults.forEach((r, i) => (r.rank = i + 1));

    return topResults;
  }

  /** Get a document by ID. */
  async get(id: string): Promise<VectorDocument | undefined> {
    await this.ensureLoaded();
    return this.documents.get(id);
  }

  /** Get all documents. */
  async all(): Promise<VectorDocument[]> {
    await this.ensureLoaded();
    return Array.from(this.documents.values());
  }

  /** Number of indexed documents. */
  async count(): Promise<number> {
    await this.ensureLoaded();
    return this.documents.size;
  }

  /** Get documents by matter ID. */
  async getByMatter(matterId: string): Promise<VectorDocument[]> {
    await this.ensureLoaded();
    return Array.from(this.documents.values()).filter(
      (d) => d.metadata.matterId === matterId
    );
  }

  /** Clear the entire store. */
  async clear(): Promise<void> {
    this.documents.clear();
    await this.save();
  }

  /** Store stats. */
  async stats(): Promise<{
    totalDocuments: number;
    byType: Record<string, number>;
    byMatter: Record<string, number>;
  }> {
    await this.ensureLoaded();
    const byType: Record<string, number> = {};
    const byMatter: Record<string, number> = {};

    for (const doc of this.documents.values()) {
      byType[doc.metadata.type] = (byType[doc.metadata.type] || 0) + 1;
      if (doc.metadata.matterId) {
        byMatter[doc.metadata.matterId] = (byMatter[doc.metadata.matterId] || 0) + 1;
      }
    }

    return { totalDocuments: this.documents.size, byType, byMatter };
  }
}

/** Singleton vector store instance. */
export const vectorStore = new VectorStore();
