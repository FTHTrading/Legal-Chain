"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { use, useState, useMemo } from "react";
import { SEED_MATTER_CREAMER, SEED_MATTER_DELCAMPO, SEED_MATTER_TRON } from "@/lib/data/seed";

const ALL_MATTERS = [SEED_MATTER_CREAMER, SEED_MATTER_DELCAMPO, SEED_MATTER_TRON];

function getMatter(id: string) {
  return ALL_MATTERS.find(m => m.id === id) || null;
}

export default function LedgerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const matter = getMatter(id);
  const [catFilter, setCatFilter] = useState("all");

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
    { label: "Ledger", href: `/law/matters/${id}/ledger`, active: true },
    { label: "Evidence", href: `/law/matters/${id}/evidence` },
  ];

  const categories = ["all", ...Array.from(new Set(matter.ledger.map(e => e.category)))];

  const filteredLedger = catFilter === "all" ? matter.ledger : matter.ledger.filter(e => e.category === catFilter);

  let runningBalance = 0;
  const ledgerWithBalance = filteredLedger.map((entry) => {
    runningBalance += entry.amount;
    return { ...entry, balance: runningBalance };
  });

  const totalClaimed = filteredLedger.filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0);
  const totalOffsets = filteredLedger.filter((e) => e.amount < 0).reduce((s, e) => s + e.amount, 0);
  const netBalance = totalClaimed + totalOffsets;

  function exportCSV() {
    const header = "#,Date,Description,Category,Claimed,Offset,Balance,Status";
    let bal = 0;
    const rows = filteredLedger.map((e, i) => {
      bal += e.amount;
      return [
        i + 1,
        e.date,
        `"${e.description.replace(/"/g, '""')}"`,
        e.category.replace(/_/g, " "),
        e.amount > 0 ? e.amount : "",
        e.amount < 0 ? Math.abs(e.amount) : "",
        bal,
        e.verificationStatus,
      ].join(",");
    });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${matter!.matterId}-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
            <span>Ledger</span>
          </div>

          <div className="flex items-center justify-between mb-2">
            <h1 className="font-serif text-3xl md:text-4xl font-bold">
              Financial Ledger
            </h1>
            <button onClick={exportCSV} className="text-xs font-mono px-4 py-2 bg-[var(--gold)] text-[var(--midnight)] rounded hover:brightness-110 transition-all cursor-pointer font-bold">
              EXPORT CSV
            </button>
          </div>
          <p className="text-[var(--text-muted)] mb-8">{filteredLedger.length} entries{catFilter !== "all" ? ` (${catFilter.replace(/_/g, " ")})` : ""} — {matter.title}</p>

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

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(cat => (
              <button key={cat} onClick={() => setCatFilter(cat)} className={`text-xs font-mono tracking-wider uppercase px-3 py-1.5 rounded border transition-colors cursor-pointer ${
                catFilter === cat
                  ? "bg-[var(--gold)] text-[var(--midnight)] border-[var(--gold)]"
                  : "bg-transparent text-[var(--text-muted)] border-[rgba(201,168,76,0.2)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
              }`}>
                {cat === "all" ? "all" : cat.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6">
              <div className="text-xs text-[var(--text-muted)] mb-1">Sale Price</div>
              <div className="font-serif text-xl font-bold text-[var(--text-primary)]">{matter.property.salePrice ? `$${matter.property.salePrice.toLocaleString()}` : "TBD"}</div>
            </div>
            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6">
              <div className="text-xs text-[var(--text-muted)] mb-1">Total Claimed</div>
              <div className="font-serif text-xl font-bold text-[var(--success)]">${totalClaimed.toLocaleString()}</div>
            </div>
            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6">
              <div className="text-xs text-[var(--text-muted)] mb-1">Total Offsets</div>
              <div className="font-serif text-xl font-bold text-red-400">${Math.abs(totalOffsets).toLocaleString()}</div>
            </div>
            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6">
              <div className="text-xs text-[var(--text-muted)] mb-1">Net Balance Owed</div>
              <div className={`font-serif text-xl font-bold ${netBalance >= 0 ? "text-[var(--gold)]" : "text-red-400"}`}>
                ${Math.abs(netBalance).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(201,168,76,0.1)]">
                    <th className="text-left px-6 py-4 text-xs font-mono tracking-wider uppercase text-[var(--gold)]">#</th>
                    <th className="text-left px-6 py-4 text-xs font-mono tracking-wider uppercase text-[var(--gold)]">Date</th>
                    <th className="text-left px-6 py-4 text-xs font-mono tracking-wider uppercase text-[var(--gold)]">Description</th>
                    <th className="text-left px-6 py-4 text-xs font-mono tracking-wider uppercase text-[var(--gold)]">Category</th>
                    <th className="text-right px-6 py-4 text-xs font-mono tracking-wider uppercase text-[var(--gold)]">Claimed</th>
                    <th className="text-right px-6 py-4 text-xs font-mono tracking-wider uppercase text-[var(--gold)]">Offset</th>
                    <th className="text-right px-6 py-4 text-xs font-mono tracking-wider uppercase text-[var(--gold)]">Balance</th>
                    <th className="text-center px-6 py-4 text-xs font-mono tracking-wider uppercase text-[var(--gold)]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerWithBalance.map((entry, i) => (
                    <tr key={entry.id} className="border-b border-[rgba(201,168,76,0.05)] hover:bg-[rgba(201,168,76,0.02)] transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-[var(--text-muted)]">{String(i + 1).padStart(2, "0")}</td>
                      <td className="px-6 py-4 text-sm font-mono text-[var(--text-muted)]">{entry.date}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold">{entry.description}</div>
                        {entry.disputeNote && <div className="text-xs text-[var(--text-muted)] mt-0.5">{entry.disputeNote}</div>}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-[var(--text-muted)]">{entry.category.replace(/_/g, " ")}</td>
                      <td className="px-6 py-4 text-right text-sm font-mono text-[var(--success)]">
                        {entry.amount > 0 ? `$${entry.amount.toLocaleString()}` : ""}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-mono text-red-400">
                        {entry.amount < 0 ? `$${Math.abs(entry.amount).toLocaleString()}` : ""}
                      </td>
                      <td className={`px-6 py-4 text-right text-sm font-mono font-bold ${entry.balance >= 0 ? "text-[var(--gold)]" : "text-red-400"}`}>
                        ${entry.balance.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-xs font-mono tracking-wider ${
                          entry.verificationStatus === "verified" ? "text-[var(--success)]" :
                          entry.verificationStatus === "disputed" ? "text-red-400" :
                          "text-[var(--text-muted)]"
                        }`}>
                          {entry.verificationStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
