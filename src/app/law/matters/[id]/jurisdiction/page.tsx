"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { use } from "react";
import { SEED_MATTER_CREAMER, SEED_MATTER_DELCAMPO, SEED_MATTER_TRON } from "@/lib/data/seed";

const ALL_MATTERS = [SEED_MATTER_CREAMER, SEED_MATTER_DELCAMPO, SEED_MATTER_TRON];

function getMatter(id: string) {
  return ALL_MATTERS.find(m => m.id === id) || null;
}

export default function JurisdictionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const matter = getMatter(id);

  if (!matter) {
    return (
      <>
        <Navbar />
        <main className="flex-1 pt-[104px] pb-16 px-8 text-center">
          <h1 className="font-serif text-4xl font-bold text-[var(--gold)]">Matter Not Found</h1>
          <Link href="/law" className="text-[var(--gold)] mt-4 inline-block">← Back to Cases</Link>
        </main>
        <Footer />
      </>
    );
  }

  const j = matter.jurisdiction;
  const readyCount = j.filingReadiness.filter(f => f.ready).length;
  const totalItems = j.filingReadiness.length;
  const readyPct = totalItems > 0 ? Math.round((readyCount / totalItems) * 100) : 0;

  const tabs = [
    { label: "Overview", href: `/law/matters/${id}` },
    { label: "Claims", href: `/law/matters/${id}/claims` },
    { label: "Ledger", href: `/law/matters/${id}/ledger` },
    { label: "Evidence", href: `/law/matters/${id}/evidence` },
    { label: "Documents", href: `/law/matters/${id}/documents` },
    { label: "Jurisdiction", href: `/law/matters/${id}/jurisdiction`, active: true },
    { label: "Recovery", href: `/law/matters/${id}/recovery` },
    { label: "Timeline", href: `/law/matters/${id}/timeline` },
  ];

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
            <span>Jurisdiction</span>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">Jurisdiction Analysis</h1>
          <p className="text-[var(--text-muted)] mb-8">{matter.title}</p>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 border-b border-[rgba(201,168,76,0.1)] overflow-x-auto">
            {tabs.map((t) => (
              <Link key={t.label} href={t.href}
                className={`px-4 py-3 text-sm font-serif tracking-wider uppercase no-underline transition-colors whitespace-nowrap ${
                  t.active
                    ? "text-[var(--gold)] border-b-2 border-[var(--gold)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}>
                {t.label}
              </Link>
            ))}
          </div>

          {/* Recommended Forum */}
          <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.2)] rounded-lg p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">⚖️</span>
              <h2 className="font-serif text-xs tracking-[0.2em] uppercase text-[var(--gold)]">Recommended Forum</h2>
            </div>
            <div className="font-serif text-2xl font-bold mb-6">{j.recommendedForum}</div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="text-xs font-mono text-[var(--text-muted)] mb-1">Property State</div>
                <div className="font-serif text-lg font-semibold">{j.propertyState}</div>
              </div>
              <div>
                <div className="text-xs font-mono text-[var(--text-muted)] mb-1">Property County</div>
                <div className="font-serif text-lg font-semibold">{j.propertyCounty}</div>
              </div>
              <div>
                <div className="text-xs font-mono text-[var(--text-muted)] mb-1">Defendant State</div>
                <div className="font-serif text-lg font-semibold">{j.defendantCurrentState}</div>
              </div>
              <div>
                <div className="text-xs font-mono text-[var(--text-muted)] mb-1">Transaction State</div>
                <div className="font-serif text-lg font-semibold">{j.transactionState}</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[rgba(201,168,76,0.1)]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[var(--text-muted)]">Title Still Active:</span>
                <span className={`text-xs font-mono font-bold ${j.titleStillActive ? "text-[var(--success)]" : "text-[var(--text-muted)]"}`}>
                  {j.titleStillActive ? "YES" : "NO"}
                </span>
              </div>
            </div>
          </div>

          {/* Reason Log */}
          <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8 mb-8">
            <h2 className="font-serif text-xs tracking-[0.2em] uppercase text-[var(--gold)] mb-4">
              Jurisdictional Reason Log ({j.reasonLog.length})
            </h2>
            <div className="space-y-3">
              {j.reasonLog.map((reason, i) => (
                <div key={i} className="flex items-start gap-4 py-3 border-b border-[rgba(201,168,76,0.05)] last:border-0">
                  <span className="font-mono text-xs text-[var(--gold)] w-6 shrink-0 pt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm text-[var(--text-primary)] leading-relaxed">{reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Filing Readiness Checklist */}
          <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xs tracking-[0.2em] uppercase text-[var(--gold)]">
                Filing Readiness Checklist
              </h2>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-[rgba(201,168,76,0.1)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${readyPct}%`,
                      backgroundColor: readyPct === 100 ? "var(--success)" : "var(--gold)",
                    }}
                  />
                </div>
                <span className="font-mono text-xs text-[var(--gold)]">{readyCount}/{totalItems}</span>
              </div>
            </div>
            <div className="space-y-2">
              {j.filingReadiness.map((item, i) => (
                <div key={i} className="flex items-start gap-4 py-3 border-b border-[rgba(201,168,76,0.05)] last:border-0">
                  <span className={`text-lg shrink-0 ${item.ready ? "" : "opacity-50"}`}>
                    {item.ready ? "✅" : "⬜"}
                  </span>
                  <div className="flex-1">
                    <div className={`text-sm font-semibold ${item.ready ? "text-[var(--success)]" : "text-[var(--text-primary)]"}`}>
                      {item.item}
                    </div>
                    {item.notes && (
                      <div className="text-xs text-[var(--text-muted)] mt-1">{item.notes}</div>
                    )}
                  </div>
                  <span className={`text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded ${
                    item.ready
                      ? "bg-[rgba(34,197,94,0.15)] text-[var(--success)]"
                      : "bg-[rgba(239,68,68,0.15)] text-red-400"
                  }`}>
                    {item.ready ? "Ready" : "Needed"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Parties Jurisdiction Summary */}
          <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8">
            <h2 className="font-serif text-xs tracking-[0.2em] uppercase text-[var(--gold)] mb-4">Parties & Jurisdiction</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {matter.parties.map(p => (
                <div key={p.id} className="border border-[rgba(201,168,76,0.05)] rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-mono tracking-wider uppercase ${
                      p.role === "claimant" ? "text-[var(--gold)]" : "text-red-400"
                    }`}>
                      {p.role}
                    </span>
                  </div>
                  <div className="font-serif text-lg font-semibold mb-2">{p.name}</div>
                  <div className="text-xs text-[var(--text-muted)] space-y-1">
                    <p>Current State: <span className="text-[var(--text-primary)]">{p.currentState}</span></p>
                    {p.historicalState && <p>Historical State: <span className="text-[var(--text-primary)]">{p.historicalState}</span></p>}
                    {p.serviceStatus && <p>Service: <span className="text-[var(--text-primary)]">{p.serviceStatus}</span></p>}
                  </div>
                  {p.collectionRiskFlags.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[rgba(201,168,76,0.05)]">
                      <div className="text-[10px] font-mono text-red-400 mb-1">RISK FLAGS</div>
                      <ul className="space-y-1">
                        {p.collectionRiskFlags.map((flag, i) => (
                          <li key={i} className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                            {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
