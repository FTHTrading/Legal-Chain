"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useState, useEffect, useCallback } from "react";

type Tab = "blocks" | "matters" | "evidence" | "documents" | "approvals" | "identities" | "audit";

interface ChainStatus {
  chain: { status: string; explorer: boolean; proof_service: boolean; rpc: string };
  stats: {
    total_blocks: number;
    total_events: number;
    latest_block: number;
    total_matters: number;
    total_evidence: number;
    total_documents: number;
    total_approvals: number;
    total_identities: number;
    total_audit_entries: number;
  };
  timestamp: string;
}

interface ExplorerData {
  online: boolean;
  tab: string;
  count: number;
  data: Record<string, unknown>[];
}

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "blocks", label: "Blocks", icon: "⬡" },
  { key: "matters", label: "Matters", icon: "⚖" },
  { key: "evidence", label: "Evidence", icon: "🔗" },
  { key: "documents", label: "Documents", icon: "📄" },
  { key: "approvals", label: "Approvals", icon: "✓" },
  { key: "identities", label: "Identities", icon: "🆔" },
  { key: "audit", label: "Audit Trail", icon: "📋" },
];

const STAT_KEYS: { key: keyof ChainStatus["stats"]; label: string }[] = [
  { key: "latest_block", label: "Block Height" },
  { key: "total_matters", label: "Matters" },
  { key: "total_evidence", label: "Evidence" },
  { key: "total_documents", label: "Documents" },
  { key: "total_approvals", label: "Approvals" },
  { key: "total_identities", label: "Identities" },
  { key: "total_audit_entries", label: "Audit Entries" },
];

export default function ChainExplorer() {
  const [status, setStatus] = useState<ChainStatus | null>(null);
  const [tab, setTab] = useState<Tab>("blocks");
  const [data, setData] = useState<ExplorerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [demo, setDemo] = useState(false);

  // Fetch chain status
  useEffect(() => {
    fetch("/api/chain/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setError("Failed to reach chain status endpoint"));
  }, []);

  // Fetch tab data
  const fetchTab = useCallback(async (t: Tab) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/chain/explorer?tab=${t}&limit=50`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Explorer unavailable");
        setData(null);
        setDemo(false);
      } else {
        setData(json);
        setDemo(json.demo === true);
      }
    } catch {
      setError("Failed to fetch chain data");
      setData(null);
      setDemo(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTab(tab);
  }, [tab, fetchTab]);

  const online = status?.chain?.status === "online";
  const showDemo = !online && demo;

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-28 pb-20 px-6 md:px-12 max-w-[1400px] mx-auto w-full">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <span className={`w-3 h-3 rounded-full ${online ? "bg-[var(--success)] animate-pulse" : showDemo ? "bg-[var(--gold)] animate-pulse" : "bg-[var(--danger)]"}`} />
            <span className="font-mono text-xs tracking-widest uppercase text-[var(--text-muted)]">
              Legal-Chain {online ? "Online" : showDemo ? "Demo Mode" : "Offline"} &middot; Substrate
            </span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[var(--gold)] tracking-wide mb-3">
            Chain Explorer
          </h1>
          <p className="text-[var(--text-muted)] text-lg max-w-2xl">
            Real-time view of the Legal-Chain Substrate blockchain — every matter, piece of evidence,
            and document anchored on-chain with cryptographic proof.
          </p>
          {showDemo && (
            <div className="mt-4 bg-[rgba(201,168,76,0.08)] border border-[var(--gold)] rounded-lg px-5 py-3 inline-flex items-center gap-3">
              <span className="text-[var(--gold)] text-sm font-mono">⬡</span>
              <span className="text-sm text-[var(--text-muted)]">
                Displaying sample case data. Connect the Substrate node to see live blockchain data.
              </span>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {status && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-10">
            {STAT_KEYS.map(({ key, label }) => (
              <div key={key} className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-4 text-center">
                <div className="font-mono text-2xl font-bold text-[var(--gold)]">
                  {typeof status.stats[key] === "number"
                    ? (status.stats[key] as number).toLocaleString()
                    : String(status.stats[key])}
                </div>
                <div className="text-xs text-[var(--text-muted)] tracking-wider uppercase mt-1">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-[rgba(201,168,76,0.1)] pb-4">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`font-mono text-sm tracking-wider px-4 py-2 rounded-sm border transition-colors ${
                tab === t.key
                  ? "bg-[var(--gold)] text-[var(--midnight)] border-[var(--gold)] font-semibold"
                  : "bg-transparent text-[var(--text-muted)] border-[rgba(201,168,76,0.2)] hover:text-[var(--gold)] hover:border-[var(--gold)]"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {error && (
          <div className="bg-[rgba(204,68,68,0.1)] border border-[var(--danger)] rounded-lg p-6 text-center mb-8">
            <p className="text-[var(--danger)] font-mono text-sm">{error}</p>
            <p className="text-[var(--text-muted)] text-sm mt-2">
              The chain explorer service may be offline. Start the Substrate node and explorer API to see live data.
            </p>
          </div>
        )}

        {loading && !error && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
            <span className="ml-4 text-[var(--text-muted)] font-mono text-sm">Loading chain data...</span>
          </div>
        )}

        {!loading && data && data.data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[rgba(201,168,76,0.2)]">
                  {Object.keys(data.data[0]).map((col) => (
                    <th
                      key={col}
                      className="font-mono text-xs tracking-wider uppercase text-[var(--gold-muted)] py-3 px-4 whitespace-nowrap"
                    >
                      {col.replace(/_/g, " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.data.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-[rgba(201,168,76,0.05)] hover:bg-[rgba(201,168,76,0.03)] transition-colors"
                  >
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="font-mono text-sm text-[var(--text-primary)] py-3 px-4 whitespace-nowrap max-w-[240px] overflow-hidden text-ellipsis">
                        {typeof val === "boolean" ? (val ? "✓" : "✗") : String(val ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 text-right text-xs text-[var(--text-muted)] font-mono">
              {data.count} record{data.count !== 1 ? "s" : ""} &middot; Updated {status ? new Date(status.timestamp).toLocaleTimeString() : "—"}
            </div>
          </div>
        )}

        {!loading && data && data.data.length === 0 && !error && (
          <div className="text-center py-20">
            <p className="text-[var(--text-muted)] text-lg">No {tab} found on-chain yet.</p>
            <p className="text-[var(--text-muted)] text-sm mt-2">
              Submit transactions to the Substrate node to populate this view.
            </p>
          </div>
        )}

        {/* Chain Info Footer */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard
            title="Substrate Node"
            items={[
              ["RPC", status?.chain?.rpc || "Not publicly available"],
              ["Runtime", "legal-chain-runtime"],
              ["Pallets", "8 (matters, evidence, documents, audit, approvals, identities, access-control, agent-policy)"],
            ]}
          />
          <InfoCard
            title="Explorer API"
            items={[
              ["Endpoint", process.env.NEXT_PUBLIC_EXPLORER_URL || "Not publicly available"],
              ["Status", status?.chain?.explorer ? "Online" : "Offline"],
              ["Database", "PostgreSQL (indexed)"],
            ]}
          />
          <InfoCard
            title="Proof Service"
            items={[
              ["Endpoint", process.env.NEXT_PUBLIC_PROOF_URL || "Not publicly available"],
              ["Status", status?.chain?.proof_service ? "Online" : "Offline"],
              ["Verification", "Merkle state proofs"],
            ]}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}

function InfoCard({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6">
      <h3 className="font-serif text-lg font-semibold text-[var(--gold)] mb-4">{title}</h3>
      <dl className="space-y-2">
        {items.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-xs text-[var(--text-muted)] font-mono tracking-wider uppercase shrink-0">{label}</dt>
            <dd className="text-sm text-[var(--text-primary)] font-mono text-right truncate">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
