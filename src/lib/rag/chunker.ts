/**
 * Text Chunker for RAG Ingestion
 *
 * Splits documents into overlapping chunks for embedding.
 * Preserves sentence boundaries where possible.
 */

import { RAG_CONFIG } from "../ai/config";

export interface Chunk {
  content: string;
  index: number;
  startChar: number;
  endChar: number;
}

/**
 * Split text into overlapping chunks.
 * Tries to break at sentence boundaries to preserve meaning.
 */
export function chunkText(
  text: string,
  chunkSize: number = RAG_CONFIG.chunkSize,
  overlap: number = RAG_CONFIG.chunkOverlap
): Chunk[] {
  if (!text || text.trim().length === 0) return [];
  if (text.length <= chunkSize) {
    return [{ content: text, index: 0, startChar: 0, endChar: text.length }];
  }

  const chunks: Chunk[] = [];
  let start = 0;
  let index = 0;

  while (start < text.length) {
    let end = Math.min(start + chunkSize, text.length);

    // Try to break at a sentence boundary
    if (end < text.length) {
      const segment = text.slice(start, end);
      const lastPeriod = segment.lastIndexOf(". ");
      const lastNewline = segment.lastIndexOf("\n");
      const breakPoint = Math.max(lastPeriod, lastNewline);

      if (breakPoint > chunkSize * 0.3) {
        end = start + breakPoint + 1;
      }
    }

    const content = text.slice(start, end).trim();
    if (content.length > 0) {
      chunks.push({ content, index, startChar: start, endChar: end });
      index++;
    }

    // Move start forward, accounting for overlap
    start = end - overlap;
    if (start >= text.length) break;
    // Prevent infinite loop on very small chunks
    if (start <= chunks[chunks.length - 1]?.startChar) break;
  }

  return chunks;
}

/**
 * Split structured legal text (sections, headings) more intelligently.
 * Falls back to generic chunking.
 */
export function chunkLegalDocument(text: string): Chunk[] {
  // Try to split on section headings first
  const sectionPattern = /\n(?=(?:#{1,3}\s|SECTION\s|Article\s|Rule\s|\d+\.\s+[A-Z]))/g;
  const sections = text.split(sectionPattern).filter((s) => s.trim().length > 0);

  if (sections.length > 1) {
    const chunks: Chunk[] = [];
    let charOffset = 0;

    for (const section of sections) {
      if (section.length <= RAG_CONFIG.chunkSize) {
        chunks.push({
          content: section.trim(),
          index: chunks.length,
          startChar: charOffset,
          endChar: charOffset + section.length,
        });
      } else {
        // Section is too long — sub-chunk it
        const subChunks = chunkText(section);
        for (const sub of subChunks) {
          chunks.push({
            content: sub.content,
            index: chunks.length,
            startChar: charOffset + sub.startChar,
            endChar: charOffset + sub.endChar,
          });
        }
      }
      charOffset += section.length;
    }

    return chunks;
  }

  // Fallback to generic chunking
  return chunkText(text);
}
