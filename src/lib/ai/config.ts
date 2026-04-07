/**
 * AI Provider Configuration
 *
 * Central configuration for LLM providers, models, and parameters.
 * All values read from environment with sensible defaults.
 */

export type ProviderName = "openai" | "anthropic";

export interface ModelConfig {
  provider: ProviderName;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
}

// ── Default Model Configs by Use Case ──

export const MODEL_CONFIGS = {
  /** General legal analysis — balanced accuracy/cost */
  analysis: {
    provider: (process.env.DEFAULT_PROVIDER as ProviderName) || "openai",
    model: process.env.OPENAI_MODEL || "gpt-4o",
    temperature: 0.3,
    maxTokens: 4096,
  } satisfies ModelConfig,

  /** Document drafting — higher creativity */
  drafting: {
    provider: (process.env.DEFAULT_PROVIDER as ProviderName) || "openai",
    model: process.env.OPENAI_MODEL || "gpt-4o",
    temperature: 0.6,
    maxTokens: 8192,
  } satisfies ModelConfig,

  /** Research — precise, low temperature */
  research: {
    provider: (process.env.DEFAULT_PROVIDER as ProviderName) || "openai",
    model: process.env.OPENAI_MODEL || "gpt-4o",
    temperature: 0.1,
    maxTokens: 4096,
  } satisfies ModelConfig,

  /** Forensic analysis — deterministic */
  forensics: {
    provider: (process.env.DEFAULT_PROVIDER as ProviderName) || "openai",
    model: process.env.OPENAI_MODEL || "gpt-4o",
    temperature: 0.0,
    maxTokens: 4096,
  } satisfies ModelConfig,

  /** Embedding model */
  embedding: {
    provider: "openai" as ProviderName,
    model: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
    temperature: 0,
    maxTokens: 0,
  } satisfies ModelConfig,
} as const;

// ── Agent Team → Model mapping ──

export const TEAM_MODEL_MAP: Record<string, ModelConfig> = {
  case_strategy: MODEL_CONFIGS.analysis,
  document_drafting: MODEL_CONFIGS.drafting,
  legal_research: MODEL_CONFIGS.research,
  evidence_analysis: MODEL_CONFIGS.analysis,
  client_communications: MODEL_CONFIGS.drafting,
  compliance_audit: MODEL_CONFIGS.analysis,
  forensic_intelligence: MODEL_CONFIGS.forensics,
  workflow_orchestration: MODEL_CONFIGS.analysis,
  infrastructure: MODEL_CONFIGS.analysis,
};

// ── RAG Config ──

export const RAG_CONFIG = {
  chunkSize: parseInt(process.env.RAG_CHUNK_SIZE || "1000", 10),
  chunkOverlap: parseInt(process.env.RAG_CHUNK_OVERLAP || "200", 10),
  topK: parseInt(process.env.RAG_TOP_K || "5", 10),
  minSimilarity: parseFloat(process.env.RAG_MIN_SIMILARITY || "0.7"),
  embeddingDimensions: 1536, // text-embedding-3-small default
};
