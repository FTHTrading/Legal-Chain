/**
 * Polygon Client ΓÇö Provider + wallet management for Polygon.
 *
 * Server-side only ΓÇö never import from client components.
 * Uses ethers v6.
 */

import { ethers } from "ethers";
import type { PolygonNetwork, PolygonConfig, ContractAddresses } from "./types";
import { POLYGON_NETWORKS } from "./types";

let _provider: ethers.JsonRpcProvider | null = null;
let _wallet: ethers.Wallet | null = null;
let _issuerWallet: ethers.Wallet | null = null;
let _config: PolygonConfig | null = null;

/** Get the active Polygon configuration */
export function getPolygonConfig(): PolygonConfig {
  if (_config) return _config;

  const network = (process.env.NEXT_PUBLIC_POLYGON_NETWORK || "polygon-mainnet") as PolygonNetwork;
  const rpcUrl = process.env.NEXT_PUBLIC_POLYGON_RPC || POLYGON_NETWORKS[network].rpcUrl;
  const chainId = Number(process.env.NEXT_PUBLIC_POLYGON_CHAIN_ID) || POLYGON_NETWORKS[network].chainId;
  const deployerAddress = process.env.POLYGON_DEPLOYER_ADDRESS;

  const contracts: ContractAddresses = {
    legalCaseNFT: process.env.NEXT_PUBLIC_LEGAL_CASE_NFT_ADDRESS || "",
    legalCaseAccount: process.env.NEXT_PUBLIC_LEGAL_CASE_ACCOUNT_ADDRESS || "",
    auditAnchor: process.env.NEXT_PUBLIC_AUDIT_ANCHOR_ADDRESS || "",
    documentRegistry: process.env.NEXT_PUBLIC_DOCUMENT_REGISTRY_ADDRESS || "",
    legalNameRegistry: process.env.NEXT_PUBLIC_LEGAL_NAME_REGISTRY_ADDRESS || "",
    erc6551Registry:
      process.env.NEXT_PUBLIC_ERC6551_REGISTRY || "0x000000006551c19487814612e58FE06813775758",
  };

  _config = { network, rpcUrl, chainId, deployerAddress, contracts };
  return _config;
}

/** Get the JSON-RPC provider */
export function getProvider(): ethers.JsonRpcProvider {
  if (_provider) return _provider;

  const config = getPolygonConfig();
  _provider = new ethers.JsonRpcProvider(config.rpcUrl, {
    name: config.network,
    chainId: config.chainId,
  });
  return _provider;
}

/** Get the deployer wallet (signer) */
export function getDeployerWallet(): ethers.Wallet {
  if (_wallet) return _wallet;

  const pk = process.env.POLYGON_DEPLOYER_PRIVATE_KEY;
  if (!pk) throw new Error("POLYGON_DEPLOYER_PRIVATE_KEY not set");

  _wallet = new ethers.Wallet(pk, getProvider());
  return _wallet;
}

/** Check if deployer wallet is configured */
export function hasDeployerWallet(): boolean {
  return !!process.env.POLYGON_DEPLOYER_PRIVATE_KEY;
}

/** Get deployer address without exposing private key */
export function getDeployerAddress(): string | null {
  return process.env.POLYGON_DEPLOYER_ADDRESS || null;
}

/** Get the issuer wallet (mints NFTs, namespaces, registers docs) */
export function getIssuerWallet(): ethers.Wallet {
  if (_issuerWallet) return _issuerWallet;

  const pk = process.env.POLYGON_ISSUER_PRIVATE_KEY;
  if (!pk) throw new Error("POLYGON_ISSUER_PRIVATE_KEY not set");

  _issuerWallet = new ethers.Wallet(pk, getProvider());
  return _issuerWallet;
}

/** Check if issuer wallet is configured */
export function hasIssuerWallet(): boolean {
  return !!process.env.POLYGON_ISSUER_PRIVATE_KEY;
}

/** Get issuer address without exposing private key */
export function getIssuerAddress(): string | null {
  return process.env.POLYGON_ISSUER_ADDRESS || null;
}

/** Get issuer MATIC balance */
export async function getIssuerBalance(): Promise<string> {
  const provider = getProvider();
  const address = getIssuerAddress();
  if (!address) return "0";

  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}

/** Get deployer MATIC balance */
export async function getDeployerBalance(): Promise<string> {
  const provider = getProvider();
  const address = getDeployerAddress();
  if (!address) return "0";

  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}

/** Get balance for any address */
export async function getAddressBalance(address: string): Promise<string> {
  const provider = getProvider();
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}

/** Get current block number */
export async function getCurrentBlock(): Promise<number> {
  return getProvider().getBlockNumber();
}

/** Get gas price in gwei */
export async function getGasPrice(): Promise<string> {
  const feeData = await getProvider().getFeeData();
  return ethers.formatUnits(feeData.gasPrice || BigInt(0), "gwei");
}

/** Get explorer URL for a transaction */
export function getExplorerTxUrl(txHash: string): string {
  const config = getPolygonConfig();
  const explorer = POLYGON_NETWORKS[config.network].explorer;
  return `${explorer}/tx/${txHash}`;
}

/** Get explorer URL for an address */
export function getExplorerAddressUrl(address: string): string {
  const config = getPolygonConfig();
  const explorer = POLYGON_NETWORKS[config.network].explorer;
  return `${explorer}/address/${address}`;
}

/** Get explorer URL for a token */
export function getExplorerTokenUrl(tokenId: string, contractAddress: string): string {
  const config = getPolygonConfig();
  const explorer = POLYGON_NETWORKS[config.network].explorer;
  return `${explorer}/nft/${contractAddress}/${tokenId}`;
}

/** Verify a contract address has code deployed */
export async function isContractDeployed(address: string): Promise<boolean> {
  if (!address) return false;
  const provider = getProvider();
  const code = await provider.getCode(address);
  return code !== "0x";
}

/** Get all contract deployment statuses */
export async function getContractStatuses(): Promise<
  { name: string; address: string; deployed: boolean }[]
> {
  const config = getPolygonConfig();
  const contracts = [
    { name: "LegalCaseNFT", address: config.contracts.legalCaseNFT },
    { name: "LegalCaseAccount", address: config.contracts.legalCaseAccount },
    { name: "AuditAnchor", address: config.contracts.auditAnchor },
    { name: "DocumentRegistry", address: config.contracts.documentRegistry },
    { name: "LegalNameRegistry", address: config.contracts.legalNameRegistry },
    { name: "ERC6551Registry", address: config.contracts.erc6551Registry },
  ];

  return Promise.all(
    contracts.map(async (c) => ({
      ...c,
      deployed: await isContractDeployed(c.address),
    }))
  );
}