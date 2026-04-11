"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { LegalNameRegistry_ABI } from "@/lib/polygon/abis";

type EthereumProvider = ethers.Eip1193Provider & {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

const REGISTRY_ADDRESS   = process.env.NEXT_PUBLIC_LEGAL_NAME_REGISTRY_ADDRESS ?? "";
const POLYGON_CHAIN_ID   = 137;
const POLYGON_CHAIN_HEX  = "0x89";

const TLD_OPTIONS = ["law", "legal"] as const;
type TLD = typeof TLD_OPTIONS[number];

const NAME_REGEX = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$|^[a-z0-9]{3}$/;

type TxStatus = "idle" | "signing" | "pending" | "confirmed" | "error";

interface OwnedName {
  tokenId: string;
  fullName?: string;
  uri: string;
}

function BadgePill({ children, color }: { children: React.ReactNode; color: "gold" | "green" | "red" | "orange" | "muted" }) {
  const cls = {
    gold:   "bg-[var(--navy)] text-[var(--gold)] border border-[rgba(201,168,76,0.4)]",
    green:  "bg-green-900/30 text-green-400 border border-green-800/30",
    red:    "bg-red-900/30 text-red-400 border border-red-800/30",
    orange: "bg-orange-900/30 text-orange-400 border border-orange-800/30",
    muted:  "bg-[var(--navy)] text-[var(--text-muted)] border border-white/5",
  }[color];
  return <span className={`text-xs font-mono px-2 py-0.5 rounded ${cls}`}>{children}</span>;
}

export default function MintNamespacePage() {
  const [wallet, setWallet]           = useState<string>("");
  const [provider, setProvider]       = useState<ethers.BrowserProvider | null>(null);
  const [nameInput, setNameInput]     = useState("");
  const [tld, setTld]                 = useState<TLD>("law");
  const [checking, setChecking]       = useState(false);
  const [available, setAvailable]     = useState<boolean | null>(null);
  const [checkError, setCheckError]   = useState("");
  const [txStatus, setTxStatus]       = useState<TxStatus>("idle");
  const [txHash, setTxHash]           = useState("");
  const [txError, setTxError]         = useState("");
  const [ownedNames, setOwnedNames]   = useState<OwnedName[]>([]);
  const [loadingOwned, setLoadingOwned] = useState(false);
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [contractDeployed, setContractDeployed] = useState(!!REGISTRY_ADDRESS);

  const normName = nameInput.trim().toLowerCase();
  const fullName = normName ? `${normName}.${tld}` : "";
  const nameValid = normName.length >= 3 && NAME_REGEX.test(normName);

  // Wallet connect
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected. Please install MetaMask to mint namespace NFTs.");
      return;
    }
    const eth = window.ethereum as EthereumProvider;
    try {
      const prov = new ethers.BrowserProvider(eth);
      const accounts = await eth.request({ method: "eth_requestAccounts" }) as string[];
      if (!accounts.length) return;

      const network = await prov.getNetwork();
      if (Number(network.chainId) !== POLYGON_CHAIN_ID) {
        setWrongNetwork(true);
        try {
          await eth.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: POLYGON_CHAIN_HEX }],
          });
          setWrongNetwork(false);
        } catch {
          // Ask to add network
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId:   POLYGON_CHAIN_HEX,
              chainName: "Polygon Mainnet",
              nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
              rpcUrls:        ["https://polygon-bor-rpc.publicnode.com"],
              blockExplorerUrls: ["https://polygonscan.com"],
            }],
          });
          setWrongNetwork(false);
        }
      }

      setProvider(prov);
      setWallet(accounts[0]);
    } catch (e: unknown) {
      console.error("Wallet connect error", e);
    }
  };

  const disconnectWallet = () => {
    setWallet("");
    setProvider(null);
    setAvailable(null);
    setOwnedNames([]);
  };

  // Load owned names
  const loadOwnedNames = useCallback(async () => {
    if (!wallet) return;
    setLoadingOwned(true);
    try {
      const res = await fetch(`/api/chain/polygon/namespace?wallet=${wallet}`);
      if (res.ok) {
        const data = await res.json();
        setOwnedNames(data.names ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoadingOwned(false);
    }
  }, [wallet]);

  useEffect(() => {
    if (wallet) loadOwnedNames();
  }, [wallet, loadOwnedNames]);

  // Check availability
  const checkAvailability = async () => {
    if (!nameValid) return;
    setChecking(true);
    setAvailable(null);
    setCheckError("");
    try {
      const res = await fetch(`/api/chain/polygon/namespace?name=${encodeURIComponent(normName)}&tld=${tld}`);
      const data = await res.json();
      if (data.error) { setCheckError(data.error); return; }
      setAvailable(data.available);
    } catch (e: unknown) {
      setCheckError(e instanceof Error ? e.message : "Network error");
    } finally {
      setChecking(false);
    }
  };

  // Mint
  const mintName = async () => {
    if (!provider || !wallet || !nameValid || !contractDeployed) return;
    setTxStatus("signing");
    setTxError("");
    setTxHash("");
    try {
      const signer   = await provider.getSigner();
      const registry = new ethers.Contract(REGISTRY_ADDRESS, LegalNameRegistry_ABI, signer);

      // Build minimal metadata URI (base64 JSON inline)
      const meta = {
        name:        fullName,
        description: `UNYKORN Legal Namespace — ${fullName}`,
        image:       "",
        attributes: [
          { trait_type: "TLD",   value: tld },
          { trait_type: "Name",  value: normName },
          { trait_type: "Owner", value: wallet },
        ],
      };
      const uri = `data:application/json;base64,${btoa(JSON.stringify(meta))}`;

      const tx = await registry.registerName(normName, tld, uri, wallet, { gasLimit: BigInt(300000) });
      setTxStatus("pending");
      setTxHash(tx.hash);
      await tx.wait();
      setTxStatus("confirmed");
      setAvailable(false);
      await loadOwnedNames();
    } catch (e: unknown) {
      setTxStatus("error");
      const msg = (e as { reason?: string; message?: string })?.reason ?? (e as Error)?.message ?? String(e);
      setTxError(msg);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[104px] pb-16 px-8">
        <div className="max-w-[900px] mx-auto">

          {/* Header */}
          <div className="mb-12">
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">POLYGON · LEGAL NAMESPACE</p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              CLAIM YOUR<br /><span className="text-[var(--gold)]">.LAW NAME.</span>
            </h1>
            <p className="text-lg text-[var(--text-muted)] max-w-xl">
              Register a sovereign <strong className="text-white">.law</strong> or <strong className="text-white">.legal</strong> namespace on Polygon Mainnet.
              Each name is an ERC-721 NFT — own your legal identity on-chain, forever.
            </p>
          </div>

          {/* Contract down notice */}
          {!contractDeployed && (
            <div className="mb-8 bg-orange-950/30 border border-orange-800/30 rounded-lg p-6">
              <p className="text-orange-400 font-mono text-sm mb-1">⚠ Contracts Not Yet Deployed</p>
              <p className="text-sm text-[var(--text-muted)]">
                The LegalNameRegistry contract is not yet deployed to Polygon Amoy.
                Minting will be available once the deployer wallet is funded and contracts are deployed.
              </p>
            </div>
          )}

          {/* Wallet Section */}
          <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.12)] rounded-lg p-6 mb-8">
            {!wallet ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-serif text-base font-bold mb-1">Connect Wallet</p>
                  <p className="text-sm text-[var(--text-muted)]">MetaMask required · Polygon Mainnet</p>
                </div>
                <button
                  onClick={connectWallet}
                  className="bg-[var(--gold)] text-[var(--midnight)] text-sm font-bold font-mono px-6 py-2.5 rounded hover:brightness-110 transition-all shrink-0"
                >
                  Connect MetaMask
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-mono text-[var(--gold)] uppercase tracking-wider mb-1">Connected</p>
                  <p className="text-sm font-mono text-white break-all">{wallet}</p>
                </div>
                <div className="flex items-center gap-3">
                  <BadgePill color="green">Polygon Mainnet</BadgePill>
                  <button
                    onClick={disconnectWallet}
                    className="text-xs font-mono text-[var(--text-muted)] hover:text-red-400 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            )}
            {wrongNetwork && (
              <p className="text-orange-400 text-xs font-mono mt-3">
                ⚠ Wrong network — please switch to Polygon Mainnet (chain ID 137) in MetaMask.
              </p>
            )}
          </div>

          {/* Name Search */}
          <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.12)] rounded-lg p-8 mb-8">
            <h2 className="font-serif text-xs tracking-[0.3em] uppercase text-[var(--gold)] mb-6">SEARCH AVAILABILITY</h2>

            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => {
                    setNameInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                    setAvailable(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && nameValid && checkAvailability()}
                  placeholder="yourlawfirm"
                  maxLength={63}
                  className="w-full bg-[var(--midnight)] border border-[rgba(201,168,76,0.15)] rounded px-4 py-3 text-sm font-mono text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)] transition-colors"
                />
              </div>
              <div className="flex border border-[rgba(201,168,76,0.15)] rounded overflow-hidden">
                {TLD_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTld(t); setAvailable(null); }}
                    className={`px-4 py-3 text-sm font-mono transition-colors ${
                      tld === t
                        ? "bg-[var(--gold)] text-[var(--midnight)] font-bold"
                        : "bg-[var(--midnight)] text-[var(--text-muted)] hover:text-white"
                    }`}
                  >
                    .{t}
                  </button>
                ))}
              </div>
              <button
                onClick={checkAvailability}
                disabled={!nameValid || checking}
                className="px-6 py-3 bg-[var(--navy)] border border-[rgba(201,168,76,0.3)] text-[var(--gold)] text-sm font-mono rounded hover:border-[var(--gold)] transition-all disabled:opacity-40"
              >
                {checking ? "…" : "Check"}
              </button>
            </div>

            {/* Preview */}
            {fullName && (
              <div className="flex items-center gap-3 mb-4">
                <span className="font-serif text-xl font-bold text-white">{fullName}</span>
                {available === true  && <BadgePill color="green">✓ Available</BadgePill>}
                {available === false && <BadgePill color="red">✗ Taken</BadgePill>}
                {available === null && !checking && nameValid && (
                  <BadgePill color="muted">Not checked</BadgePill>
                )}
              </div>
            )}

            {!nameValid && normName.length > 0 && (
              <p className="text-xs font-mono text-orange-400 mb-2">
                Names must be 3–63 characters, lowercase alphanumeric and hyphens, no leading/trailing hyphens.
              </p>
            )}

            {checkError && (
              <p className="text-xs font-mono text-red-400 mb-2">{checkError}</p>
            )}

            {/* Mint Button */}
            {available === true && wallet && contractDeployed && (
              <div className="mt-6 border-t border-[rgba(201,168,76,0.08)] pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-serif text-base font-bold mb-0.5">Mint <span className="text-[var(--gold)]">{fullName}</span></p>
                    <p className="text-xs text-[var(--text-muted)]">Price: Free · Gas: ~0.001 POL estimated</p>
                  </div>
                  <button
                    onClick={mintName}
                    disabled={txStatus === "signing" || txStatus === "pending"}
                    className="bg-[var(--gold)] text-[var(--midnight)] text-sm font-bold font-mono px-8 py-3 rounded hover:brightness-110 transition-all disabled:opacity-60 shrink-0"
                  >
                    {txStatus === "signing" ? "Sign in MetaMask…" : txStatus === "pending" ? "Confirming…" : "Mint NFT"}
                  </button>
                </div>

                {txStatus === "pending" && txHash && (
                  <div className="mt-4 bg-[var(--midnight)] rounded p-4 text-xs font-mono">
                    <p className="text-yellow-400 mb-1">Transaction submitted…</p>
                    <a
                      href={`https://polygonscan.com/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--gold)] hover:underline break-all"
                    >
                      {txHash} ↗
                    </a>
                  </div>
                )}

                {txStatus === "confirmed" && (
                  <div className="mt-4 bg-green-950/30 border border-green-800/30 rounded p-4 text-xs font-mono text-green-400">
                    ✓ {fullName} minted successfully!{" "}
                    <a
                      href={`https://polygonscan.com/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      View tx ↗
                    </a>
                  </div>
                )}

                {txStatus === "error" && (
                  <div className="mt-4 bg-red-950/30 border border-red-800/30 rounded p-4 text-xs font-mono text-red-400">
                    ✗ {txError}
                  </div>
                )}
              </div>
            )}

            {available === true && !wallet && (
              <p className="mt-4 text-sm text-[var(--text-muted)]">
                Connect your wallet above to mint this name.
              </p>
            )}
          </div>

          {/* Your Names */}
          {wallet && (
            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.12)] rounded-lg p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xs tracking-[0.3em] uppercase text-[var(--gold)]">YOUR NAMES</h2>
                <button
                  onClick={loadOwnedNames}
                  className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors"
                >
                  ↻ Refresh
                </button>
              </div>

              {loadingOwned ? (
                <p className="text-sm text-[var(--text-muted)] font-mono animate-pulse">Loading…</p>
              ) : ownedNames.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">No namespace NFTs found for this wallet.</p>
              ) : (
                <div className="space-y-3">
                  {ownedNames.map((n) => (
                    <div
                      key={n.tokenId}
                      className="flex items-center justify-between bg-[var(--midnight)] rounded p-4"
                    >
                      <div>
                        <p className="font-mono text-sm text-white">{n.fullName ?? `Token #${n.tokenId}`}</p>
                        <p className="text-xs font-mono text-[var(--text-muted)] mt-0.5">ID: {n.tokenId}</p>
                      </div>
                      <BadgePill color="gold">Owned</BadgePill>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Info Section */}
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            {[
              {
                icon: "⛓️",
                title: "On-Chain Ownership",
                body: "Each .law / .legal name is an ERC-721 NFT on Polygon. Transfer, sell, or hold forever — no centralized registrar.",
              },
              {
                icon: "🔗",
                title: "ERC-6551 Vaults",
                body: "Every accepted case paired with a namespace gets a token-bound vault (ERC-6551) for escrow, evidence, and document anchoring.",
              },
              {
                icon: "🔒",
                title: "Immutable Audit Trail",
                body: "All case state changes, document registrations, and advocacy actions are anchored on-chain via AuditAnchor — tamper-proof forever.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.08)] rounded-lg p-6"
              >
                <div className="text-2xl mb-3">{card.icon}</div>
                <h3 className="font-serif text-sm font-bold mb-2">{card.title}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
