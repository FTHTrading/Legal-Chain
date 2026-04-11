/**
 * Contract ABIs ΓÇö Minimal interfaces for ethers.js v6 interaction.
 * These match the deployed Solidity contracts on Polygon mainnet (chain 137).
 */

export const LegalCaseNFT_ABI = [
  "function mintCase(address to, string caseRef, string caseType, string jurisdiction, string uri, bytes32 stateHash) returns (uint256)",
  "function updateStateHash(uint256 tokenId, bytes32 newHash)",
  "function transferWithReason(address from, address to, uint256 tokenId, string reason)",
  "function totalCases() view returns (uint256)",
  "function caseRefToTokenId(string) view returns (uint256)",
  "function tokenIdToCaseRef(uint256) view returns (string)",
  "function tokenIdToCaseType(uint256) view returns (string)",
  "function tokenIdToJurisdiction(uint256) view returns (string)",
  "function tokenIdToStateHash(uint256) view returns (bytes32)",
  "function tokenIdToMintTime(uint256) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function balanceOf(address owner) view returns (uint256)",
  "event CaseMinted(uint256 indexed tokenId, string caseRef, string caseType, string jurisdiction, address indexed owner, uint256 timestamp)",
  "event CaseStateUpdated(uint256 indexed tokenId, bytes32 oldHash, bytes32 newHash, uint256 timestamp)",
  "event CaseTransferred(uint256 indexed tokenId, address indexed from, address indexed to, string reason, uint256 timestamp)",
] as const;

export const LegalCaseAccount_ABI = [
  "function execute(address to, uint256 value, bytes data, uint8) payable returns (bytes)",
  "function anchorEvidence(bytes32 hash)",
  "function anchorDocument(bytes32 hash)",
  "function depositEscrow(string purpose) payable",
  "function releaseEscrow(uint256 escrowId, address to)",
  "function refundEscrow(uint256 escrowId)",
  "function getEvidenceCount() view returns (uint256)",
  "function getDocumentCount() view returns (uint256)",
  "function getEscrowCount() view returns (uint256)",
  "function evidenceHashes(uint256) view returns (bytes32)",
  "function documentHashes(uint256) view returns (bytes32)",
  "function evidenceTimestamps(bytes32) view returns (uint256)",
  "function documentTimestamps(bytes32) view returns (uint256)",
  "function state() view returns (uint256)",
  "function token() view returns (uint256 chainId, address tokenContract, uint256 tokenId)",
  "event EvidenceAnchored(bytes32 indexed hash, uint256 timestamp)",
  "event DocumentAnchored(bytes32 indexed hash, uint256 timestamp)",
  "event EscrowDeposited(uint256 indexed escrowId, address indexed depositor, uint256 amount, string purpose)",
  "event EscrowReleased(uint256 indexed escrowId, address indexed to, uint256 amount)",
  "event EscrowRefunded(uint256 indexed escrowId, address indexed to, uint256 amount)",
] as const;

export const AuditAnchor_ABI = [
  "function anchor(bytes32 batchHash, uint256 entryCount) returns (uint256)",
  "function verify(bytes32 batchHash) view returns (bool exists, uint256 timestamp, uint256 blockNumber)",
  "function totalAnchors() view returns (uint256)",
  "function getAnchor(uint256 anchorId) view returns (bytes32 batchHash, uint256 entryCount, uint256 timestamp, uint256 blockNumber)",
  "event AuditAnchored(uint256 indexed anchorId, bytes32 indexed batchHash, uint256 entryCount, uint256 timestamp, uint256 blockNumber)",
] as const;

export const DocumentRegistry_ABI = [
  "function register(bytes32 contentHash, string caseRef, string docType, string ipfsCid) returns (uint256)",
  "function verify(bytes32 contentHash) view returns (bool exists, string caseRef, string docType, string ipfsCid, uint256 timestamp, uint256 blockNumber)",
  "function totalDocuments() view returns (uint256)",
  "function getDocument(uint256 docId) view returns (bytes32 contentHash, string caseRef, string docType, string ipfsCid, uint256 timestamp, uint256 blockNumber, address registeredBy)",
  "function getCaseDocumentCount(string caseRef) view returns (uint256)",
  "function getCaseDocumentIds(string caseRef) view returns (uint256[])",
  "event DocumentRegistered(uint256 indexed docId, bytes32 indexed contentHash, string caseRef, string docType, string ipfsCid, uint256 timestamp)",
] as const;

export const LegalNameRegistry_ABI = [
  "function registerName(string name, string tld, string uri, string resolution) payable returns (uint256)",
  "function renewName(string fullName) payable",
  "function updateResolution(string fullName, string resolution)",
  "function resolve(string fullName) view returns (bool exists, address owner, string resolution, uint256 expiry, uint256 tokenId)",
  "function isAvailable(string name, string tld) view returns (bool)",
  "function totalNames() view returns (uint256)",
  "function registrationFee() view returns (uint256)",
  "function renewalFee() view returns (uint256)",
  "function nameToTokenId(string) view returns (uint256)",
  "function tokenIdToName(uint256) view returns (string)",
  "function nameExpiry(string) view returns (uint256)",
  "function nameResolution(string) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "event NameRegistered(uint256 indexed tokenId, string indexed tld, string name, string fullName, address indexed owner, uint256 timestamp, uint256 expiry)",
  "event NameRenewed(string indexed fullName, uint256 newExpiry, uint256 timestamp)",
  "event NameResolutionUpdated(string indexed fullName, string resolution, uint256 timestamp)",
] as const;

export const ERC6551Registry_ABI = [
  "function createAccount(address implementation, bytes32 salt, uint256 chainId, address tokenContract, uint256 tokenId) returns (address)",
  "function account(address implementation, bytes32 salt, uint256 chainId, address tokenContract, uint256 tokenId) view returns (address)",
] as const;