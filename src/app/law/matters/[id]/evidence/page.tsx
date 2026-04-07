"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { use, useState, useMemo } from "react";
import { SEED_MATTER_CREAMER, SEED_MATTER_DELCAMPO, SEED_MATTER_TRON } from "@/lib/data/seed";

type EvidenceStatus = "verified" | "supported" | "alleged" | "disputed";
const ALL_STATUSES: EvidenceStatus[] = ["verified", "supported", "alleged", "disputed"];
const ALL_MATTERS = [SEED_MATTER_CREAMER, SEED_MATTER_DELCAMPO, SEED_MATTER_TRON];

function getMatter(id: string) {
  return ALL_MATTERS.find(m => m.id === id) || null;
}

export default function EvidencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const matter = getMatter(id);

  const [statusOverrides, setStatusOverrides] = useState<Record<string, EvidenceStatus>>({});
  const [statusFilter, setStatusFilter] = useState<EvidenceStatus | "all">("all");
  const [actionLog, setActionLog] = useState<Array<{ id: string; from: string; to: string; time: string }>>([]);

  if (!matter) {
    return (
      <>
        <Navbar />
        <main className="flex-1 pt-[104px] pb-16 px-8 text-center">
          <h1 className="font-serif text-4xl font-bold text-[var(--gold)]">Matter Not Found</h1>
        </main>
        <Footer />
      </>
    );
  }

  const tabs = [
    { label: "Overview", href: `/law/matters/${id}` },
    { label: "Claims", href: `/law/matters/${id}/claims` },
    { label: "Ledger", href: `/law/matters/${id}/ledger` },
    { label: "Evidence", href: `/law/matters/${id}/evidence`, active: true },
  ];

  const evidenceWithStatus = matter.evidence.map(e => ({
    ...e,
    status: statusOverrides[e.id] || e.status,
  }));

  const filteredEvidence = statusFilter === "all"
    ? evidenceWithStatus
    : evidenceWithStatus.filter(e => e.status === statusFilter);

  const statusCounts = evidenceWithStatus.reduce((acc, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  function changeStatus(itemId: string, currentStatus: string, newStatus: EvidenceStatus) {
    setStatusOverrides(prev => ({ ...prev, [itemId]: newStatus }));
    setActionLog(prev => [{ id: itemId, from: currentStatus, to: newStatus, time: new Date().toISOString() }, ...prev]);
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[104px] pb-16 px-8">
        <div className="max-w-[1200px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] mb-6">
            <Link href="/law" className="text-[var(--gold)] no-underline hover:underline">Cases</Link>
            <span>/</span>
            <Link href={`/law/matters/${id}`} className="text-[var(--gold)] no-underline hover:underline">{matter.matterId}</Link>
            <span>/</span>
            <span>Evidence</span>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
            Evidence Matrix
          </h1>
          <p className="text-[var(--text-muted)] mb-8">{matter.evidence.length} items collected — {matter.title}</p>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 border-b border-[rgba(201,168,76,0.1)]">
            {tabs.map((t) => (
              <Link key={t.label} href={t.href}
                className={`px-4 py-3 text-sm font-serif tracking-wider uppercase no-underline transition-colors ${
                  t.active
                    ? "text-[var(--gold)] border-b-2 border-[var(--gold)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}>
                {t.label}
              </Link>
            ))}
          </div>

          {/* Status Summary — clickable filters */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
            <button onClick={() => setStatusFilter("all")} className={`bg-[var(--navy-card)] border rounded-lg p-6 text-center cursor-pointer transition-colors ${
              statusFilter === "all" ? "border-[var(--gold)]" : "border-[rgba(201,168,76,0.1)] hover:border-[rgba(201,168,76,0.3)]"
            }`}>
              <div className="font-serif text-2xl font-bold text-[var(--text-primary)]">{evidenceWithStatus.length}</div>
              <div className="text-xs tracking-[0.1em] uppercase text-[var(--text-muted)] mt-1">All</div>
            </button>
            {[
              { label: "Verified", key: "verified" as EvidenceStatus, color: "text-[var(--success)]" },
              { label: "Supported", key: "supported" as EvidenceStatus, color: "text-[var(--gold)]" },
              { label: "Alleged", key: "alleged" as EvidenceStatus, color: "text-[var(--text-muted)]" },
              { label: "Disputed", key: "disputed" as EvidenceStatus, color: "text-red-400" },
            ].map((s) => (
              <button key={s.label} onClick={() => setStatusFilter(s.key)} className={`bg-[var(--navy-card)] border rounded-lg p-6 text-center cursor-pointer transition-colors ${
                statusFilter === s.key ? "border-[var(--gold)]" : "border-[rgba(201,168,76,0.1)] hover:border-[rgba(201,168,76,0.3)]"
              }`}>
                <div className={`font-serif text-2xl font-bold ${s.color}`}>{statusCounts[s.key] || 0}</div>
                <div className="text-xs tracking-[0.1em] uppercase text-[var(--text-muted)] mt-1">{s.label}</div>
              </button>
            ))}
          </div>

          {/* Evidence Items */}
          <div className="space-y-4">
            {filteredEvidence.map((item, i) => (
              <div key={item.id} className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <span className="font-mono text-xs text-[var(--text-muted)] mt-1 w-8 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          item.status === "verified" ? "bg-[var(--success)]" :
                          item.status === "supported" ? "bg-[var(--gold)]" :
                          item.status === "disputed" ? "bg-red-400" :
                          "bg-[var(--text-muted)]"
                        }`} />
                        <h3 className="font-serif text-base font-bold">{item.title}</h3>
                      </div>
                      <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-3">{item.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-[rgba(201,168,76,0.1)] text-[var(--gold)] px-2 py-0.5 rounded font-mono">{item.category.replace(/_/g, " ")}</span>
                        {item.sourceParty && (
                          <span className="text-xs bg-[rgba(255,255,255,0.05)] text-[var(--text-muted)] px-2 py-0.5 rounded font-mono">{item.sourceParty}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-2">
                    <span className={`text-xs font-mono tracking-wider uppercase ${
                      item.status === "verified" ? "text-[var(--success)]" :
                      item.status === "supported" ? "text-[var(--gold)]" :
                      item.status === "disputed" ? "text-red-400" :
                      "text-[var(--text-muted)]"
                    }`}>
                      {item.status}
                    </span>
                    {item.dateObtained && (
                      <div className="text-xs text-[var(--text-muted)]">{item.dateObtained}</div>
                    )}
                    {/* Status Actions */}
                    <div className="flex gap-1 mt-1">
                      {ALL_STATUSES.filter(s => s !== item.status).map(s => (
                        <button key={s} onClick={() => changeStatus(item.id, item.status, s)}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border cursor-pointer transition-colors ${
                            s === "verified" ? "border-green-700 text-green-400 hover:bg-green-900/30" :
                            s === "supported" ? "border-yellow-700 text-yellow-400 hover:bg-yellow-900/30" :
                            s === "disputed" ? "border-red-700 text-red-400 hover:bg-red-900/30" :
                            "border-gray-600 text-gray-400 hover:bg-gray-800/30"
                          }`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Supports Claims */}
                {item.linkedClaims && item.linkedClaims.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[rgba(201,168,76,0.05)]">
                    <div className="text-xs font-mono text-[var(--text-muted)]">
                      Supports: {item.linkedClaims.join(", ")}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Log */}
          {actionLog.length > 0 && (
            <div className="mt-8 bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6">
              <h3 className="text-xs font-mono text-[var(--gold)] tracking-wider mb-4">STATUS CHANGE LOG ({actionLog.length})</h3>
              <div className="space-y-2">
                {actionLog.slice(0, 10).map((log, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs font-mono text-[var(--text-muted)]">
                    <span>{new Date(log.time).toLocaleTimeString()}</span>
                    <span className="text-[var(--text-primary)]">{log.id}</span>
                    <span>{log.from}</span>
                    <span className="text-[var(--gold)]">→</span>
                    <span className={log.to === "verified" ? "text-green-400" : log.to === "disputed" ? "text-red-400" : "text-[var(--text-primary)]"}>{log.to}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
