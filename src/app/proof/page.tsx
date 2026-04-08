"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

// ── Types ──

interface SubsystemHealth {
  status: string;
  [key: string]: unknown;
}

interface AgentInfo {
  id: string;
  name: string;
  team: string;
  status: string;
  completedTasks: number;
  failedTasks: number;
}

interface HealthData {
  status: string;
  timestamp: string;
  latencyMs: number;
  subsystems: Record<string, SubsystemHealth>;
  agents: AgentInfo[];
  version: string;
  deployment: { platform: string; region: string; environment: string };
}

interface DemoResult {
  agent: { name: string; id: string };
  analysis: string;
  confidence: number;
  toolsUsed: number;
  model: string;
  processingTimeMs: number;
  tokensUsed: number;
  escalated: boolean;
  escalationReason?: string;
  disclaimer: string;
  timestamp: string;
}

// ── Team Colors ──

const TEAM_COLORS: Record<string, string> = {
  case_strategy: "text-blue-400",
  legal_research: "text-purple-400",
  evidence_analysis: "text-cyan-400",
  document_drafting: "text-amber-400",
  forensic_intelligence: "text-red-400",
  compliance_audit: "text-emerald-400",
  client_communications: "text-pink-400",
  workflow_orchestration: "text-orange-400",
  infrastructure: "text-gray-400",
};

const TEAM_LABELS: Record<string, string> = {
  case_strategy: "Case Strategy",
  legal_research: "Legal Research",
  evidence_analysis: "Evidence Analysis",
  document_drafting: "Document Drafting",
  forensic_intelligence: "Forensic Intelligence",
  compliance_audit: "Compliance & Audit",
  client_communications: "Client Communications",
  workflow_orchestration: "Workflow Orchestration",
  infrastructure: "Infrastructure",
};

// ── Status Indicator ──

function StatusDot({ status }: { status: string }) {
  const isUp = status === "online" || status === "connected" || status === "active" || status === "operational";
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${isUp ? "bg-emerald-400 animate-pulse" : status === "no_key" ? "bg-amber-400" : "bg-red-400"}`} />
  );
}

// ── Confidence Bar ──

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 85 ? "bg-emerald-400" : pct >= 60 ? "bg-[var(--gold)]" : "bg-red-400";
  const label = pct >= 85 ? "High" : pct >= 60 ? "Moderate" : "Low";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-[rgba(255,255,255,0.1)] overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-sm font-mono font-bold ${pct >= 85 ? "text-emerald-400" : pct >= 60 ? "text-[var(--gold)]" : "text-red-400"}`}>
        {pct}% — {label}
      </span>
    </div>
  );
}

// ── Page ──

export default function ProofPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [demoResult, setDemoResult] = useState<DemoResult | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);
  const [showAllAgents, setShowAllAgents] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Auto-fetch health on mount
  useEffect(() => {
    fetch("/api/proof/health")
      .then((r) => {
        if (!r.ok) throw new Error(`Health check returned ${r.status}`);
        return r.json();
      })
      .then(setHealth)
      .catch((e) => setHealthError(e.message))
      .finally(() => setHealthLoading(false));
  }, []);

  // Timer during demo processing
  useEffect(() => {
    if (!demoLoading) return;
    setElapsed(0);
    const interval = setInterval(() => setElapsed((e) => e + 100), 100);
    return () => clearInterval(interval);
  }, [demoLoading]);

  const runDemo = useCallback(async () => {
    if (!question.trim() || demoLoading) return;
    setDemoLoading(true);
    setDemoError(null);
    setDemoResult(null);
    try {
      const res = await fetch("/api/proof/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail || "Demo failed");
      setDemoResult(data);
    } catch (e) {
      setDemoError(e instanceof Error ? e.message : "Demo failed");
    } finally {
      setDemoLoading(false);
    }
  }, [question, demoLoading]);

  // Group agents by team
  const agentsByTeam = health?.agents.reduce<Record<string, AgentInfo[]>>((acc, a) => {
    (acc[a.team] ||= []).push(a);
    return acc;
  }, {}) || {};

  const displayedTeams = showAllAgents
    ? Object.keys(agentsByTeam)
    : Object.keys(agentsByTeam).slice(0, 4);

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[104px] pb-16 px-8">
        <div className="max-w-[1200px] mx-auto">

          {/* ═══ HEADER ═══ */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <StatusDot status={health?.status || "loading"} />
              <span className="text-xs font-mono tracking-wider text-[var(--text-muted)]">
                Live System Verification &middot; {health ? new Date(health.timestamp).toLocaleString() : "Loading..."}
              </span>
            </div>
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">Proof of System</p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              VERIFY.<br /><span className="text-[var(--gold)]">EVERYTHING.</span>
            </h1>
            <p className="text-lg text-[var(--text-muted)] max-w-2xl">
              Every claim we make is verifiable. This page runs live health checks against our infrastructure
              and lets you interact with our AI agents directly. No simulations. No mockups. Real systems.
            </p>
          </div>

          {/* ═══ SYSTEM HEALTH ═══ */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <span className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)]">Subsystem Status</span>
              {health && (
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  &middot; Checked in {health.latencyMs}ms
                </span>
              )}
            </div>

            {healthLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6 animate-pulse">
                    <div className="h-4 bg-[rgba(201,168,76,0.1)] rounded w-1/3 mb-3" />
                    <div className="h-6 bg-[rgba(201,168,76,0.1)] rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : healthError ? (
              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-6 text-red-400">
                Health check failed: {healthError}
              </div>
            ) : health ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(health.subsystems).map(([key, sys]) => (
                  <div key={key} className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <StatusDot status={sys.status} />
                      <span className="text-xs font-mono tracking-wider uppercase text-[var(--text-muted)]">{key}</span>
                    </div>
                    <div className="font-serif text-lg font-bold text-[var(--text-primary)] mb-1">
                      {sys.status === "online" || sys.status === "connected" ? "Operational" : sys.status === "no_key" ? "Key Required" : String(sys.status)}
                    </div>
                    <div className="space-y-0.5 text-xs">
                      {typeof sys.count === "number" && <p className="text-[var(--gold)]">{sys.count} registered</p>}
                      {typeof sys.active === "number" && <p className="text-emerald-400">{sys.active} active</p>}
                      {typeof sys.totalRecords === "number" && <p className="text-[var(--gold)]">{sys.totalRecords} records</p>}
                      {typeof sys.truthRecords === "number" && <p className="text-[var(--gold)]">{sys.truthRecords} truth records</p>}
                      {typeof sys.evidenceItems === "number" && <p className="text-cyan-400">{sys.evidenceItems} evidence items</p>}
                      {typeof sys.workflowCount === "number" && <p className="text-[var(--gold)]">{sys.workflowCount} workflows</p>}
                      {typeof sys.latencyMs === "number" && <p className="text-[var(--text-muted)]">{sys.latencyMs}ms</p>}
                      {typeof sys.provider === "string" && sys.provider !== "none" && <p className="text-[var(--gold)]">Provider: {sys.provider}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          {/* ═══ AGENT REGISTRY ═══ */}
          {health?.agents && health.agents.length > 0 && (
            <section className="mb-16">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-serif text-2xl font-bold">
                  Agent Registry — <span className="text-[var(--gold)]">{health.agents.length}</span> Agents
                </h2>
                <span className="text-xs font-mono text-emerald-400">
                  {health.agents.filter((a) => a.status === "active").length} / {health.agents.length} active
                </span>
              </div>
              <p className="text-[var(--text-muted)] mb-8">
                Every agent below is a real, defined AI entity with specific tools, governance constraints,
                escalation triggers, and forbidden actions. Click &ldquo;Show All&rdquo; to see the full roster.
              </p>

              <div className="space-y-6">
                {displayedTeams.map((team) => (
                  <div key={team}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs font-mono tracking-wider uppercase ${TEAM_COLORS[team] || "text-[var(--text-muted)]"}`}>
                        {TEAM_LABELS[team] || team.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">({agentsByTeam[team]?.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {agentsByTeam[team]?.map((a) => (
                        <div key={a.id} className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.08)] rounded-lg p-4 hover:border-[rgba(201,168,76,0.25)] transition-colors">
                          <div className="flex items-center gap-2 mb-1">
                            <StatusDot status={a.status} />
                            <span className="font-serif font-bold text-sm text-[var(--text-primary)]">{a.name}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                            <span>{a.completedTasks} completed</span>
                            {a.failedTasks > 0 && <span className="text-red-400">{a.failedTasks} failed</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {Object.keys(agentsByTeam).length > 4 && (
                <button
                  onClick={() => setShowAllAgents(!showAllAgents)}
                  className="mt-6 text-sm font-mono text-[var(--gold)] hover:underline bg-transparent border-none cursor-pointer"
                >
                  {showAllAgents ? "Show Less" : `Show All ${Object.keys(agentsByTeam).length} Teams →`}
                </button>
              )}
            </section>
          )}

          {/* ═══ LIVE AI DEMO ═══ */}
          <section className="mb-16">
            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.2)] rounded-lg overflow-hidden">
              {/* Demo Header */}
              <div className="bg-[rgba(201,168,76,0.04)] border-b border-[rgba(201,168,76,0.1)] px-8 py-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full bg-[var(--gold)] animate-pulse" />
                  <span className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)]">Interactive</span>
                </div>
                <h2 className="font-serif text-2xl font-bold mb-1">Try It Live — Ask Our AI</h2>
                <p className="text-[var(--text-muted)]">
                  Describe a legal situation below. Our AI agent will analyze it in real-time.
                  This is not a simulation — it is the actual production system processing your query.
                </p>
              </div>

              {/* Demo Body */}
              <div className="p-8">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) runDemo(); }}
                  placeholder="Example: I was arrested based on false identification. The witness recanted their statement, but the DA is still pursuing charges. What are my legal options?"
                  maxLength={500}
                  rows={4}
                  disabled={demoLoading}
                  className="w-full bg-[var(--midnight)] border border-[rgba(201,168,76,0.2)] rounded-lg px-5 py-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--gold)] focus:outline-none resize-none disabled:opacity-50 transition-colors"
                />

                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={runDemo}
                    disabled={demoLoading || !question.trim() || question.trim().length < 10}
                    className="bg-[var(--gold)] text-[var(--midnight)] px-8 py-3 font-serif text-sm font-bold tracking-[0.15em] uppercase rounded-sm hover:bg-[var(--gold-light)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {demoLoading ? `Agent Processing — ${(elapsed / 1000).toFixed(1)}s` : "Analyze with AI Agent"}
                  </button>
                  <span className="text-xs text-[var(--text-muted)] font-mono">
                    {question.length}/500 &middot; Ctrl+Enter to submit
                  </span>
                </div>

                {/* Loading State */}
                {demoLoading && (
                  <div className="mt-6 p-6 border border-[rgba(201,168,76,0.15)] rounded-lg bg-[rgba(201,168,76,0.02)]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-4 h-4 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm font-mono text-[var(--gold)]">Agent analyzing your query...</span>
                    </div>
                    <div className="space-y-2 text-xs text-[var(--text-muted)]">
                      <p>Routing to Case Strategy team...</p>
                      {elapsed > 1000 && <p>Agent selecting tools and reviewing knowledge base...</p>}
                      {elapsed > 3000 && <p>Generating analysis with governance constraints...</p>}
                      {elapsed > 6000 && <p>Computing confidence score and checking escalation triggers...</p>}
                      {elapsed > 10000 && <p>Complex analysis in progress — AI is being thorough...</p>}
                    </div>
                  </div>
                )}

                {/* Error */}
                {demoError && (
                  <div className="mt-6 p-5 border border-red-500/30 rounded-lg bg-red-500/5">
                    <p className="text-red-400 text-sm font-bold mb-1">Analysis Failed</p>
                    <p className="text-red-400/80 text-sm">{demoError}</p>
                  </div>
                )}

                {/* Result */}
                {demoResult && (
                  <div className="mt-8 border-t border-[rgba(201,168,76,0.15)] pt-8 space-y-6">
                    {/* Metadata Bar */}
                    <div className="flex flex-wrap gap-3">
                      {[
                        { label: "Agent", value: demoResult.agent.name, color: "text-[var(--gold)]" },
                        { label: "Model", value: demoResult.model, color: "text-purple-400" },
                        { label: "Time", value: `${(demoResult.processingTimeMs / 1000).toFixed(1)}s`, color: "text-[var(--text-primary)]" },
                        { label: "Tokens", value: String(demoResult.tokensUsed), color: "text-cyan-400" },
                        { label: "Tools Used", value: String(demoResult.toolsUsed), color: "text-amber-400" },
                      ].map((m) => (
                        <div key={m.label} className="bg-[var(--midnight)] rounded-lg px-4 py-2.5 border border-[rgba(255,255,255,0.05)]">
                          <span className="text-[10px] font-mono tracking-wider uppercase text-[var(--text-muted)] block mb-0.5">{m.label}</span>
                          <span className={`text-sm font-bold ${m.color}`}>{m.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Confidence */}
                    <div>
                      <span className="text-xs font-mono tracking-wider uppercase text-[var(--text-muted)] mb-2 block">Confidence Score</span>
                      <ConfidenceBar value={demoResult.confidence} />
                    </div>

                    {/* Escalation Notice */}
                    {demoResult.escalated && (
                      <div className="p-4 border border-amber-500/30 rounded-lg bg-amber-500/5">
                        <p className="text-amber-400 text-sm font-bold">Escalation Triggered</p>
                        <p className="text-amber-400/80 text-xs mt-1">
                          {demoResult.escalationReason || "This analysis has been flagged for supervising attorney review."}
                        </p>
                      </div>
                    )}

                    {/* Analysis Content */}
                    <div className="bg-[var(--midnight)] rounded-lg p-6 border border-[rgba(201,168,76,0.1)]">
                      <span className="text-xs font-mono tracking-wider uppercase text-[var(--gold)] mb-3 block">AI Analysis</span>
                      <div className="text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap text-[0.95rem]">
                        {demoResult.analysis}
                      </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="flex items-start gap-2 p-4 bg-[rgba(201,168,76,0.03)] rounded border border-[rgba(201,168,76,0.08)]">
                      <span className="text-[var(--gold)] text-sm mt-0.5">&#9888;</span>
                      <p className="text-xs text-[var(--text-muted)] italic leading-relaxed">
                        {demoResult.disclaimer}
                      </p>
                    </div>

                    {/* Try Another */}
                    <button
                      onClick={() => { setDemoResult(null); setQuestion(""); }}
                      className="text-sm font-mono text-[var(--gold)] hover:underline bg-transparent border-none cursor-pointer"
                    >
                      ← Ask another question
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ═══ WHAT THIS PROVES ═══ */}
          <section className="mb-16">
            <h2 className="font-serif text-2xl font-bold mb-8">What This Page Proves</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Real AI Agents",
                  text: "Every agent in the registry above is a defined TypeScript entity with specific tools, governance constraints, forbidden actions, and escalation triggers. The demo routes your query to a real agent running real LLM inference.",
                },
                {
                  title: "Real Infrastructure",
                  text: "The health check above hits the actual Privacy Vault (AES-256-GCM), Truth Kernel (11 modules), Agent Runtime, and Orchestrator. These are not mocked services — they are the production systems.",
                },
                {
                  title: "Real Governance",
                  text: "Every AI output includes a confidence score. Below 60%, analysis is auto-flagged for human review. Below 40%, it's escalated to a supervising attorney. No AI output leaves the system without human approval.",
                },
              ].map((item) => (
                <div key={item.title} className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6">
                  <h3 className="font-serif text-lg font-bold text-[var(--gold)] mb-2">{item.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ═══ WHY WE'RE DIFFERENT ═══ */}
          <section className="mb-16">
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">Competitive Edge</p>
            <h2 className="font-serif text-2xl font-bold mb-8">Why We&apos;re Not ChatGPT</h2>
            <p className="text-[var(--text-muted)] mb-8 max-w-3xl">
              Generic AI chatbots output markdown in a chat window. Our governed agent system produces court-ready PDFs with confidence scoring, escalation triggers, forbidden actions, audit trails, and human approval gates.
            </p>

            {/* Comparison Table */}
            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.15)] rounded-lg overflow-hidden mb-8">
              <div className="grid grid-cols-3 text-xs font-mono tracking-wider uppercase">
                <div className="px-6 py-3 bg-[rgba(201,168,76,0.04)] border-b border-r border-[rgba(201,168,76,0.1)] text-[var(--text-muted)]">Capability</div>
                <div className="px-6 py-3 bg-[rgba(201,168,76,0.04)] border-b border-r border-[rgba(201,168,76,0.1)] text-red-400">ChatGPT / Generic AI</div>
                <div className="px-6 py-3 bg-[rgba(201,168,76,0.04)] border-b border-[rgba(201,168,76,0.1)] text-[var(--gold)]">UNYKORN Agents</div>
              </div>
              {[
                ["Output Format", "Markdown text in chat", "Court-standard PDF with caption, signature block, cert of service"],
                ["Governance", "None — anything goes", "Forbidden actions, escalation triggers, approval gates"],
                ["Confidence Scoring", "No scoring at all", "Every output scored 0-100% with uncertainty markers"],
                ["Escalation", "No escalation", "Auto-escalate below 40%, flag for review below 60%"],
                ["Forbidden Actions", "Can attempt anything asked", "Cannot file, sign, send to parties, or approve own work"],
                ["Audit Trail", "No logging", "Hash-chained log with agent ID, timestamp, action, and result"],
                ["Privacy", "Data sent to cloud provider", "AES-256-GCM vault — PII never reaches AI models"],
                ["Document Quality", "Generic prose", "Jurisdiction-specific, type-aware legal drafting with citations"],
                ["Human Oversight", "Optional, up to user", "Mandatory — no output leaves without attorney review"],
              ].map(([cap, gpt, us], i) => (
                <div key={i} className="grid grid-cols-3 text-sm border-b border-[rgba(255,255,255,0.04)] last:border-b-0">
                  <div className="px-6 py-3 border-r border-[rgba(255,255,255,0.04)] font-bold text-[var(--text-primary)]">{cap}</div>
                  <div className="px-6 py-3 border-r border-[rgba(255,255,255,0.04)] text-red-400/70">{gpt}</div>
                  <div className="px-6 py-3 text-emerald-400/90">{us}</div>
                </div>
              ))}
            </div>

            {/* Document Generation CTA */}
            <div className="bg-[rgba(201,168,76,0.04)] border border-[rgba(201,168,76,0.15)] rounded-lg p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="font-serif text-lg font-bold mb-1">See It In Action</h3>
                <p className="text-sm text-[var(--text-muted)]">
                  Generate a real legal document — motion, brief, or demand letter — with our AI agent pipeline.
                  Court-standard PDF, confidence-scored, ready for attorney review.
                </p>
              </div>
              <Link
                href="/documents"
                className="bg-[var(--gold)] text-[var(--midnight)] px-8 py-3 font-serif text-sm font-bold tracking-[0.15em] uppercase rounded-sm hover:bg-[var(--gold-light)] transition-colors no-underline whitespace-nowrap"
              >
                Generate Document
              </Link>
            </div>
          </section>

          {/* ═══ SYSTEM INFO ═══ */}
          {health && (
            <section className="mb-16">
              <h2 className="font-serif text-2xl font-bold mb-6">System Information</h2>
              <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6 font-mono text-sm space-y-2">
                <p><span className="text-[var(--text-muted)]">Version:</span> <span className="text-[var(--gold)]">{health.version}</span></p>
                <p><span className="text-[var(--text-muted)]">Platform:</span> <span className="text-[var(--text-primary)]">{health.deployment.platform}</span></p>
                <p><span className="text-[var(--text-muted)]">Region:</span> <span className="text-[var(--text-primary)]">{health.deployment.region}</span></p>
                <p><span className="text-[var(--text-muted)]">Environment:</span> <span className="text-emerald-400">{health.deployment.environment}</span></p>
                <p><span className="text-[var(--text-muted)]">Agent Count:</span> <span className="text-[var(--gold)]">{health.agents.length}</span></p>
                <p><span className="text-[var(--text-muted)]">System Check:</span> <span className="text-[var(--text-primary)]">{new Date(health.timestamp).toISOString()}</span></p>
              </div>
            </section>
          )}

          {/* ═══ CTA ═══ */}
          <section className="text-center py-16 border-t border-[rgba(201,168,76,0.1)]">
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-3">Ready?</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              The system is live.<br /><span className="text-[var(--gold)]">Submit your case.</span>
            </h2>
            <p className="text-[var(--text-muted)] mb-8 max-w-xl mx-auto">
              Your data is encrypted with AES-256-GCM. Every action is logged in a hash-chained audit trail.
              Our AI agents are ready to begin your preliminary investigation.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/intake"
                className="bg-[var(--gold)] text-[var(--midnight)] px-8 py-3 font-serif text-sm font-bold tracking-[0.15em] uppercase rounded-sm hover:bg-[var(--gold-light)] transition-colors no-underline"
              >
                Get Free Case Review
              </Link>
              <Link
                href="/law"
                className="border border-[var(--gold)] text-[var(--gold)] px-8 py-3 font-serif text-sm font-bold tracking-[0.15em] uppercase rounded-sm hover:bg-[rgba(201,168,76,0.1)] transition-colors no-underline"
              >
                View Active Cases
              </Link>
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}
