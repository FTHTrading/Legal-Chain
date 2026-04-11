"use client";

/**
 * /mint ΓÇö .law / .legal Namespace Minting Portal
 *
 * Client-side MetaMask + ethers.js BrowserProvider flow:
 * 1. Connect wallet
 * 2. Switch to Polygon (137)
 * 3. Check name availability via API
 * 4. Call LegalNameRegistry.registerName() with MATIC fee
 */

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { LegalNameRegistry_ABI, LegalCaseNFT_ABI, AuditAnchor_ABI, DocumentRegistry_ABI } from "@/lib/polygon/abis";
import { POLYGON_NETWORKS } from "@/lib/polygon/types";
import { IMAGE_GALLERY } from "@/lib/data/seed";

const MAINNET = POLYGON_NETWORKS["polygon-mainnet"];
const REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_LEGAL_NAME_REGISTRY_ADDRESS || "";
const CASE_NFT_ADDRESS = process.env.NEXT_PUBLIC_LEGAL_CASE_NFT_ADDRESS || "";
const AUDIT_ANCHOR_ADDRESS = process.env.NEXT_PUBLIC_AUDIT_ANCHOR_ADDRESS || "";
const DOCUMENT_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_DOCUMENT_REGISTRY_ADDRESS || "";

type MintTab = "namespace" | "case-nft" | "document" | "anchor";

type AvailabilityResult = {
  available: boolean;
  name: string;
  tld: string;
  registrationFee: string;
  owner?: string;
  expiresAt?: number;
};

type OwnedName = {
  tokenId: number;
  name: string;
  tld: string;
};

export default function MintPage() {
  // Wallet state
  const [account, setAccount] = useState<string | null>(null);
  const [chainOk, setChainOk] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  // Name input
  const [name, setName] = useState("");
  const [tld, setTld] = useState<"law" | "legal">("law");
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);

  // Registration
  const [registering, setRegistering] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [regError, setRegError] = useState<string | null>(null);

  // Owned names
  const [ownedNames, setOwnedNames] = useState<OwnedName[]>([]);
  const [ownedLoading, setOwnedLoading] = useState(false);

  // Mint tab
  const [mintTab, setMintTab] = useState<MintTab>("namespace");

  // Case NFT minting
  const [caseRef, setCaseRef] = useState("");
  const [caseTitle, setCaseTitle] = useState("");
  const [caseMinting, setCaseMinting] = useState(false);
  const [caseTxHash, setCaseTxHash] = useState<string | null>(null);
  const [caseError, setCaseError] = useState<string | null>(null);

  // Document registration
  const [docHash, setDocHash] = useState("");
  const [docCaseRef, setDocCaseRef] = useState("");
  const [docIpfsCid, setDocIpfsCid] = useState("");
  const [docMinting, setDocMinting] = useState(false);
  const [docTxHash, setDocTxHash] = useState<string | null>(null);
  const [docError, setDocError] = useState<string | null>(null);

  // Audit anchor
  const [anchorBatchId, setAnchorBatchId] = useState("");
  const [anchorRootHash, setAnchorRootHash] = useState("");
  const [anchorEntryCount, setAnchorEntryCount] = useState("");
  const [anchorMinting, setAnchorMinting] = useState(false);
  const [anchorTxHash, setAnchorTxHash] = useState<string | null>(null);
  const [anchorError, setAnchorError] = useState<string | null>(null);

  // ΓöÇΓöÇ Wallet ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

  const checkChain = useCallback(async () => {
    if (!window.ethereum) return;
    const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
    setChainOk(parseInt(chainIdHex as string, 16) === 137);
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setWalletError("MetaMask not detected. Please install the MetaMask extension.");
      return;
    }
    setWalletLoading(true);
    setWalletError(null);
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[];
      setAccount(accounts[0]);
      await checkChain();
    } catch {
      setWalletError("Wallet connection declined.");
    } finally {
      setWalletLoading(false);
    }
  }, [checkChain]);

  const switchToPolygon = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x89" }],
      });
      setChainOk(true);
    } catch (err: unknown) {
      const code = (err as { code?: number }).code;
      if (code === 4902) {
        // Chain not added
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x89",
              chainName: "Polygon Mainnet",
              nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
              rpcUrls: [MAINNET.rpcUrl],
              blockExplorerUrls: [MAINNET.explorer],
            },
          ],
        });
        setChainOk(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;
    checkChain();
    const handleChainChange = () => checkChain();
    const handleAccountChange = (accounts: unknown) =>
      setAccount(((accounts as string[])[0]) || null);
    window.ethereum.on("chainChanged", handleChainChange);
    window.ethereum.on("accountsChanged", handleAccountChange);
    return () => {
      window.ethereum?.removeListener("chainChanged", handleChainChange);
      window.ethereum?.removeListener("accountsChanged", handleAccountChange);
    };
  }, [checkChain]);

  // ΓöÇΓöÇ Availability check ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

  const checkAvailability = useCallback(async () => {
    if (!name.trim()) return;
    setChecking(true);
    setAvailability(null);
    setCheckError(null);
    setTxHash(null);
    setRegError(null);
    try {
      const res = await fetch(
        `/api/chain/polygon/namespace?name=${encodeURIComponent(name.trim().toLowerCase())}&tld=${tld}`
      );
      const json = await res.json();
      if (json.ok) {
        setAvailability(json.data);
      } else {
        setCheckError(json.error || "Availability check failed");
      }
    } catch {
      setCheckError("Network error ΓÇö cannot reach API");
    } finally {
      setChecking(false);
    }
  }, [name, tld]);

  // ΓöÇΓöÇ Register ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

  const registerName = useCallback(async () => {
    if (!account || !chainOk || !availability?.available || !REGISTRY_ADDRESS) return;
    setRegistering(true);
    setRegError(null);
    setTxHash(null);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(REGISTRY_ADDRESS, LegalNameRegistry_ABI, signer);

      const cleanName = name.trim().toLowerCase();
      const metadata = JSON.stringify({
        name: `${cleanName}.${tld}`,
        description: `UNYKORN LAW legal namespace ΓÇö ${cleanName}.${tld}`,
        owner: account,
        registeredAt: new Date().toISOString(),
        platform: "UNYKORN LAW",
      });
      const uri = `data:application/json;base64,${btoa(metadata)}`;
      const resolution = account;

      const feeWei = ethers.parseEther(availability.registrationFee);
      const tx = await contract.registerName(cleanName, tld, uri, resolution, {
        value: feeWei,
      });

      setTxHash(tx.hash);
      await tx.wait();
      setAvailability(null);
      setName("");
      loadOwnedNames(account);
    } catch (err: unknown) {
      const msg =
        (err as { reason?: string; shortMessage?: string; message?: string }).reason ||
        (err as { shortMessage?: string }).shortMessage ||
        (err as { message?: string }).message ||
        "Transaction failed";
      setRegError(typeof msg === "string" ? msg : "Transaction failed");
    } finally {
      setRegistering(false);
    }
  }, [account, chainOk, availability, name, tld]);

  // ΓöÇΓöÇ Owned names ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

  const loadOwnedNames = useCallback(async (addr: string) => {
    if (!REGISTRY_ADDRESS || !addr) return;
    setOwnedLoading(true);
    try {
      const provider = new ethers.JsonRpcProvider(MAINNET.rpcUrl);
      const contract = new ethers.Contract(REGISTRY_ADDRESS, LegalNameRegistry_ABI, provider);
      const balance: bigint = await contract.balanceOf(addr);
      const count = Number(balance);
      if (count === 0) {
        setOwnedNames([]);
        return;
      }
      const names: OwnedName[] = [];
      for (let i = 0; i < Math.min(count, 20); i++) {
        try {
          const tokenId: bigint = await contract.tokenOfOwnerByIndex(addr, i);
          const tokenURI: string = await contract.tokenURI(tokenId);
          // Decode inline URI
          let nameStr = `#${tokenId}`;
          let tldStr = "law";
          if (tokenURI.startsWith("data:application/json;base64,")) {
            const decoded = atob(tokenURI.slice("data:application/json;base64,".length));
            const meta = JSON.parse(decoded);
            const parts = (meta.name || "").split(".");
            tldStr = parts.pop() || "law";
            nameStr = parts.join(".");
          }
          names.push({ tokenId: Number(tokenId), name: nameStr, tld: tldStr });
        } catch {
          // skip this token
        }
      }
      setOwnedNames(names);
    } catch {
      // non-fatal
    } finally {
      setOwnedLoading(false);
    }
  }, []);

  useEffect(() => {
    if (account && chainOk) loadOwnedNames(account);
  }, [account, chainOk, loadOwnedNames]);

  // ΓöÇΓöÇ Helpers ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

  // ΓöÇΓöÇ Mint Case NFT ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

  const mintCaseNFT = useCallback(async () => {
    if (!account || !chainOk || !CASE_NFT_ADDRESS || !caseRef.trim() || !caseTitle.trim()) return;
    setCaseMinting(true);
    setCaseError(null);
    setCaseTxHash(null);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CASE_NFT_ADDRESS, LegalCaseNFT_ABI, signer);
      const metadata = JSON.stringify({
        name: caseTitle.trim(),
        description: `Legal Case NFT ΓÇö ${caseRef.trim()}`,
        caseRef: caseRef.trim(),
        minter: account,
        mintedAt: new Date().toISOString(),
        platform: "UNYKORN LAW",
      });
      const uri = `data:application/json;base64,${btoa(metadata)}`;
      const tx = await contract.mintCase(account, caseRef.trim(), uri);
      setCaseTxHash(tx.hash);
      await tx.wait();
      setCaseRef("");
      setCaseTitle("");
    } catch (err: unknown) {
      const msg = (err as { reason?: string; shortMessage?: string; message?: string }).reason ||
        (err as { shortMessage?: string }).shortMessage ||
        (err as { message?: string }).message || "Mint failed";
      setCaseError(typeof msg === "string" ? msg : "Mint failed");
    } finally {
      setCaseMinting(false);
    }
  }, [account, chainOk, caseRef, caseTitle]);

  // ΓöÇΓöÇ Register Document ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

  const registerDocument = useCallback(async () => {
    if (!account || !chainOk || !DOCUMENT_REGISTRY_ADDRESS || !docHash.trim()) return;
    setDocMinting(true);
    setDocError(null);
    setDocTxHash(null);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(DOCUMENT_REGISTRY_ADDRESS, DocumentRegistry_ABI, signer);
      const hashBytes = ethers.getBytes(docHash.trim().startsWith("0x") ? docHash.trim() : `0x${docHash.trim()}`);
      const tx = await contract.registerDocument(
        hashBytes,
        docCaseRef.trim() || "unassigned",
        docIpfsCid.trim() || ""
      );
      setDocTxHash(tx.hash);
      await tx.wait();
      setDocHash("");
      setDocCaseRef("");
      setDocIpfsCid("");
    } catch (err: unknown) {
      const msg = (err as { reason?: string; shortMessage?: string; message?: string }).reason ||
        (err as { shortMessage?: string }).shortMessage ||
        (err as { message?: string }).message || "Registration failed";
      setDocError(typeof msg === "string" ? msg : "Registration failed");
    } finally {
      setDocMinting(false);
    }
  }, [account, chainOk, docHash, docCaseRef, docIpfsCid]);

  // ΓöÇΓöÇ Anchor Audit Batch ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

  const anchorAuditBatch = useCallback(async () => {
    if (!account || !chainOk || !AUDIT_ANCHOR_ADDRESS || !anchorBatchId.trim() || !anchorRootHash.trim()) return;
    setAnchorMinting(true);
    setAnchorError(null);
    setAnchorTxHash(null);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(AUDIT_ANCHOR_ADDRESS, AuditAnchor_ABI, signer);
      const rootBytes = ethers.getBytes(anchorRootHash.trim().startsWith("0x") ? anchorRootHash.trim() : `0x${anchorRootHash.trim()}`);
      const count = parseInt(anchorEntryCount) || 1;
      const tx = await contract.anchorBatch(anchorBatchId.trim(), rootBytes, count);
      setAnchorTxHash(tx.hash);
      await tx.wait();
      setAnchorBatchId("");
      setAnchorRootHash("");
      setAnchorEntryCount("");
    } catch (err: unknown) {
      const msg = (err as { reason?: string; shortMessage?: string; message?: string }).reason ||
        (err as { shortMessage?: string }).shortMessage ||
        (err as { message?: string }).message || "Anchor failed";
      setAnchorError(typeof msg === "string" ? msg : "Anchor failed");
    } finally {
      setAnchorMinting(false);
    }
  }, [account, chainOk, anchorBatchId, anchorRootHash, anchorEntryCount]);

  const shortAddr = (addr: string) => `${addr.slice(0, 6)}ΓÇª${addr.slice(-4)}`;
  const feeDisplay = availability?.registrationFee ? `${availability.registrationFee} POL` : null;

  const nameValid = /^[a-z0-9-]{3,32}$/.test(name.trim().toLowerCase());

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* ΓöÇΓöÇ Hero ΓöÇΓöÇ */}
        <section className="relative h-[35vh] min-h-[280px] overflow-hidden">
          <Image
            src="/media/images/legal-helix-2.webp"
            alt="Legal Chain Technology"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--midnight)] via-[rgba(8,11,22,0.6)] to-[rgba(8,11,22,0.7)]" />
          <div className="relative z-10 h-full flex flex-col justify-end px-8 pb-10 max-w-[900px] mx-auto">
            <p className="font-mono text-xs tracking-widest uppercase text-[var(--gold)] mb-2">
              UNYKORN LAW &middot; Polygon Mainnet
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-[var(--text-primary)] tracking-wide mb-2">
              Polygon{" "}
              <span className="text-[var(--gold)]">Mint Portal</span>
            </h1>
            <p className="text-[var(--text-muted)] text-lg max-w-xl">
              Mint sovereign on-chain legal assets ΓÇö namespaces, case NFTs, audit anchors, and document hashes ΓÇö all on Polygon.
            </p>
          </div>
        </section>

        <div className="pt-6 pb-20 px-6 md:px-12 max-w-[900px] mx-auto w-full">

        {/* ΓöÇΓöÇ Wallet Section ΓöÇΓöÇ */}
        <section className="mb-10">
          {!account ? (
            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.12)] rounded-lg p-8 text-center">
              <p className="text-[var(--text-muted)] mb-5">
                Connect your MetaMask wallet to mint a namespace on Polygon.
              </p>
              <button
                onClick={connectWallet}
                disabled={walletLoading}
                className="btn-primary font-mono tracking-wider disabled:opacity-50"
              >
                {walletLoading ? "ConnectingΓÇª" : "Connect Wallet"}
              </button>
              {walletError && (
                <p className="text-[var(--danger)] text-sm mt-3 font-mono">{walletError}</p>
              )}
            </div>
          ) : !chainOk ? (
            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.12)] rounded-lg p-8 text-center">
              <p className="text-[var(--text-muted)] mb-2">
                Connected: <span className="font-mono text-[var(--gold)]">{shortAddr(account)}</span>
              </p>
              <p className="text-[var(--danger)] text-sm mb-5">
                Please switch to Polygon Mainnet (chain 137).
              </p>
              <button onClick={switchToPolygon} className="btn-primary font-mono tracking-wider">
                Switch to Polygon
              </button>
            </div>
          ) : (
            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.12)] rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--success)] animate-pulse" />
                <span className="font-mono text-sm text-[var(--text-primary)]">{shortAddr(account)}</span>
                <span className="font-mono text-xs text-[var(--success)] uppercase tracking-wider">
                  Polygon
                </span>
              </div>
              <a
                href={`${MAINNET.explorer}/address/${account}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-[var(--gold)] hover:underline"
              >
                View Γåù
              </a>
            </div>
          )}
        </section>

        {/* ΓöÇΓöÇ Mint Form ΓöÇΓöÇ */}
        {account && chainOk && (
          <section className="mb-10">
            {/* ΓöÇΓöÇ Mint Tabs ΓöÇΓöÇ */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-[rgba(201,168,76,0.1)] pb-4">
              {([
                { key: "namespace" as MintTab, label: ".law / .legal Name" },
                { key: "case-nft" as MintTab, label: "Case NFT" },
                { key: "document" as MintTab, label: "Document Hash" },
                { key: "anchor" as MintTab, label: "Audit Anchor" },
              ]).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setMintTab(t.key)}
                  className={`font-mono text-sm tracking-wider px-4 py-2 rounded-sm border transition-colors ${
                    mintTab === t.key
                      ? "bg-[var(--gold)] text-[var(--midnight)] border-[var(--gold)] font-semibold"
                      : "bg-transparent text-[var(--text-muted)] border-[rgba(201,168,76,0.2)] hover:text-[var(--gold)] hover:border-[var(--gold)]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ΓöÇΓöÇ NAMESPACE TAB ΓöÇΓöÇ */}
            {mintTab === "namespace" && (
            <>
            <h2 className="font-serif text-xl font-semibold text-[var(--gold)] mb-5">
              Register a Name
            </h2>

            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.12)] rounded-lg p-6">
              {/* Name input + TLD */}
              <div className="flex gap-3 mb-5">
                <div className="flex-1">
                  <label className="block font-mono text-xs tracking-wider uppercase text-[var(--text-muted)] mb-2">
                    Name (3ΓÇô32 chars, a-z 0-9 -)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                      setAvailability(null);
                      setTxHash(null);
                    }}
                    placeholder="marquis-holdings"
                    maxLength={32}
                    className="w-full bg-[var(--midnight)] border border-[rgba(201,168,76,0.2)] rounded px-4 py-3 font-mono text-[var(--text-primary)] text-base focus:outline-none focus:border-[var(--gold)] placeholder:text-[var(--text-muted)]"
                  />
                </div>
                <div className="shrink-0">
                  <label className="block font-mono text-xs tracking-wider uppercase text-[var(--text-muted)] mb-2">
                    TLD
                  </label>
                  <select
                    value={tld}
                    onChange={(e) => {
                      setTld(e.target.value as "law" | "legal");
                      setAvailability(null);
                    }}
                    className="bg-[var(--midnight)] border border-[rgba(201,168,76,0.2)] rounded px-4 py-3 font-mono text-[var(--text-primary)] text-base focus:outline-none focus:border-[var(--gold)] h-full"
                  >
                    <option value="law">.law</option>
                    <option value="legal">.legal</option>
                  </select>
                </div>
              </div>

              {/* Preview */}
              {name && (
                <div className="flex items-center gap-2 mb-5">
                  <span className="font-mono text-2xl font-bold text-[var(--gold)]">
                    {name.trim().toLowerCase()}
                  </span>
                  <span className="font-mono text-2xl font-bold text-[var(--text-muted)]">
                    .{tld}
                  </span>
                  {nameValid ? (
                    <span className="text-xs font-mono text-[var(--success)] ml-2 uppercase tracking-wider">
                      Valid
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-[var(--danger)] ml-2 uppercase tracking-wider">
                      Invalid
                    </span>
                  )}
                </div>
              )}

              {/* Check button */}
              <button
                onClick={checkAvailability}
                disabled={!nameValid || checking}
                className="btn-secondary font-mono text-sm tracking-wider disabled:opacity-50 mr-3"
              >
                {checking ? "CheckingΓÇª" : "Check Availability"}
              </button>

              {/* Check error */}
              {checkError && (
                <p className="text-[var(--danger)] text-sm font-mono mt-3">{checkError}</p>
              )}

              {/* Availability result */}
              {availability && (
                <div
                  className={`mt-5 rounded-lg p-4 border ${
                    availability.available
                      ? "bg-[rgba(76,201,76,0.06)] border-[rgba(76,201,76,0.2)]"
                      : "bg-[rgba(204,68,68,0.06)] border-[rgba(204,68,68,0.2)]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`font-mono text-sm font-semibold ${
                        availability.available
                          ? "text-[var(--success)]"
                          : "text-[var(--danger)]"
                      }`}
                    >
                      {availability.available ? "Available" : "Already Registered"}
                    </span>
                    {availability.available && feeDisplay && (
                      <span className="font-mono text-sm text-[var(--gold)]">
                        {feeDisplay} registration fee
                      </span>
                    )}
                  </div>

                  {!availability.available && availability.owner && (
                    <p className="text-xs font-mono text-[var(--text-muted)]">
                      Owner: {shortAddr(availability.owner)}
                      {availability.expiresAt && (
                        <> &middot; Expires: {new Date(availability.expiresAt * 1000).toLocaleDateString()}</>
                      )}
                    </p>
                  )}

                  {availability.available && (
                    <>
                      <p className="text-xs text-[var(--text-muted)] font-mono mb-4">
                        {`${availability.name.toLowerCase()}.${availability.tld}`} is unclaimed.
                        Register it now as an NFT on Polygon.
                      </p>
                      <button
                        onClick={registerName}
                        disabled={registering}
                        className="btn-primary font-mono text-sm tracking-wider disabled:opacity-50"
                      >
                        {registering ? "Sending transactionΓÇª" : `Mint .${tld} Name`}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Reg error */}
              {regError && (
                <div className="mt-4 bg-[rgba(204,68,68,0.08)] border border-[var(--danger)] rounded p-3">
                  <p className="text-[var(--danger)] text-sm font-mono">{regError}</p>
                </div>
              )}

              {/* Tx success */}
              {txHash && (
                <div className="mt-4 bg-[rgba(76,201,76,0.06)] border border-[rgba(76,201,76,0.2)] rounded-lg p-4">
                  <p className="font-mono text-sm font-semibold text-[var(--success)] mb-1">
                    Name registered!
                  </p>
                  <a
                    href={`${MAINNET.explorer}/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-[var(--gold)] hover:underline break-all"
                  >
                    {txHash} Γåù
                  </a>
                </div>
              )}
            </div>
            </>
            )}

            {/* ΓöÇΓöÇ CASE NFT TAB ΓöÇΓöÇ */}
            {mintTab === "case-nft" && (
            <>
            <h2 className="font-serif text-xl font-semibold text-[var(--gold)] mb-5">
              Mint Case NFT
            </h2>
            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.12)] rounded-lg p-6">
              <div className="grid gap-4 mb-5">
                <div>
                  <label className="block font-mono text-xs tracking-wider uppercase text-[var(--text-muted)] mb-2">
                    Case Reference ID *
                  </label>
                  <input
                    type="text"
                    value={caseRef}
                    onChange={(e) => setCaseRef(e.target.value)}
                    placeholder="UNY-CIV-2026-003"
                    className="w-full bg-[var(--midnight)] border border-[rgba(201,168,76,0.2)] rounded px-4 py-3 font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)] placeholder:text-[var(--text-muted)]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs tracking-wider uppercase text-[var(--text-muted)] mb-2">
                    Case Title *
                  </label>
                  <input
                    type="text"
                    value={caseTitle}
                    onChange={(e) => setCaseTitle(e.target.value)}
                    placeholder="Property Dispute ΓÇö Post-Closing Accounting"
                    className="w-full bg-[var(--midnight)] border border-[rgba(201,168,76,0.2)] rounded px-4 py-3 font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)] placeholder:text-[var(--text-muted)]"
                  />
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                Mints an ERC-721 Case NFT on Polygon. Metadata is stored on-chain as a base64 data URI. NFT is minted to your connected wallet.
              </p>
              <button
                onClick={mintCaseNFT}
                disabled={caseMinting || !caseRef.trim() || !caseTitle.trim()}
                className="btn-primary font-mono text-sm tracking-wider disabled:opacity-50"
              >
                {caseMinting ? "MintingΓÇª" : "Mint Case NFT"}
              </button>
              {caseError && (
                <div className="mt-4 bg-[rgba(204,68,68,0.08)] border border-[var(--danger)] rounded p-3">
                  <p className="text-[var(--danger)] text-sm font-mono">{caseError}</p>
                </div>
              )}
              {caseTxHash && (
                <div className="mt-4 bg-[rgba(76,201,76,0.06)] border border-[rgba(76,201,76,0.2)] rounded-lg p-4">
                  <p className="font-mono text-sm font-semibold text-[var(--success)] mb-1">Case NFT minted!</p>
                  <a href={`${MAINNET.explorer}/tx/${caseTxHash}`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-[var(--gold)] hover:underline break-all">
                    {caseTxHash} Γåù
                  </a>
                </div>
              )}
            </div>
            {/* Case NFT image accent */}
            <div className="relative h-32 mt-6 rounded-lg overflow-hidden border border-[rgba(201,168,76,0.06)]">
              <Image src="/media/images/courtroom-defense.webp" alt="Courtroom" fill className="object-cover opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--midnight)] via-transparent to-[var(--midnight)]" />
            </div>
            </>
            )}

            {/* ΓöÇΓöÇ DOCUMENT HASH TAB ΓöÇΓöÇ */}
            {mintTab === "document" && (
            <>
            <h2 className="font-serif text-xl font-semibold text-[var(--gold)] mb-5">
              Register Document Hash
            </h2>
            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.12)] rounded-lg p-6">
              <div className="grid gap-4 mb-5">
                <div>
                  <label className="block font-mono text-xs tracking-wider uppercase text-[var(--text-muted)] mb-2">
                    Document SHA-256 Hash * <span className="normal-case">(hex, with or without 0x)</span>
                  </label>
                  <input
                    type="text"
                    value={docHash}
                    onChange={(e) => setDocHash(e.target.value.replace(/[^a-fA-F0-9x]/g, ""))}
                    placeholder="0xabc123ΓÇª"
                    className="w-full bg-[var(--midnight)] border border-[rgba(201,168,76,0.2)] rounded px-4 py-3 font-mono text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--gold)] placeholder:text-[var(--text-muted)]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs tracking-wider uppercase text-[var(--text-muted)] mb-2">
                    Case Reference <span className="normal-case">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={docCaseRef}
                    onChange={(e) => setDocCaseRef(e.target.value)}
                    placeholder="UNY-CIV-2026-003"
                    className="w-full bg-[var(--midnight)] border border-[rgba(201,168,76,0.2)] rounded px-4 py-3 font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)] placeholder:text-[var(--text-muted)]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs tracking-wider uppercase text-[var(--text-muted)] mb-2">
                    IPFS CID <span className="normal-case">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={docIpfsCid}
                    onChange={(e) => setDocIpfsCid(e.target.value)}
                    placeholder="QmXyzΓÇª"
                    className="w-full bg-[var(--midnight)] border border-[rgba(201,168,76,0.2)] rounded px-4 py-3 font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)] placeholder:text-[var(--text-muted)]"
                  />
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                Anchors a document&apos;s content hash to the Polygon DocumentRegistry contract. Proves the document existed at this point in time.
              </p>
              <button
                onClick={registerDocument}
                disabled={docMinting || !docHash.trim()}
                className="btn-primary font-mono text-sm tracking-wider disabled:opacity-50"
              >
                {docMinting ? "RegisteringΓÇª" : "Register Document"}
              </button>
              {docError && (
                <div className="mt-4 bg-[rgba(204,68,68,0.08)] border border-[var(--danger)] rounded p-3">
                  <p className="text-[var(--danger)] text-sm font-mono">{docError}</p>
                </div>
              )}
              {docTxHash && (
                <div className="mt-4 bg-[rgba(76,201,76,0.06)] border border-[rgba(76,201,76,0.2)] rounded-lg p-4">
                  <p className="font-mono text-sm font-semibold text-[var(--success)] mb-1">Document registered!</p>
                  <a href={`${MAINNET.explorer}/tx/${docTxHash}`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-[var(--gold)] hover:underline break-all">
                    {docTxHash} Γåù
                  </a>
                </div>
              )}
            </div>
            </>
            )}

            {/* ΓöÇΓöÇ AUDIT ANCHOR TAB ΓöÇΓöÇ */}
            {mintTab === "anchor" && (
            <>
            <h2 className="font-serif text-xl font-semibold text-[var(--gold)] mb-5">
              Anchor Audit Batch
            </h2>
            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.12)] rounded-lg p-6">
              <div className="grid gap-4 mb-5">
                <div>
                  <label className="block font-mono text-xs tracking-wider uppercase text-[var(--text-muted)] mb-2">
                    Batch ID *
                  </label>
                  <input
                    type="text"
                    value={anchorBatchId}
                    onChange={(e) => setAnchorBatchId(e.target.value)}
                    placeholder="audit-batch-2026-04-10"
                    className="w-full bg-[var(--midnight)] border border-[rgba(201,168,76,0.2)] rounded px-4 py-3 font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)] placeholder:text-[var(--text-muted)]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs tracking-wider uppercase text-[var(--text-muted)] mb-2">
                    Root Hash * <span className="normal-case">(SHA-256 hex)</span>
                  </label>
                  <input
                    type="text"
                    value={anchorRootHash}
                    onChange={(e) => setAnchorRootHash(e.target.value.replace(/[^a-fA-F0-9x]/g, ""))}
                    placeholder="0xabc123ΓÇª"
                    className="w-full bg-[var(--midnight)] border border-[rgba(201,168,76,0.2)] rounded px-4 py-3 font-mono text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--gold)] placeholder:text-[var(--text-muted)]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs tracking-wider uppercase text-[var(--text-muted)] mb-2">
                    Entry Count
                  </label>
                  <input
                    type="number"
                    value={anchorEntryCount}
                    onChange={(e) => setAnchorEntryCount(e.target.value)}
                    placeholder="1"
                    min={1}
                    className="w-full bg-[var(--midnight)] border border-[rgba(201,168,76,0.2)] rounded px-4 py-3 font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)] placeholder:text-[var(--text-muted)]"
                  />
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                Anchors a batch of audit entries to Polygon via the AuditAnchor contract. Root hash is the SHA-256 Merkle root of the batch.
              </p>
              <button
                onClick={anchorAuditBatch}
                disabled={anchorMinting || !anchorBatchId.trim() || !anchorRootHash.trim()}
                className="btn-primary font-mono text-sm tracking-wider disabled:opacity-50"
              >
                {anchorMinting ? "AnchoringΓÇª" : "Anchor Batch"}
              </button>
              {anchorError && (
                <div className="mt-4 bg-[rgba(204,68,68,0.08)] border border-[var(--danger)] rounded p-3">
                  <p className="text-[var(--danger)] text-sm font-mono">{anchorError}</p>
                </div>
              )}
              {anchorTxHash && (
                <div className="mt-4 bg-[rgba(76,201,76,0.06)] border border-[rgba(76,201,76,0.2)] rounded-lg p-4">
                  <p className="font-mono text-sm font-semibold text-[var(--success)] mb-1">Batch anchored!</p>
                  <a href={`${MAINNET.explorer}/tx/${anchorTxHash}`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-[var(--gold)] hover:underline break-all">
                    {anchorTxHash} Γåù
                  </a>
                </div>
              )}
            </div>
            {/* Anchor image accent */}
            <div className="relative h-32 mt-6 rounded-lg overflow-hidden border border-[rgba(201,168,76,0.06)]">
              <Image src="/media/images/courtroom-trial.webp" alt="Courtroom" fill className="object-cover opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--midnight)] via-transparent to-[var(--midnight)]" />
            </div>
            </>
            )}

          </section>
        )}

        {/* ΓöÇΓöÇ Owned Names ΓöÇΓöÇ */}
        {account && chainOk && (
          <section className="mb-10">
            <h2 className="font-serif text-xl font-semibold text-[var(--gold)] mb-4">
              Your Names
            </h2>
            {ownedLoading ? (
              <div className="flex items-center gap-3 py-6">
                <div className="w-4 h-4 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
                <span className="text-[var(--text-muted)] text-sm font-mono">LoadingΓÇª</span>
              </div>
            ) : ownedNames.length === 0 ? (
              <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.07)] rounded-lg p-8 text-center">
                <p className="text-[var(--text-muted)]">You don't own any .law or .legal names yet.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {ownedNames.map((n) => (
                  <div
                    key={n.tokenId}
                    className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-bold text-[var(--gold)]">{n.name}</span>
                      <span className="font-mono font-bold text-[var(--text-muted)]">.{n.tld}</span>
                      <p className="text-xs font-mono text-[var(--text-muted)] mt-1">
                        Token #{n.tokenId}
                      </p>
                    </div>
                    <a
                      href={`${MAINNET.explorer}/token/${REGISTRY_ADDRESS}?a=${n.tokenId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-[var(--gold)] hover:underline ml-3 shrink-0"
                    >
                      View Γåù
                    </a>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ΓöÇΓöÇ Info Footer ΓöÇΓöÇ */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {IMAGE_GALLERY.filter(i => i.category === "courtroom").map((img) => (
            <div key={img.id} className="relative aspect-[16/7] overflow-hidden rounded-lg border border-[rgba(201,168,76,0.06)]">
              <Image src={img.file} alt={img.title} fill className="object-cover opacity-40 hover:opacity-70 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--midnight)] via-transparent to-transparent" />
            </div>
          ))}
        </div>
        <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.07)] rounded-lg p-5">
          <p className="text-xs font-mono text-[var(--text-muted)] leading-relaxed">
            <span className="text-[var(--gold)]">UNYKORN LAW</span> &middot; All minted assets are ERC-721 NFTs or on-chain records
            on Polygon (chain 137). Transactions are permanent and publicly verifiable.{" "}
            Namespace registry at{" "}
            <a
              href={`${MAINNET.explorer}/address/${REGISTRY_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--gold)] hover:underline"
            >
              {REGISTRY_ADDRESS ? `${REGISTRY_ADDRESS.slice(0, 10)}ΓÇª` : "contract"} Γåù
            </a>
            {" "}&middot; Case NFTs at{" "}
            <a
              href={`${MAINNET.explorer}/address/${CASE_NFT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--gold)] hover:underline"
            >
              {CASE_NFT_ADDRESS ? `${CASE_NFT_ADDRESS.slice(0, 10)}ΓÇª` : "contract"} Γåù
            </a>
          </p>
        </div>
        </div>
      </main>
      <Footer />
    </>
  );
}