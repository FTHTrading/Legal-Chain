"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ACTIVE_CASES, SEED_MATTER_CREAMER } from "@/lib/data/seed";
import { useStore } from "@/lib/hooks";
import { useState } from "react";

export default function LawPage() {
  const stats = useStore();
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? ACTIVE_CASES.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase()) ||
        c.namespace.toLowerCase().includes(search.toLowerCase())
      )
    : ACTIVE_CASES;

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[104px] pb-16 px-8">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
              <span className="text-xs font-mono tracking-wider text-[var(--text-muted)]">{stats.activeCases} Active Cases &middot; {stats.agentCount} Agents Deployed</span>
            </div>
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">Case Management</p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              ACTIVE<br /><span className="text-[var(--gold)]">OPERATIONS.</span>
            </h1>
            <p className="text-lg text-[var(--text-muted)] max-w-2xl mb-6">
              Every case under UNYKORN // LAW management. Real-time status, agent allocation, and blockchain-verified evidence chains.
            </p>
            <input
              type="text"
              placeholder="Search cases..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md bg-[var(--navy-card)] border border-[rgba(201,168,76,0.2)] rounded px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--gold)] focus:outline-none transition-colors"
            />
          </div>

          {/* Case Cards */}
          <div className="grid gap-8 mb-16">
            {filtered.map((c) => {
              const href = c.id === "creamer-drive-169"
                ? `/law/matters/${SEED_MATTER_CREAMER.id}`
                : `/portal/${c.namespace?.split(".")[0] || "marquis"}`;

              return (
                <Link key={c.id} href={href} className="block no-underline bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8 card-lift group">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`text-xs font-mono tracking-wider uppercase ${
                          c.status === "investigation" ? "text-[var(--gold)]" :
                          c.status === "appeal" ? "text-red-400" :
                          "text-[var(--success)]"
                        }`}>
                          ● {c.status.replace("_", " ")}
                        </span>
                        <span className="text-xs font-mono text-[var(--text-muted)]">{c.chains}</span>
                      </div>
                      <h2 className="font-serif text-2xl font-bold text-[var(--text-primary)] mb-1 group-hover:text-[var(--gold)] transition-colors">{c.title}</h2>
                      <p className="text-[var(--gold)] text-sm mb-3">{c.subtitle}</p>
                      <p className="text-[var(--text-muted)] leading-relaxed max-w-2xl">{c.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="font-serif text-3xl font-bold text-[var(--gold)]">{c.amount}</span>
                      <span className="font-mono text-xs text-[var(--text-muted)]">{c.namespace}</span>
                      <span className="text-xs font-mono text-[var(--gold)] mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        View Matter →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Active Matters", val: String(stats.activeCases) },
              { label: "Agents Deployed", val: String(stats.agentCount) },
              { label: "Pending Approvals", val: String(stats.pendingApprovals) },
              { label: "Total Recovery Target", val: "$1.18M" },
            ].map((s) => (
              <div key={s.label} className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6 text-center">
                <div className="font-serif text-2xl font-bold text-[var(--gold)]">{s.val}</div>
                <div className="text-xs tracking-[0.1em] uppercase text-[var(--text-muted)] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
