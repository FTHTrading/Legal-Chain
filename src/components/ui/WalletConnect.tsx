"use client";

import { useState, useEffect } from "react";
import { BrowserProvider, formatEther } from "ethers";
import { WEB3_CONFIG } from "@/lib/plans";

interface WalletState {
  address: string | null;
  balance: string | null;
  chainId: number | null;
  connected: boolean;
  connecting: boolean;
  error: string | null;
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null, balance: null, chainId: null,
    connected: false, connecting: false, error: null,
  });

  async function connect() {
    if (typeof window === "undefined" || !window.ethereum) {
      setWallet((w) => ({ ...w, error: "No Web3 wallet detected. Install MetaMask." }));
      return;
    }
    setWallet((w) => ({ ...w, connecting: true, error: null }));
    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];
      const network = await provider.getNetwork();
      const balance = formatEther(await provider.getBalance(address));
      setWallet({ address, balance, chainId: Number(network.chainId), connected: true, connecting: false, error: null });
    } catch (err) {
      setWallet((w) => ({ ...w, connecting: false, error: err instanceof Error ? err.message : "Wallet connection failed" }));
    }
  }

  function disconnect() {
    setWallet({ address: null, balance: null, chainId: null, connected: false, connecting: false, error: null });
  }

  async function switchToApostleChain() {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: `0x${WEB3_CONFIG.chainId.toString(16)}`,
          chainName: WEB3_CONFIG.chainName,
          rpcUrls: [WEB3_CONFIG.rpcUrl],
          nativeCurrency: WEB3_CONFIG.nativeCurrency,
        }],
      });
    } catch {
      // user rejected
    }
  }

  // Listen for account/chain changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;
    const handleAccounts = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) disconnect();
      else setWallet((w) => ({ ...w, address: accounts[0] }));
    };
    const handleChain = (...args: unknown[]) => {
      const chainId = args[0] as string;
      setWallet((w) => ({ ...w, chainId: parseInt(chainId, 16) }));
    };
    window.ethereum.on("accountsChanged", handleAccounts);
    window.ethereum.on("chainChanged", handleChain);
    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccounts);
      window.ethereum?.removeListener("chainChanged", handleChain);
    };
  }, []);

  return { ...wallet, connect, disconnect, switchToApostleChain };
}

// ── Wallet Connect Button Component ──

export default function WalletConnect({ compact }: { compact?: boolean }) {
  const { address, connected, connecting, error, connect, disconnect, switchToApostleChain, chainId } = useWallet();
  const wrongChain = connected && chainId !== WEB3_CONFIG.chainId;

  if (compact) {
    return (
      <button
        onClick={connected ? disconnect : connect}
        disabled={connecting}
        className="font-mono text-[11px] tracking-wider px-4 py-2 rounded-sm border border-[rgba(201,168,76,0.3)] text-[var(--gold)] hover:bg-[rgba(201,168,76,0.08)] transition-colors disabled:opacity-50"
      >
        {connecting ? "CONNECTING..." : connected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : "CONNECT WALLET"}
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-[rgba(201,168,76,0.15)] bg-[rgba(201,168,76,0.03)] p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-[rgba(201,168,76,0.15)] flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
        </div>
        <div>
          <h3 className="font-serif text-sm font-bold text-[var(--text-primary)]">Web3 Wallet</h3>
          <p className="font-mono text-[10px] text-[var(--text-muted)]">Apostle Chain • x402 Protocol</p>
        </div>
      </div>

      {connected ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
            <span className="font-mono text-xs text-[var(--text-primary)]">{address?.slice(0, 8)}...{address?.slice(-6)}</span>
          </div>
          {wrongChain && (
            <button onClick={switchToApostleChain} className="w-full text-xs font-mono px-3 py-2 rounded-sm bg-[rgba(239,68,68,0.1)] text-red-400 border border-red-500/20 hover:bg-[rgba(239,68,68,0.2)] transition-colors">
              Switch to Apostle Chain (7332)
            </button>
          )}
          <button onClick={disconnect} className="w-full text-xs font-mono px-3 py-2 rounded-sm border border-[rgba(201,168,76,0.2)] text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors">
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connect}
          disabled={connecting}
          className="w-full font-serif text-sm font-semibold tracking-wider px-4 py-3 rounded-sm bg-[rgba(201,168,76,0.1)] border border-[var(--gold)] text-[var(--gold)] hover:bg-[rgba(201,168,76,0.2)] transition-colors disabled:opacity-50"
        >
          {connecting ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}

      <div className="mt-4 pt-3 border-t border-[rgba(201,168,76,0.08)]">
        <p className="font-mono text-[10px] text-[var(--text-muted)]">
          Pay with ATP or USDF on Apostle Chain. Traditional card payments also accepted via Stripe.
        </p>
      </div>
    </div>
  );
}
