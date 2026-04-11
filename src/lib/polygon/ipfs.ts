/**
 * IPFS Client ΓÇö Pin and retrieve documents via local Kubo node.
 *
 * Server-side only. Requires IPFS daemon running on localhost:5001.
 * Uses the Kubo RPC API (HTTP).
 */

import type { IPFSPinResult, IPFSDocument, CaseNFTMetadata, NamespaceMetadata } from "./types";

const IPFS_API = process.env.IPFS_API_URL || "http://127.0.0.1:5001";
const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "http://127.0.0.1:8080";

/** Check if the local IPFS daemon is reachable */
export async function isIPFSOnline(): Promise<boolean> {
  try {
    const res = await fetch(`${IPFS_API}/api/v0/id`, {
      method: "POST",
      headers: { Origin: "http://127.0.0.1:5001" },
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Get IPFS node identity */
export async function getIPFSId(): Promise<{ id: string; agentVersion: string } | null> {
  try {
    const res = await fetch(`${IPFS_API}/api/v0/id`, {
      method: "POST",
      headers: { Origin: "http://127.0.0.1:5001" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { id: data.ID, agentVersion: data.AgentVersion };
  } catch {
    return null;
  }
}

/** Pin a JSON object to IPFS (returns CID) */
export async function pinJSON(data: Record<string, unknown>, name?: string): Promise<IPFSPinResult> {
  const json = JSON.stringify(data);
  const blob = new Blob([json], { type: "application/json" });

  const form = new FormData();
  form.append("file", blob, name || "metadata.json");

  const res = await fetch(`${IPFS_API}/api/v0/add?pin=true`, {
    method: "POST",
    headers: { Origin: "http://127.0.0.1:5001" },
    body: form,
  });

  if (!res.ok) {
    throw new Error(`IPFS pin failed: ${res.status} ${await res.text()}`);
  }

  const result = await res.json();
  return {
    cid: result.Hash,
    size: parseInt(result.Size, 10),
    name: result.Name,
    timestamp: new Date().toISOString(),
  };
}

/** Pin raw bytes/file to IPFS */
export async function pinFile(content: Buffer | Uint8Array, filename: string): Promise<IPFSPinResult> {
  const buf = Buffer.isBuffer(content) ? content : Buffer.from(content as Uint8Array);
  const blob = new Blob([new Uint8Array(buf)]);
  const form = new FormData();
  form.append("file", blob, filename);

  const res = await fetch(`${IPFS_API}/api/v0/add?pin=true`, {
    method: "POST",
    headers: { Origin: "http://127.0.0.1:5001" },
    body: form,
  });

  if (!res.ok) {
    throw new Error(`IPFS pin failed: ${res.status} ${await res.text()}`);
  }

  const result = await res.json();
  return {
    cid: result.Hash,
    size: parseInt(result.Size, 10),
    name: result.Name,
    timestamp: new Date().toISOString(),
  };
}

/** Retrieve content from IPFS by CID */
export async function getFromIPFS(cid: string): Promise<Uint8Array> {
  const res = await fetch(`${IPFS_API}/api/v0/cat?arg=${encodeURIComponent(cid)}`, {
    method: "POST",
    headers: { Origin: "http://127.0.0.1:5001" },
  });

  if (!res.ok) {
    throw new Error(`IPFS get failed: ${res.status}`);
  }

  return new Uint8Array(await res.arrayBuffer());
}

/** Retrieve JSON from IPFS by CID */
export async function getJSONFromIPFS<T = Record<string, unknown>>(cid: string): Promise<T> {
  const bytes = await getFromIPFS(cid);
  const text = new TextDecoder().decode(bytes);
  return JSON.parse(text);
}

/** Get the public gateway URL for a CID */
export function getGatewayUrl(cid: string): string {
  return `${IPFS_GATEWAY}/ipfs/${cid}`;
}

/** Pin case NFT metadata to IPFS and return the CID + URI */
export async function pinCaseMetadata(metadata: CaseNFTMetadata): Promise<{ cid: string; tokenURI: string }> {
  const result = await pinJSON(
    metadata as unknown as Record<string, unknown>,
    `case-${metadata.properties.caseRef}.json`
  );
  return {
    cid: result.cid,
    tokenURI: `ipfs://${result.cid}`,
  };
}

/** Pin namespace metadata to IPFS */
export async function pinNamespaceMetadata(metadata: NamespaceMetadata): Promise<{ cid: string; tokenURI: string }> {
  const result = await pinJSON(
    metadata as unknown as Record<string, unknown>,
    `ns-${metadata.properties.fullName}.json`
  );
  return {
    cid: result.cid,
    tokenURI: `ipfs://${result.cid}`,
  };
}

/** List pinned objects on local node */
export async function listPins(): Promise<string[]> {
  try {
    const res = await fetch(`${IPFS_API}/api/v0/pin/ls?type=recursive`, {
      method: "POST",
      headers: { Origin: "http://127.0.0.1:5001" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Object.keys(data.Keys || {});
  } catch {
    return [];
  }
}

/** Get IPFS repo stats */
export async function getRepoStats(): Promise<{ numObjects: number; repoSize: number } | null> {
  try {
    const res = await fetch(`${IPFS_API}/api/v0/repo/stat`, {
      method: "POST",
      headers: { Origin: "http://127.0.0.1:5001" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { numObjects: data.NumObjects, repoSize: data.RepoSize };
  } catch {
    return null;
  }
}

/** Build an IPFSDocument descriptor */
export function buildIPFSDocument(
  cid: string,
  name: string,
  caseRef: string,
  docType: string,
  contentHash: string,
  size: number
): IPFSDocument {
  return {
    cid,
    name,
    caseRef,
    docType,
    contentHash,
    size,
    pinnedAt: new Date().toISOString(),
    gatewayUrl: getGatewayUrl(cid),
  };
}