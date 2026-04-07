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

export default async function MatterOverview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const totalLedger = matter.ledger.reduce((sum, e) => sum + e.amount, 0);
  const claimant = matter.parties.find((p) => p.role === "claimant");
  const respondent = matter.parties.find((p) => p.role === "respondent");

  const tabs = [
    { label: "Overview", href: `/law/matters/${id}`, active: true },
    { label: "Claims", href: `/law/matters/${id}/claims` },
    { label: "Ledger", href: `/law/matters/${id}/ledger` },
    { label: "Evidence", href: `/law/matters/${id}/evidence` },
    { label: "Documents", href: `/law/matters/${id}/documents` },
    { label: "Jurisdiction", href: `/law/matters/${id}/jurisdiction` },
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
            <span>{matter.matterId}</span>
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-2 h-2 rounded-full bg-[var(--gold)]" />
                <span className="text-xs font-mono tracking-wider uppercase text-[var(--gold)]">
                  {matter.status.replace("_", " ")}
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  {matter.matterId}
                </span>
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">{matter.title}</h1>
            </div>
            <div className="shrink-0 text-right">
              <div className="font-serif text-3xl font-bold text-[var(--gold)]">
                ${matter.damages.estimatedCaseValue.toLocaleString()}
              </div>
              <div className="text-xs font-mono text-[var(--text-muted)]">Estimated Recovery</div>
            </div>
          </div>

          {/* Tab Navigation */}
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

          {/* Property Asset */}
          <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8 mb-8">
            <h2 className="font-serif text-xs tracking-[0.2em] uppercase text-[var(--gold)] mb-4">Property Asset</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-[var(--text-muted)] mb-1">Address</div>
                <div className="font-serif text-lg font-semibold">{matter.property.address}</div>
                <div className="text-sm text-[var(--text-muted)]">{matter.property.state}</div>
              </div>
              <div>
                <div className="text-sm text-[var(--text-muted)] mb-1">County / Jurisdiction</div>
                <div className="font-serif text-lg font-semibold">{matter.property.county} County</div>
              </div>
              <div>
                <div className="text-sm text-[var(--text-muted)] mb-1">Sale Date / Sale Price</div>
                <div className="font-serif text-lg font-semibold">{matter.property.saleDate}</div>
                <div className="text-sm text-[var(--gold)]">{matter.property.salePrice ? `$${matter.property.salePrice.toLocaleString()}` : "TBD"}</div>
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {[claimant, respondent].filter(Boolean).map((p) => (
              <div key={p!.id} className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-xs font-mono tracking-wider uppercase ${
                    p!.role === "claimant" ? "text-[var(--gold)]" : "text-red-400"
                  }`}>
                    {p!.role}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold mb-1">{p!.name}</h3>
                <div className="text-sm text-[var(--text-muted)] space-y-1">
                  <p>State: {p!.currentState}</p>
                  {p!.contact?.email && <p>Email: {p!.contact.email}</p>}
                  {p!.contact?.phone && <p>Phone: {p!.contact.phone}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Claims Summary */}
          <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xs tracking-[0.2em] uppercase text-[var(--gold)]">Claims ({matter.claims.length})</h2>
              <Link href={`/law/matters/${id}/claims`} className="text-xs font-mono text-[var(--gold)] no-underline hover:underline">View All →</Link>
            </div>
            <div className="grid gap-3">
              {matter.claims.map((c, i) => (
                <div key={c.id} className="flex items-center justify-between py-3 border-b border-[rgba(201,168,76,0.05)] last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[var(--text-muted)] w-8">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <div className="font-serif text-sm font-semibold">{c.name}</div>
                      <div className="text-xs text-[var(--text-muted)]">{c.type.replace(/_/g, " ")}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-mono tracking-wider uppercase ${
                      c.strengthScore === "strong" ? "text-[var(--success)]" :
                      c.strengthScore === "moderate" ? "text-[var(--gold)]" :
                      "text-[var(--text-muted)]"
                    }`}>
                      {c.strengthScore}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Snapshot */}
          <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xs tracking-[0.2em] uppercase text-[var(--gold)]">Financial Ledger Snapshot</h2>
              <Link href={`/law/matters/${id}/ledger`} className="text-xs font-mono text-[var(--gold)] no-underline hover:underline">Full Ledger →</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Sale Price", val: matter.property.salePrice ? `$${matter.property.salePrice.toLocaleString()}` : "TBD", color: "text-[var(--text-primary)]" },
                { label: "Net Balance", val: `$${totalLedger.toLocaleString()}`, color: totalLedger >= 0 ? "text-[var(--success)]" : "text-red-400" },
                { label: "Ledger Entries", val: String(matter.ledger.length), color: "text-[var(--text-primary)]" },
                { label: "Estimated Recovery", val: `$${matter.damages.estimatedCaseValue.toLocaleString()}`, color: "text-[var(--gold)]" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-xs text-[var(--text-muted)] mb-1">{s.label}</div>
                  <div className={`font-serif text-xl font-bold ${s.color}`}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Jurisdiction */}
          <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8 mb-8">
            <h2 className="font-serif text-xs tracking-[0.2em] uppercase text-[var(--gold)] mb-4">Jurisdiction Assessment</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-[var(--text-muted)] mb-1">Recommended Forum</div>
                <div className="font-serif text-lg font-semibold">{matter.jurisdiction.recommendedForum}</div>
              </div>
              <div>
                <div className="text-sm text-[var(--text-muted)] mb-1">Jurisdictional Reasoning</div>
                <ul className="text-sm text-[var(--text-muted)] space-y-1">
                  {matter.jurisdiction.reasonLog.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[var(--gold)]">•</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Deadlines */}
          {matter.deadlines.length > 0 && (
            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8">
              <h2 className="font-serif text-xs tracking-[0.2em] uppercase text-[var(--gold)] mb-4">Key Deadlines</h2>
              <div className="grid gap-3">
                {matter.deadlines.map((d) => (
                  <div key={d.id} className="flex items-center justify-between py-3 border-b border-[rgba(201,168,76,0.05)] last:border-0">
                    <div>
                      <div className="font-serif text-sm font-semibold">{d.title}</div>
                      <div className="text-xs text-[var(--text-muted)]">{d.notes}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono text-[var(--text-muted)]">
                        {d.date}
                      </div>
                      <div className={`text-xs font-mono tracking-wider uppercase ${
                        d.status === "missed" ? "text-red-400" :
                        d.status === "pending" ? "text-[var(--gold)]" :
                        d.status === "met" ? "text-[var(--success)]" :
                        "text-[var(--text-muted)]"
                      }`}>{d.type}</div>
                    </div>
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
