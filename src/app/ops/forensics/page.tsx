import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SEED_FORENSIC_TRON } from "@/lib/data/seed-platform";

export const metadata = {
  title: "Forensics Lab — UNYKORN // LAW",
  description: "Web3 blockchain forensic investigations — wallet tracing, transaction analysis, evidence packaging.",
};

export default function ForensicsPage() {
  const fc = SEED_FORENSIC_TRON;
  const totalTracedUsd = parseFloat(fc.totalValueTraced || "0");
  const recoverableUsd = parseFloat(fc.totalValueRecoverable || "0");
  const riskColors: Record<string, string> = {
    low: "text-green-400",
    medium: "text-yellow-400",
    high: "text-orange-400",
    critical: "text-red-400",
  };
  const caseRisk = fc.transactions.some(t => t.riskLevel === "critical") ? "critical"
    : fc.transactions.some(t => t.riskLevel === "high") ? "high" : "medium";

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[104px] pb-16 px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">OPERATIONS › FORENSICS</p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              FORENSICS<br /><span className="text-[var(--gold)]">LAB.</span>
            </h1>
            <p className="text-[var(--text-muted)] max-w-2xl">
              Web3 blockchain forensics — wallet tracing, transaction graph analysis, cross-chain bridge detection,
              and court-ready evidence packaging across TRON, Ethereum, Polygon, Solana, and 10+ networks.
            </p>
          </div>

          {/* Active Case Card */}
          <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6 mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded text-yellow-400 bg-yellow-900/20">
                    {fc.status}
                  </span>
                  <span className={`text-xs font-mono ${riskColors[caseRisk]}`}>
                    ● RISK: {caseRisk.toUpperCase()}
                  </span>
                </div>
                <h2 className="font-serif text-2xl font-bold mb-1">{fc.title}</h2>
                <p className="text-sm font-mono text-[var(--text-muted)]">{fc.id}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono text-[var(--text-muted)]">Type</p>
                <p className="text-sm font-mono text-[var(--gold)]">{fc.caseType.replace(/_/g, " ")}</p>
              </div>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-4">{fc.description}</p>

            {/* Case Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Chains", value: fc.chains.join(", ").toUpperCase() },
                { label: "Wallets Traced", value: fc.wallets.length },
                { label: "Transactions", value: fc.transactions.length },
                { label: "Total Traced", value: `$${totalTracedUsd.toLocaleString()}` },
                { label: "Est. Recoverable", value: `$${recoverableUsd.toLocaleString()}` },
              ].map(s => (
                <div key={s.label} className="bg-[var(--navy)] rounded p-3 text-center">
                  <p className="text-lg font-serif font-bold text-[var(--gold)]">{s.value}</p>
                  <p className="text-xs font-mono text-[var(--text-muted)]">{s.label.toUpperCase()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Traced Wallets */}
          <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg overflow-hidden mb-8">
            <div className="p-4 border-b border-[rgba(201,168,76,0.1)]">
              <p className="text-xs font-mono text-[var(--gold)] tracking-wider">TRACED WALLETS</p>
            </div>
            <div className="divide-y divide-[rgba(201,168,76,0.05)]">
              {fc.wallets.map(w => (
                <div key={w.address} className="p-4 hover:bg-[var(--navy)] transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold">{w.label || w.address}</span>
                        <span className={`text-xs font-mono ${riskColors[w.riskLevel]}`}>
                          {w.riskLevel}
                        </span>
                        <span className="text-xs font-mono text-[var(--text-muted)] px-2 py-0.5 bg-[var(--navy)] rounded">
                          {w.chain.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-[var(--text-muted)] break-all">{w.address}</p>
                      {w.ownerName && <p className="text-xs text-[var(--text-muted)] mt-1">Owner: {w.ownerName}</p>}
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      {w.transactionCount != null && <p className="text-sm font-mono">{w.transactionCount} txs</p>}
                      {w.firstSeen && (
                        <p className="text-xs font-mono text-[var(--text-muted)]">
                          First: {new Date(w.firstSeen).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {w.riskIndicators.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {w.riskIndicators.map(tag => (
                        <span key={tag} className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--navy)] text-[var(--text-muted)]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Graph */}
          <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg overflow-hidden mb-8">
            <div className="p-4 border-b border-[rgba(201,168,76,0.1)]">
              <p className="text-xs font-mono text-[var(--gold)] tracking-wider">TRACED TRANSACTIONS</p>
            </div>
            <div className="divide-y divide-[rgba(201,168,76,0.05)]">
              {fc.transactions.map(tx => {
                const amountDisplay = (parseFloat(tx.amount) / 1e6).toLocaleString();
                return (
                <div key={tx.id} className="p-4 hover:bg-[var(--navy)] transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Arrow indicator */}
                    <div className="shrink-0 flex flex-col items-center pt-1">
                      <span className="text-xs font-mono text-[var(--text-muted)]">{tx.fromAddress.slice(0,10)}</span>
                      <span className="text-[var(--gold)] my-1">↓</span>
                      <span className="text-xs font-mono text-[var(--text-muted)]">{tx.toAddress.slice(0,10)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold">{tx.notes || tx.txType}</span>
                        <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                          tx.riskIndicators.includes("layering_pattern") ? "text-red-400 bg-red-900/20" :
                          tx.riskIndicators.includes("cross_chain_bridge") ? "text-orange-400 bg-orange-900/20" :
                          "text-yellow-400 bg-yellow-900/20"
                        }`}>
                          {tx.riskIndicators[0]?.replace(/_/g, " ") || tx.txType}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-[var(--text-muted)] break-all mb-1">{tx.txHash}</p>
                      <div className="flex items-center gap-4 text-xs font-mono text-[var(--text-muted)]">
                        <span>{tx.chain.toUpperCase()}</span>
                        <span>{tx.asset}</span>
                        <span>${amountDisplay}</span>
                        <span>{new Date(tx.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-serif font-bold text-[var(--gold)]">${amountDisplay}</p>
                      <p className="text-xs font-mono text-[var(--text-muted)]">{tx.asset}</p>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>

          {/* Evidence Packaging */}
          <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6">
            <h2 className="font-serif text-sm tracking-[0.2em] uppercase text-[var(--gold)] mb-4">EVIDENCE PACKAGE</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <button className="p-4 bg-[var(--navy)] border border-[rgba(201,168,76,0.2)] rounded text-left hover:border-[var(--gold)] transition-colors cursor-pointer">
                <p className="text-sm font-bold mb-1">Transaction Report</p>
                <p className="text-xs text-[var(--text-muted)]">Full traced transaction history with chain verification timestamps</p>
              </button>
              <button className="p-4 bg-[var(--navy)] border border-[rgba(201,168,76,0.2)] rounded text-left hover:border-[var(--gold)] transition-colors cursor-pointer">
                <p className="text-sm font-bold mb-1">Wallet Analysis</p>
                <p className="text-xs text-[var(--text-muted)]">Complete wallet ownership analysis with risk scoring</p>
              </button>
              <button className="p-4 bg-[var(--navy)] border border-[rgba(201,168,76,0.2)] rounded text-left hover:border-[var(--gold)] transition-colors cursor-pointer">
                <p className="text-sm font-bold mb-1">Court Declaration</p>
                <p className="text-xs text-[var(--text-muted)]">Formatted expert declaration for court filing with exhibits</p>
              </button>
            </div>
          </div>

          <div className="mt-8 border-t border-[rgba(201,168,76,0.1)] pt-6">
            <p className="text-xs text-[var(--text-muted)] font-mono leading-relaxed">
              CHAIN OF CUSTODY: All forensic evidence is cryptographically hashed at collection, with chain-of-custody
              metadata recorded in the immutable audit log. Transaction data is verified against on-chain state at time of
              capture. Expert declarations require attorney review before filing.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
