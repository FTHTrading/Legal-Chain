"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

interface ContractStatus {
  address: string;
  deployed: boolean;
  label: string;
}

interface PolygonStatus {
  network:   { name: string; chainId: number; rpc: string; explorer: string };
  block:     number | null;
  gasPrice:  string | null;
  wallets: {
    deployer: { address: string; balance: string };
    issuer:   { address: string; balance: string };
  };
  contracts: Record<string, ContractStatus>;
  ipfs: {
    online: boolean;
    id:     { ID: string; AgentVersion: string } | null;
    repo:   { RepoSize: number; NumObjects: number; StorageMax: number } | null;
  };
  timestamp: string;
}

interface AIStatus {
  status: string;
  providers: string[];
  models: Record<string, string>;
  toolCount: number;
  tools: { name: string; description: string }[];
}

interface RAGStatus {
  status: string;
  vectorStore: { totalDocuments: number; uniqueSources: number; types: Record<string, number> };
  config: { chunkSize: number; topK: number; embeddingModel: string };
}

const CONTRACT_META: Record<string, { label: string; icon: string; description: string }> = {
  legalCaseNFT:      { label: "LegalCaseNFT",      icon: "⚖️",  description: "ERC-721 case file tokens" },
  legalCaseAccount:  { label: "LegalCaseAccount",   icon: "🏦",  description: "ERC-6551 token-bound vaults" },
  auditAnchor:       { label: "AuditAnchor",        icon: "⚓",  description: "Immutable audit hash anchoring" },
  documentRegistry:  { label: "DocumentRegistry",   icon: "📄",  description: "On-chain document verification" },
  legalNameRegistry: { label: "LegalNameRegistry",  icon: "🏷️",  description: ".law / .legal namespace NFTs" },
};

function isFundedAddress(balance: string): boolean {
  return parseFloat(balance) > 0.01;
}

export default function PolygonChainDashboard() {
  const [status, setStatus]         = useState<PolygonStatus | null>(null);
  const [aiStatus, setAiStatus]     = useState<AIStatus | null>(null);
  const [ragStatus, setRagStatus]   = useState<RAGStatus | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [chainRes, aiRes, ragRes] = await Promise.allSettled([
        fetch("/api/chain/polygon", { cache: "no-store" }),
        fetch("/api/ai/status",     { cache: "no-store" }),
        fetch("/api/rag/status",    { cache: "no-store" }),
      ]);
      if (chainRes.status === "fulfilled" && chainRes.value.ok) {
        setStatus(await chainRes.value.json());
      }
      if (aiRes.status === "fulfilled" && aiRes.value.ok) {
        setAiStatus(await aiRes.value.json());
      }
      if (ragRes.status === "fulfilled" && ragRes.value.ok) {
        setRagStatus(await ragRes.value.json());
      }
      setLastRefresh(new Date());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30_000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const deployedCount = status
    ? Object.values(status.contracts).filter((c) => c.deployed).length
    : 0;
  const totalContracts = Object.keys(CONTRACT_META).length;

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[104px] pb-16 px-8">
        <div className="max-w-[1400px] mx-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] mb-8">
            <Link href="/ops" className="hover:text-[var(--gold)] transition-colors">OPS</Link>
            <span>/</span>
            <span className="text-[var(--gold)]">LEGAL CHAIN</span>
          </div>

          {/* Header */}
          <div className="mb-10">
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">POLYGON INFRASTRUCTURE</p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              LEGAL<br /><span className="text-[var(--gold)]">CHAIN.</span>
            </h1>
            <p className="text-lg text-[var(--text-muted)] max-w-2xl">
              Smart contract deployment status, on-chain asset metrics, wallet funding, and IPFS node health
              for the UNYKORN // ADVOCACY blockchain infrastructure on Polygon.
            </p>
          </div>

          {/* Network Banner */}
          <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.15)] rounded-lg px-6 py-4 mb-8 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${loading ? "bg-yellow-400 animate-pulse" : status ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
              <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">
                {status?.network.name ?? "Connecting…"}
              </span>
            </div>
            {status && (
              <>
                <span className="text-xs font-mono text-[var(--gold)]">Chain ID {status.network.chainId}</span>
                {status.block && (
                  <span className="text-xs font-mono text-[var(--text-muted)]">Block #{status.block.toLocaleString()}</span>
                )}
                {status.gasPrice && (
                  <span className="text-xs font-mono text-[var(--text-muted)]">{status.gasPrice} Gwei</span>
                )}
                <a
                  href={status.network.explorer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-[var(--gold)] hover:underline ml-auto"
                >
                  ↗ Explorer
                </a>
              </>
            )}
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors disabled:opacity-40 ml-auto"
            >
              {loading ? "Refreshing…" : "↻ Refresh"}
            </button>
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-800/40 rounded-lg px-6 py-4 mb-8 text-red-400 text-sm font-mono">
              {error}
            </div>
          )}

          {/* Top Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              {
                label: "Contracts Deployed",
                value: `${deployedCount} / ${totalContracts}`,
                sub: deployedCount === totalContracts ? "all live" : `${totalContracts - deployedCount} pending`,
                warn: deployedCount < totalContracts,
              },
              {
                label: "Deployer Balance",
                value: status?.wallets.deployer.balance ?? "—",
                sub: "MATIC",
                warn: status ? !isFundedAddress(status.wallets.deployer.balance) : false,
              },
              {
                label: "Issuer Balance",
                value: status?.wallets.issuer.balance ?? "—",
                sub: "MATIC",
                warn: status ? !isFundedAddress(status.wallets.issuer.balance) : false,
              },
              {
                label: "IPFS Node",
                value: status?.ipfs.online ? "Online" : "Offline",
                sub: status?.ipfs.repo
                  ? `${(status.ipfs.repo.RepoSize / 1024 / 1024).toFixed(1)} MB · ${status.ipfs.repo.NumObjects} objects`
                  : "localhost:5001",
                warn: !(status?.ipfs.online),
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`bg-[var(--navy-card)] border rounded-lg p-6 ${
                  stat.warn
                    ? "border-orange-800/40 bg-orange-950/20"
                    : "border-[rgba(201,168,76,0.1)]"
                }`}
              >
                <p className={`text-2xl font-serif font-bold mb-1 ${stat.warn ? "text-orange-400" : "text-[var(--gold)]"}`}>
                  {stat.value}
                </p>
                <p className="text-xs font-mono text-[var(--text-muted)] tracking-wider mb-1">{stat.label.toUpperCase()}</p>
                <p className="text-xs font-mono text-[var(--text-muted)] opacity-60">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Contract Status Grid */}
          <div className="mb-10">
            <h2 className="font-serif text-sm tracking-[0.2em] uppercase text-[var(--gold)] mb-6">CONTRACT DEPLOYMENTS</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(CONTRACT_META).map(([key, meta]) => {
                const contract = status?.contracts[key];
                const deployed = contract?.deployed ?? false;
                const addr     = contract?.address ?? "";

                return (
                  <div
                    key={key}
                    className={`bg-[var(--navy-card)] border rounded-lg p-6 ${
                      deployed
                        ? "border-[rgba(201,168,76,0.15)]"
                        : "border-[rgba(201,168,76,0.05)] opacity-70"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl">{meta.icon}</span>
                      <span
                        className={`text-xs font-mono px-2 py-1 rounded ${
                          deployed
                            ? "bg-green-900/30 text-green-400 border border-green-800/30"
                            : "bg-[var(--navy)] text-[var(--text-muted)] border border-white/5"
                        }`}
                      >
                        {deployed ? "DEPLOYED" : "PENDING"}
                      </span>
                    </div>
                    <h3 className="font-serif text-base font-bold mb-1">{meta.label}</h3>
                    <p className="text-xs text-[var(--text-muted)] mb-3">{meta.description}</p>
                    {deployed && addr ? (
                      <a
                        href={`${status?.network.explorer}/address/${addr}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-[var(--gold)] hover:underline break-all"
                      >
                        {addr.slice(0, 10)}…{addr.slice(-6)} ↗
                      </a>
                    ) : (
                      <p className="text-xs font-mono text-[var(--text-muted)] opacity-40">
                        Not yet deployed — fund wallet &amp; run deploy script
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wallet Cards */}
          <div className="mb-10">
            <h2 className="font-serif text-sm tracking-[0.2em] uppercase text-[var(--gold)] mb-6">SIGNING WALLETS</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {status && [
                { label: "Deployer", ...status.wallets.deployer, role: "Deploys contracts, owns protocol" },
                { label: "Issuer",   ...status.wallets.issuer,   role: "Mints NFTs, signs documents" },
              ].map((w) => (
                <div
                  key={w.label}
                  className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.12)] rounded-lg p-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-mono tracking-widest text-[var(--gold)] uppercase">{w.label} Wallet</p>
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded ${
                        isFundedAddress(w.balance)
                          ? "bg-green-900/30 text-green-400 border border-green-800/30"
                          : "bg-orange-900/30 text-orange-400 border border-orange-800/30"
                      }`}
                    >
                      {parseFloat(w.balance).toFixed(4)} MATIC
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[var(--text-muted)] break-all mb-2">{w.address}</p>
                  <p className="text-xs text-[var(--text-muted)] opacity-70">{w.role}</p>
                  <div className="flex gap-3 mt-4">
                    <a
                      href={`${status.network.explorer}/address/${w.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-[var(--gold)] hover:underline"
                    >
                      View on Explorer ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Intelligence Layer */}
          <div className="mb-10">
            <h2 className="font-serif text-sm tracking-[0.2em] uppercase text-[var(--gold)] mb-6">AI INTELLIGENCE LAYER</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                {
                  label: "AI Provider",
                  value: aiStatus?.providers.length
                    ? aiStatus.providers[0].toUpperCase()
                    : "Not Configured",
                  sub: aiStatus?.providers.length
                    ? `${aiStatus.models.analysis} · ${aiStatus.toolCount} tools`
                    : "Add OPENAI_API_KEY to .env.local",
                  ok: (aiStatus?.providers.length ?? 0) > 0,
                },
                {
                  label: "RAG Vectorstore",
                  value: ragStatus?.vectorStore.totalDocuments != null
                    ? ragStatus.vectorStore.totalDocuments.toString()
                    : "—",
                  sub: ragStatus
                    ? `${ragStatus.vectorStore.uniqueSources} sources · ${Object.keys(ragStatus.vectorStore.types).length} types`
                    : "No documents ingested",
                  ok: (ragStatus?.vectorStore.totalDocuments ?? 0) >= 0,
                },
                {
                  label: "MCP Server",
                  value: "Configured",
                  sub: "legal-chain v1.0 · stdio transport",
                  ok: true,
                },
                {
                  label: "Agent Network",
                  value: "5 Agents",
                  sub: "Atlas · Lexis · DocDrafter · Forensics · Settlement",
                  ok: true,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`bg-[var(--navy-card)] border rounded-lg p-5 ${
                    stat.ok
                      ? "border-[rgba(201,168,76,0.12)]"
                      : "border-orange-800/40 bg-orange-950/20"
                  }`}
                >
                  <p className={`text-xl font-serif font-bold mb-1 ${
                    stat.ok ? "text-[var(--gold)]" : "text-orange-400"
                  }`}>
                    {stat.value}
                  </p>
                  <p className="text-xs font-mono text-[var(--text-muted)] tracking-wider mb-1 uppercase">{stat.label}</p>
                  <p className="text-xs font-mono text-[var(--text-muted)] opacity-60 leading-relaxed">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Anchor-to-RAG bridge explainer */}
            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="text-2xl mt-0.5">🤖</div>
                <div className="flex-1">
                  <h3 className="font-serif text-base font-bold mb-2">Blockchain ↔ AI Bridge</h3>
                  <p className="text-sm text-[var(--text-muted)] mb-4 leading-relaxed">
                    When a document is anchored, the system simultaneously pins it to IPFS, registers the content hash on-chain
                    (DocumentRegistry + AuditAnchor), and ingests the full text into the RAG vectorstore — making every
                    anchored document instantly searchable by the AI agent network.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                    {[
                      { step: "1", label: "IPFS pin → CID",            color: "text-blue-400 border-blue-800/30 bg-blue-900/20" },
                      { step: "2", label: "Polygon anchor → TX hash",   color: "text-[var(--gold)] border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.05)]" },
                      { step: "3", label: "RAG ingest → embeddings",    color: "text-green-400 border-green-800/30 bg-green-900/20" },
                      { step: "4", label: "AI agents → searchable",     color: "text-purple-400 border-purple-800/30 bg-purple-900/20" },
                    ].map((s) => (
                      <span key={s.step} className={`px-3 py-1 rounded border ${s.color}`}>
                        {s.step}. {s.label}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs font-mono text-[var(--text-muted)] opacity-50 mt-3">
                    Endpoint: POST /api/chain/polygon/anchor
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* IPFS Details */}
          {status?.ipfs.online && status.ipfs.id && (
            <div className="mb-10">
              <h2 className="font-serif text-sm tracking-[0.2em] uppercase text-[var(--gold)] mb-6">IPFS NODE</h2>
              <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs font-mono text-green-400 uppercase tracking-wider">Online — Kubo {status.ipfs.id.AgentVersion}</span>
                </div>
                <p className="text-xs font-mono text-[var(--text-muted)] break-all mb-2">
                  <span className="text-[var(--gold)]">Peer ID:</span> {status.ipfs.id.ID}
                </p>
                {status.ipfs.repo && (
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {[
                      { label: "Repo Size", value: `${(status.ipfs.repo.RepoSize / 1024 / 1024).toFixed(2)} MB` },
                      { label: "Objects",   value: status.ipfs.repo.NumObjects.toLocaleString() },
                      { label: "Max Size",  value: `${(status.ipfs.repo.StorageMax / 1024 / 1024 / 1024).toFixed(0)} GB` },
                    ].map((m) => (
                      <div key={m.label}>
                        <p className="text-lg font-serif font-bold text-[var(--gold)]">{m.value}</p>
                        <p className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wide">{m.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Deploy Instructions (shown when contracts not deployed) */}
          {deployedCount < totalContracts && (
            <div className="mb-10 bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8">
              <h2 className="font-serif text-sm tracking-[0.2em] uppercase text-[var(--gold)] mb-4">DEPLOY CONTRACTS</h2>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Fund issuer wallet with POL, then run from project root:
              </p>
              <pre className="bg-[var(--midnight)] rounded p-4 text-xs font-mono text-[var(--gold)] overflow-x-auto">
                npx hardhat run scripts/deploy-contracts.ts --network polygon-mainnet
              </pre>
              <p className="text-xs text-[var(--text-muted)] mt-3 opacity-70">
                Addresses auto-patched into .env.local after successful deploy. Redeploy Vercel to publish.
              </p>
            </div>
          )}

          {/* Action Links */}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: "Mint .law / .legal Name",  href: "/mint",           icon: "🏷️",  desc: "Register a namespace NFT on Polygon"  },
              { label: "View Chain Explorer",        href: "/chain",          icon: "⛓️",  desc: "Substrate chain events & blocks"      },
              { label: "Case Workspaces",            href: "/ops/cases",      icon: "📂",  desc: "Active case files & evidence"         },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="no-underline block bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6 card-lift group"
              >
                <div className="text-2xl mb-3">{link.icon}</div>
                <h3 className="font-serif text-base font-bold mb-1 group-hover:text-[var(--gold)] transition-colors">
                  {link.label}
                </h3>
                <p className="text-sm text-[var(--text-muted)]">{link.desc}</p>
              </Link>
            ))}
          </div>

          {lastRefresh && (
            <p className="text-xs font-mono text-[var(--text-muted)] mt-8 text-center opacity-50">
              Last refreshed: {lastRefresh.toLocaleTimeString()} · auto-refreshes every 30s
            </p>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
