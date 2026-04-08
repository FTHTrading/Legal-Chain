"use client";

import { useState, useRef, useEffect } from "react";
import { AGENT_NETWORK } from "@/lib/data/seed";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  model?: string;
  provider?: string;
  tokensUsed?: number;
  durationMs?: number;
  toolResults?: { tool: string; result: unknown }[];
}

const TEAMS = [
  { value: "", label: "Auto-Route" },
  { value: "case_strategy", label: "Atlas — Strategy" },
  { value: "legal_research", label: "Lexis — Research" },
  { value: "evidence_analysis", label: "Sentinel — Evidence" },
  { value: "document_drafting", label: "Scribe — Drafting" },
  { value: "forensic_intelligence", label: "Trace — Forensics" },
  { value: "compliance_audit", label: "Guardian — Compliance" },
];

export default function AgentChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [team, setTeam] = useState("");
  const [enableTools, setEnableTools] = useState(true);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const chatMessages = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatMessages, team: team || undefined, enableTools }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.content || "(No response)",
        model: data.model,
        provider: data.provider,
        tokensUsed: data.tokensUsed,
        durationMs: data.durationMs,
        toolResults: data.toolResults,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "system", content: `Error: ${err instanceof Error ? err.message : "Unknown error"}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-[var(--navy-card)] border border-[rgba(201,168,76,0.15)] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(201,168,76,0.1)]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
          <span className="font-serif text-sm tracking-wider text-[var(--gold)]">AGENT CONSOLE</span>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="text-xs bg-[var(--midnight)] text-[var(--text-muted)] border border-[rgba(201,168,76,0.2)] rounded px-2 py-1"
          >
            {TEAMS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <label className="flex items-center gap-1 text-xs text-[var(--text-muted)] cursor-pointer">
            <input type="checkbox" checked={enableTools} onChange={(e) => setEnableTools(e.target.checked)} className="accent-[var(--gold)]" />
            Tools
          </label>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[500px]">
        {messages.length === 0 && (
          <div className="text-center text-[var(--text-muted)] text-sm py-12">
            <p className="font-serif text-lg text-[var(--gold)] mb-2">{AGENT_NETWORK.total} Agents Standing By</p>
            <p>Ask a legal question, request case research, or draft a document.</p>
            <p className="mt-1 text-xs">Select a specific team or let the system auto-route.</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-lg px-4 py-3 text-sm whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-[var(--gold)] text-[var(--midnight)]"
                : msg.role === "system"
                ? "bg-red-900/30 text-red-300 border border-red-800/50"
                : "bg-[var(--midnight)] text-[var(--text-primary)] border border-[rgba(201,168,76,0.1)]"
            }`}>
              {msg.content}
              {msg.role === "assistant" && (msg.model || msg.toolResults) && (
                <div className="mt-2 pt-2 border-t border-[rgba(201,168,76,0.1)] text-[10px] text-[var(--text-muted)] font-mono">
                  {msg.model && <span>{msg.provider}/{msg.model}</span>}
                  {msg.tokensUsed != null && <span> · {msg.tokensUsed} tokens</span>}
                  {msg.durationMs != null && <span> · {msg.durationMs}ms</span>}
                  {msg.toolResults && msg.toolResults.length > 0 && (
                    <span> · Tools: {msg.toolResults.map((t) => t.tool).join(", ")}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[var(--midnight)] border border-[rgba(201,168,76,0.1)] rounded-lg px-4 py-3 text-sm text-[var(--text-muted)]">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[rgba(201,168,76,0.1)]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask a legal question or issue a directive..."
            className="flex-1 bg-[var(--midnight)] text-[var(--text-primary)] border border-[rgba(201,168,76,0.2)] rounded px-4 py-3 text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)]"
            disabled={loading}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="bg-[var(--gold)] text-[var(--midnight)] px-6 py-3 font-serif text-sm font-bold tracking-wider uppercase rounded hover:bg-[var(--gold-light)] transition-colors disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
