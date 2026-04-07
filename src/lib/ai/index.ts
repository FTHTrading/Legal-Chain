/**
 * AI Module — Barrel Export
 */

export { complete, isProviderAvailable, availableProviders } from "./provider";
export type {
  ChatMessage,
  CompletionRequest,
  CompletionResponse,
  ToolDefinition,
  ToolCall,
} from "./provider";

export { embed, embedQuery, cosineSimilarity } from "./embeddings";
export { MODEL_CONFIGS, TEAM_MODEL_MAP, RAG_CONFIG } from "./config";
export type { ProviderName, ModelConfig } from "./config";
