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

export default async function EvidencePage({ params }: { params: Promise<{ id: string }> }) {
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
    { label: "Ledger", href: `/law/matters/${id}/ledger` },
    { label: "Evidence", href: `/law/matters/${id}/evidence`, active: true },
  ];

  const statusCounts = matter.evidence.reduce((acc, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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

          {/* Status Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Verified", count: statusCounts["verified"] || 0, color: "text-[var(--success)]" },
              { label: "Supported", count: statusCounts["supported"] || 0, color: "text-[var(--gold)]" },
              { label: "Alleged", count: statusCounts["alleged"] || 0, color: "text-[var(--text-muted)]" },
              { label: "Disputed", count: statusCounts["disputed"] || 0, color: "text-red-400" },
            ].map((s) => (
              <div key={s.label} className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6 text-center">
                <div className={`font-serif text-2xl font-bold ${s.color}`}>{s.count}</div>
                <div className="text-xs tracking-[0.1em] uppercase text-[var(--text-muted)] mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Evidence Items */}
          <div className="space-y-4">
            {matter.evidence.map((item, i) => (
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
                  <div className="text-right shrink-0">
                    <span className={`text-xs font-mono tracking-wider uppercase ${
                      item.status === "verified" ? "text-[var(--success)]" :
                      item.status === "supported" ? "text-[var(--gold)]" :
                      item.status === "disputed" ? "text-red-400" :
                      "text-[var(--text-muted)]"
                    }`}>
                      {item.status}
                    </span>
                    {item.dateObtained && (
                      <div className="text-xs text-[var(--text-muted)] mt-1">{item.dateObtained}</div>
                    )}
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
        </div>
      </main>
      <Footer />
    </>
  );
}
