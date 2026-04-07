/**
 * LLM Provider Abstraction Layer
 *
 * Unified interface for OpenAI and Anthropic with automatic fallback.
 * All LLM calls go through this layer for consistent logging and governance.
 */

import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import type { ProviderName, ModelConfig } from "./config";

// ── Types ──

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CompletionRequest {
  messages: ChatMessage[];
  config: ModelConfig;
  tools?: ToolDefinition[];
}

export interface CompletionResponse {
  content: string;
  model: string;
  provider: ProviderName;
  tokensUsed: number;
  finishReason: string;
  toolCalls?: ToolCall[];
  durationMs: number;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

// ── Provider Clients (lazy singletons) ──

let _openai: OpenAI | null = null;
let _anthropic: Anthropic | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY not configured");
    _openai = new OpenAI({ apiKey });
  }
  return _openai;
}

function getAnthropic(): Anthropic {
  if (!_anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");
    _anthropic = new Anthropic({ apiKey });
  }
  return _anthropic;
}

// ── Completion Dispatchers ──

async function openaiComplete(req: CompletionRequest): Promise<CompletionResponse> {
  const start = Date.now();
  const client = getOpenAI();

  const messages = req.messages.map((m) => ({
    role: m.role as "system" | "user" | "assistant",
    content: m.content,
  }));

  const params: OpenAI.ChatCompletionCreateParamsNonStreaming = {
    model: req.config.model,
    messages,
    temperature: req.config.temperature,
    max_tokens: req.config.maxTokens,
  };

  if (req.tools?.length) {
    params.tools = req.tools.map((t) => ({
      type: "function" as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }));
  }

  const response = await client.chat.completions.create(params);
  const choice = response.choices[0];

  const toolCalls = choice.message.tool_calls
    ?.filter((tc): tc is typeof tc & { type: "function"; function: { name: string; arguments: string } } =>
      tc.type === "function" && "function" in tc
    )
    .map((tc) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: JSON.parse(tc.function.arguments),
    }));

  return {
    content: choice.message.content || "",
    model: response.model,
    provider: "openai",
    tokensUsed: response.usage?.total_tokens || 0,
    finishReason: choice.finish_reason || "unknown",
    toolCalls,
    durationMs: Date.now() - start,
  };
}

async function anthropicComplete(req: CompletionRequest): Promise<CompletionResponse> {
  const start = Date.now();
  const client = getAnthropic();

  const systemMsg = req.messages.find((m) => m.role === "system");
  const userMsgs = req.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  const params: Anthropic.MessageCreateParamsNonStreaming = {
    model: req.config.model.includes("claude")
      ? req.config.model
      : "claude-sonnet-4-20250514",
    max_tokens: req.config.maxTokens,
    messages: userMsgs,
  };

  if (systemMsg) {
    params.system = systemMsg.content;
  }

  if (req.config.temperature > 0) {
    params.temperature = req.config.temperature;
  }

  if (req.tools?.length) {
    params.tools = req.tools.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.parameters as Anthropic.Tool.InputSchema,
    }));
  }

  const response = await client.messages.create(params);

  const textBlock = response.content.find((b) => b.type === "text");
  const toolUseBlocks = response.content.filter((b) => b.type === "tool_use");

  const toolCalls = toolUseBlocks.map((b) => {
    if (b.type !== "tool_use") throw new Error("unexpected block type");
    return {
      id: b.id,
      name: b.name,
      arguments: b.input as Record<string, unknown>,
    };
  });

  return {
    content: textBlock?.type === "text" ? textBlock.text : "",
    model: response.model,
    provider: "anthropic",
    tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    finishReason: response.stop_reason || "unknown",
    toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    durationMs: Date.now() - start,
  };
}

// ── Public API ──

/**
 * Send a completion request to the configured provider.
 * Falls back to the other provider on failure.
 */
export async function complete(req: CompletionRequest): Promise<CompletionResponse> {
  const primary = req.config.provider;
  const fallback: ProviderName = primary === "openai" ? "anthropic" : "openai";

  try {
    return primary === "openai"
      ? await openaiComplete(req)
      : await anthropicComplete(req);
  } catch (primaryError) {
    console.warn(
      `[AI] Primary provider ${primary} failed, falling back to ${fallback}:`,
      primaryError instanceof Error ? primaryError.message : primaryError
    );

    try {
      const fallbackConfig = { ...req.config, provider: fallback };
      return fallback === "openai"
        ? await openaiComplete({ ...req, config: fallbackConfig })
        : await anthropicComplete({ ...req, config: fallbackConfig });
    } catch (fallbackError) {
      throw new Error(
        `Both providers failed. ${primary}: ${primaryError instanceof Error ? primaryError.message : primaryError}. ` +
        `${fallback}: ${fallbackError instanceof Error ? fallbackError.message : fallbackError}`
      );
    }
  }
}

/**
 * Check if a provider is configured and available.
 */
export function isProviderAvailable(provider: ProviderName): boolean {
  if (provider === "openai") return !!process.env.OPENAI_API_KEY;
  if (provider === "anthropic") return !!process.env.ANTHROPIC_API_KEY;
  return false;
}

/**
 * Get the list of configured providers.
 */
export function availableProviders(): ProviderName[] {
  const providers: ProviderName[] = [];
  if (process.env.OPENAI_API_KEY) providers.push("openai");
  if (process.env.ANTHROPIC_API_KEY) providers.push("anthropic");
  return providers;
}
