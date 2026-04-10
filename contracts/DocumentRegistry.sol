// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DocumentRegistry
 * @notice On-chain document hash registry. Stores SHA-256 hashes of legal
 *         documents (pleadings, exhibits, filings) with metadata for
 *         tamper-proof verification.
 */
contract DocumentRegistry is Ownable {

    struct Document {
        bytes32 contentHash;     // SHA-256 of document content
        string  caseRef;         // Associated case reference
        string  docType;         // "pleading", "exhibit", "filing", "contract", "evidence"
        string  ipfsCid;         // IPFS content identifier
        uint256 timestamp;       // Registration time
        uint256 blockNumber;     // Block number
        address registeredBy;    // Who registered it
    }

    /// @notice All registered documents
    Document[] public documents;

    /// @notice contentHash → document index
    mapping(bytes32 => uint256) public hashToIndex;
    /// @notice Quick existence check
    mapping(bytes32 => bool) public hashExists;
    /// @notice caseRef → document indices
    mapping(string => uint256[]) public caseDocuments;

    event DocumentRegistered(
        uint256 indexed docId,
        bytes32 indexed contentHash,
        string caseRef,
        string docType,
        string ipfsCid,
        uint256 timestamp
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Register a document hash on-chain
     * @param contentHash SHA-256 of the document
     * @param caseRef     Case reference (e.g., "UNY-ADV-2026-001")
     * @param docType     Document type
     * @param ipfsCid     IPFS CID where the document is pinned
     */
    function register(
        bytes32 contentHash,
        string calldata caseRef,
        string calldata docType,
        string calldata ipfsCid
    ) external onlyOwner returns (uint256) {
        require(!hashExists[contentHash], "Hash already registered");

        uint256 docId = documents.length;
        documents.push(Document({
            contentHash: contentHash,
            caseRef: caseRef,
            docType: docType,
            ipfsCid: ipfsCid,
            timestamp: block.timestamp,
            blockNumber: block.number,
            registeredBy: msg.sender
        }));

        hashToIndex[contentHash] = docId;
        hashExists[contentHash] = true;
        caseDocuments[caseRef].push(docId);

        emit DocumentRegistered(docId, contentHash, caseRef, docType, ipfsCid, block.timestamp);
        return docId;
    }

    /**
     * @notice Verify a document hash exists on-chain
     */
    function verify(bytes32 contentHash) external view returns (
        bool exists,
        string memory caseRef,
        string memory docType,
        string memory ipfsCid,
        uint256 timestamp,
        uint256 blockNumber
    ) {
        if (!hashExists[contentHash]) return (false, "", "", "", 0, 0);
        Document storage d = documents[hashToIndex[contentHash]];
        return (true, d.caseRef, d.docType, d.ipfsCid, d.timestamp, d.blockNumber);
    }

    /**
     * @notice Get document count for a case
     */
    function getCaseDocumentCount(string calldata caseRef) external view returns (uint256) {
        return caseDocuments[caseRef].length;
    }

    /**
     * @notice Get document IDs for a case
     */
    function getCaseDocumentIds(string calldata caseRef) external view returns (uint256[] memory) {
        return caseDocuments[caseRef];
    }

    /**
     * @notice Get total documents registered
     */
    function totalDocuments() external view returns (uint256) {
        return documents.length;
    }

    /**
     * @notice Get document by ID
     */
    function getDocument(uint256 docId) external view returns (
        bytes32 contentHash,
        string memory caseRef,
        string memory docType,
        string memory ipfsCid,
        uint256 timestamp,
        uint256 blockNumber,
        address registeredBy
    ) {
        require(docId < documents.length, "Invalid document ID");
        Document storage d = documents[docId];
        return (d.contentHash, d.caseRef, d.docType, d.ipfsCid, d.timestamp, d.blockNumber, d.registeredBy);
    }
}
