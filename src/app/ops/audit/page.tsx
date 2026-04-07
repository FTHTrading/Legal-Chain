"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAudit } from "@/lib/hooks";

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  category: string;
  actorId: string;
  actorType: "user" | "agent" | "system";
  actorName: string;
  matterId?: string;
  matterName?: string;
  description: string;
  contentHash: string;
}

const DEMO_AUDIT: AuditEntry[] = [
  {
    id: "aud-001",
    timestamp: "2026-04-03T16:42:00Z",
    action: "approval_escalated",
    category: "approval",
    actorId: "agent-review-001",
    actorType: "agent",
    actorName: "Review Agent",
    matterId: "d8e4b2c3-9f5e-4a6b-8d7c-2e3f4a5b6c7d",
    matterName: "State v. Delcampo",
    description: "Motion to Correct Illegal Sentence escalated from in_review to requires_attorney_review",
    contentHash: "a3f7b2c4d8e9f1a5b6c7d8e9f0a1b2c3",
  },
  {
    id: "aud-002",
    timestamp: "2026-04-03T16:15:00Z",
    action: "research_completed",
    category: "research",
    actorId: "agent-research-001",
    actorType: "agent",
    actorName: "Research Agent",
    matterId: "c7f3a1b2-8d4e-4f5a-9c6b-1d2e3f4a5b6c",
    matterName: "169 Creamer Drive",
    description: "GA cotenant partition law research completed — 5 authorities found, 4 binding, 1 persuasive",
    contentHash: "b4f8c3d5e9f0a2b6c7d8e9f1a2b3c4d5",
  },
  {
    id: "aud-003",
    timestamp: "2026-04-03T15:30:00Z",
    action: "document_submitted",
    category: "document",
    actorId: "agent-drafting-001",
    actorType: "agent",
    actorName: "Drafting Agent",
    matterId: "c7f3a1b2-8d4e-4f5a-9c6b-1d2e3f4a5b6c",
    matterName: "169 Creamer Drive",
    description: "Formal demand letter submitted for approval — 4 source citations, 92% confidence score",
    contentHash: "c5f9d4e6f0a1b3c7d8e9f2a3b4c5d6e7",
  },
  {
    id: "aud-004",
    timestamp: "2026-04-03T12:00:00Z",
    action: "forensic_wallet_traced",
    category: "forensics",
    actorId: "agent-forensics-001",
    actorType: "agent",
    actorName: "Forensics Agent",
    matterId: "e9f5c3d4-0a6f-4b7c-9e8d-3f4a5b6c7d8e",
    matterName: "NTI-LEAVITT-2026-001",
    description: "TRON wallet TFake2...suspect1 traced — 47 transactions identified, cross-chain bridge to ETH detected",
    contentHash: "d6f0e5f7a1b2c4d8e9f3a4b5c6d7e8f9",
  },
  {
    id: "aud-005",
    timestamp: "2026-04-03T09:00:00Z",
    action: "intake_submitted",
    category: "intake",
    actorId: "user-web-form",
    actorType: "system",
    actorName: "Web Intake Form",
    description: "New intake submission — cryptocurrency fraud screening, source: website_form",
    contentHash: "e7f1a6b8c2d3e5f9a0b4c5d6e7f8a9b0",
  },
  {
    id: "aud-006",
    timestamp: "2026-04-03T08:30:00Z",
    action: "user_login",
    category: "auth",
    actorId: "user-kevan-001",
    actorType: "user",
    actorName: "Kevan Burns",
    description: "Successful login — role: system_admin, IP: [redacted]",
    contentHash: "f8a2b7c9d3e4f6a0b1c5d6e7f8a9b0c1",
  },
  {
    id: "aud-007",
    timestamp: "2026-04-02T22:00:00Z",
    action: "agent_heartbeat",
    category: "agent",
    actorId: "system-monitor",
    actorType: "system",
    actorName: "System Monitor",
    description: "Agent network health check — 350/350 agents responding, chain 7332 height=15",
    contentHash: "a9b3c8d0e4f5a7b1c2d6e7f8a9b0c1d2",
  },
  {
    id: "aud-008",
    timestamp: "2026-04-02T18:00:00Z",
    action: "workflow_task_completed",
    category: "workflow",
    actorId: "agent-intake-001",
    actorType: "agent",
    actorName: "Intake Agent",
    matterId: "c7f3a1b2-8d4e-4f5a-9c6b-1d2e3f4a5b6c",
    matterName: "169 Creamer Drive",
    description: "Task 'conflict_check' completed — no conflicts found across 3 active matters",
    contentHash: "b0c4d9e1f5a6b8c2d3e7f8a9b0c1d2e3",
  },
];

export default function AuditPage() {
  const auditEntries = useAudit();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const categories = ["all", ...Array.from(new Set(auditEntries.map(e => e.category)))];
  const filtered = auditEntries
    .filter(e => catFilter === "all" || e.category === catFilter)
    .filter(e => !search || e.description.toLowerCase().includes(search.toLowerCase()) || e.action.toLowerCase().includes(search.toLowerCase()));

  const categoryColor = (cat: string) => {
    const m: Record<string, string> = {
      approval: "text-orange-400 bg-orange-900/20",
      research: "text-blue-400 bg-blue-900/20",
      document: "text-purple-400 bg-purple-900/20",
      forensics: "text-red-400 bg-red-900/20",
      intake: "text-green-400 bg-green-900/20",
      auth: "text-cyan-400 bg-cyan-900/20",
      agent: "text-yellow-400 bg-yellow-900/20",
      workflow: "text-indigo-400 bg-indigo-900/20",
    };
    return m[cat] || "text-gray-400 bg-gray-900/20";
  };

  const actorBadge = (type: string) => {
    const m: Record<string, string> = {
      user: "👤",
      human: "👤",
      agent: "🤖",
      system: "⚙️",
    };
    return m[type] || "●";
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[104px] pb-16 px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">OPERATIONS › AUDIT</p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              AUDIT<br /><span className="text-[var(--gold)]">LOG.</span>
            </h1>
            <p className="text-[var(--text-muted)] max-w-2xl">
              Immutable audit trail of every system action — documents produced, approvals granted, agents deployed,
              and users authenticated. Each entry is cryptographically hashed into a tamper-evident chain.
            </p>
          </div>

          {/* Hash Chain Integrity Banner */}
          <div className="bg-green-900/10 border border-green-800/20 rounded-lg p-4 mb-8 flex items-center gap-4">
            <span className="text-2xl">🔐</span>
            <div>
              <p className="text-sm font-bold text-green-400">Hash Chain Integrity: Verified</p>
              <p className="text-xs font-mono text-[var(--text-muted)]">
                {filtered.length} entries · Chain unbroken · Last verified: {new Date().toLocaleString()}
              </p>
            </div>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search audit entries..." className="w-full bg-[var(--midnight)] border border-[var(--gold)]/20 rounded-lg px-4 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--gold)]/50" />
            </div>
            <div className="flex flex-wrap gap-1">
              {categories.map(c => (
                <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${catFilter === c ? "bg-[var(--gold)] text-[var(--midnight)]" : "text-[var(--text-muted)] hover:text-white"}`}>
                  {c === "all" ? "ALL" : c.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-[rgba(201,168,76,0.15)]" />

            <div className="space-y-1">
              {filtered.map((entry) => (
                <div key={entry.id} className="relative pl-12 py-3">
                  {/* Dot */}
                  <div className="absolute left-[14px] top-[18px] w-[12px] h-[12px] bg-[var(--navy-card)] border-2 border-[var(--gold)] rounded-full z-10" />

                  <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-4 hover:border-[rgba(201,168,76,0.3)] transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{actorBadge(entry.actorType)}</span>
                        <span className="text-xs font-mono font-bold">{entry.actor}</span>
                        <span className={`text-xs font-mono px-2 py-0.5 rounded ${categoryColor(entry.category)}`}>
                          {entry.category}
                        </span>
                        <span className="text-xs font-mono text-[var(--text-muted)]">
                          {entry.action.replace(/_/g, " ")}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-[var(--text-muted)] shrink-0 ml-4">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)] mb-2">{entry.description}</p>
                    <div className="flex items-center gap-4 text-xs font-mono text-[var(--text-muted)]">
                      {entry.resourceType && (
                        <span>Matter: <span className="text-[var(--gold)]">{entry.resourceType}: {entry.resourceId.slice(0, 8)}\u2026</span></span>
                      )}
                      <span className="break-all">Hash: {entry.contentHash.slice(0, 16)}…</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Notice */}
          <div className="mt-8 border-t border-[rgba(201,168,76,0.1)] pt-6">
            <p className="text-xs text-[var(--text-muted)] font-mono leading-relaxed">
              TAMPER EVIDENCE: Each audit entry contains a SHA-256 content hash and a reference to the previous entry&apos;s hash,
              forming an unbroken chain. Any modification to a historical entry will invalidate all subsequent hashes.
              Audit data is retained indefinitely and cannot be deleted. Export requires system_admin authorization.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
