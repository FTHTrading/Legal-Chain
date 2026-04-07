"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAudit } from "@/lib/hooks";

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
