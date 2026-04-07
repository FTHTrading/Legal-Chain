import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { SEED_MATTER_CREAMER } from "@/lib/data/seed";

export function generateStaticParams() {
  return [{ id: SEED_MATTER_CREAMER.id }];
}

function getMatter(id: string) {
  if (id === SEED_MATTER_CREAMER.id) return SEED_MATTER_CREAMER;
  return null;
}

export default async function LedgerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const matter = getMatter(id);
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

  let runningBalance = 0;
  const ledgerWithBalance = matter.ledger.map((entry) => {
    runningBalance += entry.amount;
    return { ...entry, balance: runningBalance };
  });

  const totalClaimed = matter.ledger.filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0);
  const totalOffsets = matter.ledger.filter((e) => e.amount < 0).reduce((s, e) => s + e.amount, 0);

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

          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
            Financial Ledger
          </h1>
          <p className="text-[var(--text-muted)] mb-8">{matter.ledger.length} entries — {matter.title}</p>

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
              <div className={`font-serif text-xl font-bold ${runningBalance >= 0 ? "text-[var(--gold)]" : "text-red-400"}`}>
                ${Math.abs(runningBalance).toLocaleString()}
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
