"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { use, useState } from "react";
import { SEED_MATTER_CREAMER, SEED_MATTER_DELCAMPO, SEED_MATTER_TRON } from "@/lib/data/seed";
import MatterTabs from "@/components/law/MatterTabs";

const ALL_MATTERS = [SEED_MATTER_CREAMER, SEED_MATTER_DELCAMPO, SEED_MATTER_TRON];

const CATEGORY_LABELS: Record<string, string> = {
  deed: "Deed",
  settlement_statement: "Settlement Statement",
  escrow_disbursement: "Escrow Disbursement",
  invoice: "Invoice",
  receipt: "Receipt",
  bank_statement: "Bank Statement",
  wire_confirmation: "Wire Confirmation",
  communication: "Communication",
  tax_appraisal: "Tax Appraisal",
  loan_document: "Loan Document",
  photo: "Photo",
  video: "Video",
  expert_report: "Expert Report",
  contract: "Contract",
  entity_document: "Entity Document",
  other: "Other",
};

const CATEGORY_ICONS: Record<string, string> = {
  deed: "📜",
  settlement_statement: "📋",
  escrow_disbursement: "🏦",
  invoice: "🧾",
  receipt: "🧾",
  bank_statement: "💳",
  wire_confirmation: "📡",
  communication: "✉️",
  tax_appraisal: "📊",
  loan_document: "📄",
  photo: "📷",
  video: "🎬",
  expert_report: "🔬",
  contract: "📑",
  entity_document: "🏢",
  other: "📎",
};

function getMatter(id: string) {
  return ALL_MATTERS.find(m => m.id === id) || null;
}

export default function DocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const matter = getMatter(id);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

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



  // Group evidence by category for document inventory
  const categories = matter.evidence.reduce((acc, e) => {
    const cat = e.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(e);
    return acc;
  }, {} as Record<string, typeof matter.evidence>);

  const uniqueCategories = Object.keys(categories).sort();

  const filteredEvidence = categoryFilter === "all"
    ? matter.evidence
    : matter.evidence.filter(e => e.category === categoryFilter);

  // Filing readiness from jurisdiction
  const readyCount = matter.jurisdiction.filingReadiness.filter(f => f.ready).length;
  const totalReady = matter.jurisdiction.filingReadiness.length;

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
            <span>Documents</span>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">Document Inventory</h1>
          <p className="text-[var(--text-muted)] mb-8">
            {matter.evidence.length} items across {uniqueCategories.length} categories — {matter.title}
          </p>

          {/* Tabs */}
          <MatterTabs matterId={id} />

          {/* Document Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6 text-center">
              <div className="font-serif text-3xl font-bold text-[var(--gold)]">{matter.evidence.length}</div>
              <div className="text-xs font-mono text-[var(--text-muted)] mt-1">Total Documents</div>
            </div>
            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6 text-center">
              <div className="font-serif text-3xl font-bold text-[var(--gold)]">{uniqueCategories.length}</div>
              <div className="text-xs font-mono text-[var(--text-muted)] mt-1">Categories</div>
            </div>
            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6 text-center">
              <div className="font-serif text-3xl font-bold text-[var(--success)]">
                {matter.evidence.filter(e => e.status === "verified").length}
              </div>
              <div className="text-xs font-mono text-[var(--text-muted)] mt-1">Verified</div>
            </div>
            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6 text-center">
              <div className="font-serif text-3xl font-bold" style={{ color: readyCount === totalReady ? "var(--success)" : "var(--gold)" }}>
                {readyCount}/{totalReady}
              </div>
              <div className="text-xs font-mono text-[var(--text-muted)] mt-1">Filing Ready</div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`px-3 py-1.5 rounded text-xs font-mono cursor-pointer transition-colors border ${
                categoryFilter === "all"
                  ? "bg-[var(--gold)] text-[var(--midnight)] border-[var(--gold)]"
                  : "bg-transparent text-[var(--text-muted)] border-[rgba(201,168,76,0.2)] hover:border-[var(--gold)]"
              }`}>
              All ({matter.evidence.length})
            </button>
            {uniqueCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded text-xs font-mono cursor-pointer transition-colors border ${
                  categoryFilter === cat
                    ? "bg-[var(--gold)] text-[var(--midnight)] border-[var(--gold)]"
                    : "bg-transparent text-[var(--text-muted)] border-[rgba(201,168,76,0.2)] hover:border-[var(--gold)]"
                }`}>
                {CATEGORY_ICONS[cat] || "📎"} {CATEGORY_LABELS[cat] || cat} ({categories[cat].length})
              </button>
            ))}
          </div>

          {/* Document List */}
          <div className="space-y-3">
            {filteredEvidence.map((doc, i) => (
              <div key={doc.id} className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl">{CATEGORY_ICONS[doc.category] || "📎"}</span>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-serif text-sm font-semibold">{doc.title}</span>
                        <span className={`text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded ${
                          doc.status === "verified" ? "bg-[rgba(34,197,94,0.15)] text-[var(--success)]" :
                          doc.status === "supported" ? "bg-[rgba(201,168,76,0.15)] text-[var(--gold)]" :
                          doc.status === "alleged" ? "bg-[rgba(156,163,175,0.15)] text-[var(--text-muted)]" :
                          "bg-[rgba(239,68,68,0.15)] text-red-400"
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                      {doc.description && (
                        <p className="text-xs text-[var(--text-muted)] mb-2">{doc.description}</p>
                      )}
                      <div className="flex flex-wrap gap-3 text-[10px] font-mono text-[var(--text-muted)]">
                        <span>Category: {CATEGORY_LABELS[doc.category] || doc.category}</span>
                        {doc.dateOfDocument && <span>Date: {doc.dateOfDocument}</span>}
                        {doc.sourceParty && <span>Source: {doc.sourceParty}</span>}
                        {doc.linkedClaims.length > 0 && (
                          <span>Claims: {doc.linkedClaims.length}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    {doc.hashOnChain && (
                      <span className="text-[10px] font-mono text-[var(--gold)] bg-[rgba(201,168,76,0.1)] px-2 py-1 rounded" title={doc.hashOnChain}>
                        ⛓ On-Chain
                      </span>
                    )}
                    <span className="font-mono text-xs text-[var(--text-muted)]">#{String(i + 1).padStart(2, "0")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredEvidence.length === 0 && (
            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-12 text-center">
              <div className="text-4xl mb-4">📂</div>
              <p className="font-serif text-lg text-[var(--text-muted)]">No documents in this category</p>
            </div>
          )}

          {/* Missing Evidence Summary */}
          {matter.claims.some(c => c.elements.some(el => el.missingEvidence.length > 0)) && (
            <div className="bg-[var(--navy-card)] border border-[rgba(239,68,68,0.2)] rounded-lg p-8 mt-8">
              <h2 className="font-serif text-xs tracking-[0.2em] uppercase text-red-400 mb-4">Missing Documents</h2>
              <div className="space-y-4">
                {matter.claims.map(claim => {
                  const missing = claim.elements.flatMap(el => el.missingEvidence);
                  if (missing.length === 0) return null;
                  return (
                    <div key={claim.id}>
                      <div className="font-serif text-sm font-semibold mb-2 text-[var(--text-primary)]">{claim.name}</div>
                      <ul className="space-y-1">
                        {missing.map((item, i) => (
                          <li key={i} className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
