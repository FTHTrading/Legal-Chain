import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { SEED_MATTER_CREAMER, SEED_MATTER_DELCAMPO, SEED_MATTER_TRON } from "@/lib/data/seed";

const ALL_MATTERS = [SEED_MATTER_CREAMER, SEED_MATTER_DELCAMPO, SEED_MATTER_TRON];

export function generateStaticParams() {
  return ALL_MATTERS.map(m => ({ id: m.id }));
}

function getMatter(id: string) {
  return ALL_MATTERS.find(m => m.id === id) || null;
}

export default async function ClaimsPage({ params }: { params: Promise<{ id: string }> }) {
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
    { label: "Claims", href: `/law/matters/${id}/claims`, active: true },
    { label: "Ledger", href: `/law/matters/${id}/ledger` },
    { label: "Evidence", href: `/law/matters/${id}/evidence` },
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
            <span>Claims</span>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
            Claims Analysis
          </h1>
          <p className="text-[var(--text-muted)] mb-8">{matter.claims.length} claims identified — {matter.title}</p>

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

          {/* Claims */}
          <div className="space-y-6">
            {matter.claims.map((claim, i) => (
              <div key={claim.id} className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-2xl font-bold text-[var(--gold)] opacity-30">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h2 className="font-serif text-xl font-bold">{claim.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono text-[var(--text-muted)]">{claim.type.replace(/_/g, " ")}</span>
                        <span className={`text-xs font-mono tracking-wider uppercase px-2 py-0.5 rounded ${
                          claim.strengthScore === "strong" ? "bg-[rgba(34,197,94,0.1)] text-[var(--success)]" :
                          claim.strengthScore === "moderate" ? "bg-[rgba(201,168,76,0.1)] text-[var(--gold)]" :
                          "bg-[rgba(255,255,255,0.05)] text-[var(--text-muted)]"
                        }`}>
                          {claim.strengthScore}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {claim.statusNote && (
                  <p className="text-[var(--text-muted)] leading-relaxed mb-6">{claim.statusNote}</p>
                )}

                {/* Elements */}
                {claim.elements.length > 0 && (
                  <div>
                    <div className="text-xs font-mono text-[var(--gold)] tracking-wider mb-3">Required Elements</div>
                    <div className="grid gap-2">
                      {claim.elements.map((el, idx) => (
                        <div key={idx} className="flex items-center gap-3 py-2 border-b border-[rgba(201,168,76,0.05)] last:border-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            el.status === "verified" ? "bg-[var(--success)]" :
                            el.status === "supported" ? "bg-[var(--gold)]" :
                            el.status === "disputed" ? "bg-red-400" :
                            "bg-[var(--text-muted)]"
                          }`} />
                          <div className="flex-1">
                            <div className="text-sm font-semibold">{el.elementName}</div>
                            <div className="text-xs text-[var(--text-muted)]">{el.requiredProof}</div>
                          </div>
                          <span className="text-xs font-mono text-[var(--text-muted)]">{el.status}</span>
                        </div>
                      ))}
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
