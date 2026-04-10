"use client";

/**
 * /chain ΓÇö Polygon On-Chain World Dashboard
 *
 * Live view of all deployed Legal-Chain contracts on Polygon mainnet:
 * - Contract health status
 * - Chain stats (NFTs, anchors, documents, namespaces)
 * - Recent on-chain events feed
 * - Explorer links
 */

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { ChainStats, ChainEvent } from "@/lib/polygon/types";
import { POLYGON_NETWORKS } from "@/lib/polygon/types";
import { VIDEO_GALLERY, IMAGE_GALLERY } from "@/lib/data/seed";

const CONTRACT_LABELS: Record<string, string> = {
  LegalCaseNFT: "Case NFTs",
  LegalCaseAccount: "ERC-6551 Impl",
  AuditAnchor: "Audit Anchor",
  DocumentRegistry: "Doc Registry",
  LegalNameRegistry: ".law / .legal",
  ERC6551Registry: "TBA Registry",
};

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  anchor: { label: "Audit Anchored", color: "text-blue-400" },
  document_hash: { label: "Document Registered", color: "text-emerald-400" },
  nft_mint: { label: "Case NFT Minted", color: "text-[var(--gold)]" },
  nft_transfer: { label: "NFT Transferred", color: "text-purple-400" },
  vault_created: { label: "Vault Created", color: "text-cyan-400" },
  namespace_registered: { label: "Namespace Registered", color: "text-pink-400" },
  escrow_deposit: { label: "Escrow Deposited", color: "text-orange-400" },
  escrow_release: { label: "Escrow Released", color: "text-lime-400" },
};

type Tab = "overview" | "events" | "contracts";

export default function ChainPage() {
  const [stats, setStats] = useState<ChainStats | null>(null);
  const [events, setEvents] = useState<ChainEvent[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockMeta, setBlockMeta] = useState<{ blockNumber?: number; gasPrice?: string } | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/chain/polygon/status");
      const json = await res.json();
      if (json.ok) {
        setStats(json.data);
        setBlockMeta(json.meta);
      } else {
        setError(json.error || "Failed to load chain status");
      }
    } catch {
      setError("Cannot reach Polygon RPC");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    setEventsLoading(true);
    try {
      const res = await fetch("/api/chain/polygon/events?limit=30&blocks=1000");
      const json = await res.json();
      if (json.ok) setEvents(json.data || []);
    } catch {
      // non-fatal
    } finally {
      setEventsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (tab === "events") fetchEvents();
  }, [tab, fetchEvents]);

  const explorerBase = stats
    ? POLYGON_NETWORKS[stats.network].explorer
    : "https://polygonscan.com";

  const connected = stats?.connected ?? false;

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* ΓöÇΓöÇ Cinematic Hero ΓöÇΓöÇ */}
        <section className="relative h-[45vh] min-h-[340px] overflow-hidden">
          <video
            src={`/media/videos/${VIDEO_GALLERY.find(v => v.id === "v7")?.file}`}
            muted
            autoPlay
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--midnight)] via-[rgba(8,11,22,0.5)] to-[rgba(8,11,22,0.7)]" />
          <div className="relative z-10 h-full flex flex-col justify-end px-8 pb-12 max-w-[1400px] mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-2 h-2 rounded-full bg-[var(--gold)] animate-pulse" />
              <span className="font-mono text-xs tracking-[0.3em] uppercase text-[var(--gold)]">Polygon Mainnet &middot; Chain 137</span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold leading-[0.95] mb-3">
              ON-CHAIN<br /><span className="text-[var(--gold)]">WORLD.</span>
            </h1>
            <p className="text-lg text-[var(--text-primary)] max-w-2xl leading-relaxed">
              Every legal matter, document, audit trail, and client identity anchored immutably on
              Polygon. Six deployed contracts. One sovereign legal record.
            </p>
          </div>
        </section>

        <div className="pt-8 pb-20 px-6 md:px-12 max-w-[1400px] mx-auto w-full">
        {/* ΓöÇΓöÇ Block Meta ΓöÇΓöÇ */}
        {blockMeta?.blockNumber && (
          <p className="text-xs font-mono text-[var(--text-muted)] mb-6">
            Block #{blockMeta.blockNumber.toLocaleString()} &middot;{" "}
            {blockMeta.gasPrice} Gwei
          </p>
        )}

        {/* ΓöÇΓöÇ Stats Grid ΓöÇΓöÇ */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className={`w-3 h-3 rounded-full ${
              loading
                ? "bg-[var(--gold)] animate-pulse"
                : connected
                ? "bg-[var(--success)] animate-pulse"
                : "bg-[var(--danger)]"
            }`}
          />
          <span className="font-mono text-xs tracking-widest uppercase text-[var(--text-muted)]">
            {loading ? "ConnectingΓÇª" : connected ? "Online" : "Offline"}
          </span>
        </div>
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
            {[
              { label: "Case NFTs", value: stats.totalCaseNFTs },
              { label: "Audit Anchors", value: stats.totalAnchors },
              { label: "Documents", value: stats.totalDocumentHashes },
              { label: "Namespaces", value: stats.totalNamespaces },
              { label: "Contracts", value: stats.contracts.filter((c) => c.deployed).length },
              { label: "Network", value: stats.network === "polygon-mainnet" ? "Mainnet" : "Amoy" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.12)] rounded-lg p-4 text-center"
              >
                <div className="font-mono text-2xl font-bold text-[var(--gold)]">
                  {typeof value === "number" ? value.toLocaleString() : value}
                </div>
                <div className="text-xs text-[var(--text-muted)] tracking-wider uppercase mt-1">
                  {label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ΓöÇΓöÇ Tabs ΓöÇΓöÇ */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-[rgba(201,168,76,0.1)] pb-4">
          {(["overview", "contracts", "events"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`font-mono text-sm tracking-wider px-4 py-2 rounded-sm border transition-colors capitalize ${
                tab === t
                  ? "bg-[var(--gold)] text-[var(--midnight)] border-[var(--gold)] font-semibold"
                  : "bg-transparent text-[var(--text-muted)] border-[rgba(201,168,76,0.2)] hover:text-[var(--gold)] hover:border-[var(--gold)]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ΓöÇΓöÇ Error ΓöÇΓöÇ */}
        {error && (
          <div className="bg-[rgba(204,68,68,0.08)] border border-[var(--danger)] rounded-lg p-6 mb-8">
            <p className="text-[var(--danger)] font-mono text-sm">{error}</p>
            <p className="text-[var(--text-muted)] text-xs mt-2">
              Check that POLYGON_RPC is reachable and contract addresses are set in .env
            </p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
            <span className="ml-4 text-[var(--text-muted)] font-mono text-sm">
              Reading PolygonΓÇª
            </span>
          </div>
        )}

        {/* ΓöÇΓöÇ OVERVIEW TAB ΓöÇΓöÇ */}
        {!loading && tab === "overview" && stats && (
          <div className="space-y-8">
            {/* Wallet Health */}
            <section>
              <h2 className="font-serif text-lg font-semibold text-[var(--gold)] mb-4">
                Issuer Wallets
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <WalletCard
                  label="Issuer"
                  address={stats.issuerAddress}
                  balance={stats.issuerBalance}
                  explorerBase={explorerBase}
                />
                <WalletCard
                  label="Deployer"
                  address={stats.deployerAddress}
                  balance={stats.deployerBalance}
                  explorerBase={explorerBase}
                />
              </div>
            </section>

            {/* Platform Quicklinks */}
            <section>
              <h2 className="font-serif text-lg font-semibold text-[var(--gold)] mb-4">
                Quick Actions
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <ActionCard
                  title="Mint .law Namespace"
                  description="Claim your on-chain legal identity on Polygon"
                  href="/mint"
                />
                <ActionCard
                  title="Browse Namespaces"
                  description="View registered .law and .legal identities"
                  href={`${explorerBase}/token/${
                    stats.contracts.find((c) => c.name === "LegalNameRegistry")?.address || ""
                  }`}
                  external
                />
                <ActionCard
                  title="View Anchors"
                  description="Verify audit trail on PolygonScan"
                  href={`${explorerBase}/address/${
                    stats.contracts.find((c) => c.name === "AuditAnchor")?.address || ""
                  }`}
                  external
                />
              </div>
            </section>
          </div>
        )}

        {/* ΓöÇΓöÇ CONTRACTS TAB ΓöÇΓöÇ */}
        {!loading && tab === "contracts" && stats && (
          <div className="space-y-3">
            {stats.contracts.map((contract) => (
              <div
                key={contract.name}
                className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      contract.deployed ? "bg-[var(--success)]" : "bg-[var(--danger)]"
                    }`}
                  />
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">{contract.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {CONTRACT_LABELS[contract.name] || ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <code className="font-mono text-xs text-[var(--text-muted)] hidden md:block">
                    {contract.address
                      ? `${contract.address.slice(0, 8)}ΓÇª${contract.address.slice(-6)}`
                      : "Not set"}
                  </code>
                  <span
                    className={`text-xs font-mono tracking-wider uppercase ${
                      contract.deployed ? "text-[var(--success)]" : "text-[var(--danger)]"
                    }`}
                  >
                    {contract.deployed ? "Deployed" : "Not found"}
                  </span>
                  {contract.address && (
                    <a
                      href={`${explorerBase}/address/${contract.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-[var(--gold)] hover:underline"
                    >
                      PolygonScan Γåù
                    </a>
                  )}
                </div>
              </div>
            ))}
            <p className="text-xs text-[var(--text-muted)] font-mono mt-4">
              All contracts deployed on Polygon mainnet (chain 137) &middot; 2026-04-10
            </p>
          </div>
        )}

        {/* ΓöÇΓöÇ EVENTS TAB ΓöÇΓöÇ */}
        {!loading && tab === "events" && (
          <div>
            {eventsLoading && (
              <div className="flex items-center gap-3 py-8">
                <div className="w-5 h-5 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
                <span className="text-[var(--text-muted)] font-mono text-sm">
                  Scanning recent blocksΓÇª
                </span>
              </div>
            )}

            {!eventsLoading && events.length === 0 && (
              <div className="text-center py-16">
                <p className="text-[var(--text-muted)] text-lg">No on-chain events found in the last 1,000 blocks.</p>
                <p className="text-[var(--text-muted)] text-sm mt-2">
                  Events will appear here as the platform performs on-chain operations.
                </p>
              </div>
            )}

            {!eventsLoading && events.length > 0 && (
              <div className="space-y-2">
                {events.map((event) => {
                  const meta = EVENT_LABELS[event.type] || { label: event.type, color: "text-[var(--text-muted)]" };
                  return (
                    <div
                      key={event.id}
                      className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.07)] rounded-lg px-5 py-4 flex items-start justify-between gap-6"
                    >
                      <div className="flex items-start gap-4">
                        <span className={`font-mono text-xs tracking-wider uppercase mt-0.5 shrink-0 ${meta.color}`}>
                          {meta.label}
                        </span>
                        <div className="space-y-1">
                          {Object.entries(event.details).map(([k, v]) => (
                            <p key={k} className="text-xs font-mono text-[var(--text-muted)]">
                              <span className="text-[var(--text-primary)]">{k}:</span> {v}
                            </p>
                          ))}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-mono text-[var(--text-muted)]">
                          #{event.blockNumber.toLocaleString()}
                        </p>
                        <a
                          href={`${explorerBase}/tx/${event.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono text-[var(--gold)] hover:underline"
                        >
                          {event.txHash.slice(0, 10)}ΓÇª Γåù
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ΓöÇΓöÇ Footer Info ΓöÇΓöÇ */}
        {!loading && stats && (
          <>
            {/* ΓöÇΓöÇ Visual Strip ΓöÇΓöÇ */}
            <div className="grid grid-cols-3 gap-3 mt-12 mb-8">
              {IMAGE_GALLERY.filter(i => i.category === "tech").slice(0, 3).map((img) => (
                <div key={img.id} className="relative aspect-[16/7] overflow-hidden rounded-lg border border-[rgba(201,168,76,0.08)]">
                  <Image src={img.file} alt={img.title} fill className="object-cover opacity-60 hover:opacity-90 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--midnight)] via-transparent to-transparent" />
                </div>
              ))}
            </div>

            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6">
            <p className="text-xs font-mono text-[var(--text-muted)] leading-relaxed">
              <span className="text-[var(--gold)]">CHAIN ID 137</span> &middot; All contract
              interactions are recorded on Polygon and publicly verifiable. Issuer wallet{" "}
              {stats.issuerAddress
                ? `${stats.issuerAddress.slice(0, 8)}ΓÇª${stats.issuerAddress.slice(-6)}`
                : "not set"}{" "}
              pays gas for platform operations.{" "}
              <a
                href={`${explorerBase}/address/${stats.issuerAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--gold)] hover:underline"
              >
                View on PolygonScan Γåù
              </a>
            </p>
          </div>
          </>
        )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function WalletCard({
  label,
  address,
  balance,
  explorerBase,
}: {
  label: string;
  address: string;
  balance: string;
  explorerBase: string;
}) {
  const bal = parseFloat(balance || "0");
  const low = bal < 0.5;
  return (
    <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-5">
      <div className="flex justify-between items-start mb-3">
        <p className="font-serif font-semibold text-[var(--text-primary)]">{label}</p>
        <span
          className={`text-xs font-mono tracking-wider uppercase ${
            low ? "text-[var(--danger)]" : "text-[var(--success)]"
          }`}
        >
          {low ? "Low MATIC" : "Funded"}
        </span>
      </div>
      <p className="font-mono text-xl font-bold text-[var(--gold)] mb-1">
        {bal.toFixed(4)} <span className="text-sm text-[var(--text-muted)]">POL</span>
      </p>
      {address ? (
        <a
          href={`${explorerBase}/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors break-all"
        >
          {address}
        </a>
      ) : (
        <p className="font-mono text-xs text-[var(--danger)]">Address not configured</p>
      )}
    </div>
  );
}

function ActionCard({
  title,
  description,
  href,
  external = false,
}: {
  title: string;
  description: string;
  href: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="block bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-5 hover:border-[var(--gold)] transition-colors group"
    >
      <h3 className="font-serif font-semibold text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors mb-1">
        {title} {external && <span className="text-[var(--gold)]">Γåù</span>}
      </h3>
      <p className="text-sm text-[var(--text-muted)]">{description}</p>
    </a>
  );
}