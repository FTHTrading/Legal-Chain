// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LegalCaseNFT
 * @notice ERC-721 for legal case files. Each token represents a case —
 *         provenance, ownership, and attorney handoff tracked on-chain.
 *         Combined with ERC-6551, each case NFT gets its own vault wallet.
 */
contract LegalCaseNFT is ERC721, ERC721URIStorage, Ownable {

    uint256 private _nextTokenId;

    /// @notice case reference → tokenId lookup
    mapping(string => uint256) public caseRefToTokenId;
    /// @notice tokenId → case reference
    mapping(uint256 => string) public tokenIdToCaseRef;
    /// @notice tokenId → case type
    mapping(uint256 => string) public tokenIdToCaseType;
    /// @notice tokenId → jurisdiction
    mapping(uint256 => string) public tokenIdToJurisdiction;
    /// @notice tokenId → state hash (current case state integrity)
    mapping(uint256 => bytes32) public tokenIdToStateHash;
    /// @notice tokenId → mint timestamp
    mapping(uint256 => uint256) public tokenIdToMintTime;

    event CaseMinted(
        uint256 indexed tokenId,
        string caseRef,
        string caseType,
        string jurisdiction,
        address indexed owner,
        uint256 timestamp
    );

    event CaseStateUpdated(
        uint256 indexed tokenId,
        bytes32 oldHash,
        bytes32 newHash,
        uint256 timestamp
    );

    event CaseTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        string reason,
        uint256 timestamp
    );

    constructor() ERC721("UNYKORN Legal Case", "UNY-CASE") Ownable(msg.sender) {}

    /**
     * @notice Mint a new case NFT
     * @param to         Recipient (usually the platform deployer initially)
     * @param caseRef    Unique case reference (e.g., "UNY-ADV-2026-001")
     * @param caseType   Type of case (e.g., "Family Safety")
     * @param jurisdiction Case jurisdiction
     * @param uri        Token URI (IPFS or API endpoint for metadata)
     * @param stateHash  SHA-256 hash of the current case state
     */
    function mintCase(
        address to,
        string calldata caseRef,
        string calldata caseType,
        string calldata jurisdiction,
        string calldata uri,
        bytes32 stateHash
    ) external onlyOwner returns (uint256) {
        require(caseRefToTokenId[caseRef] == 0 || _nextTokenId == 0, "Case ref already minted");

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        caseRefToTokenId[caseRef] = tokenId;
        tokenIdToCaseRef[tokenId] = caseRef;
        tokenIdToCaseType[tokenId] = caseType;
        tokenIdToJurisdiction[tokenId] = jurisdiction;
        tokenIdToStateHash[tokenId] = stateHash;
        tokenIdToMintTime[tokenId] = block.timestamp;

        emit CaseMinted(tokenId, caseRef, caseType, jurisdiction, to, block.timestamp);
        return tokenId;
    }

    /**
     * @notice Update the state hash (when case facts/evidence change)
     */
    function updateStateHash(uint256 tokenId, bytes32 newHash) external onlyOwner {
        bytes32 oldHash = tokenIdToStateHash[tokenId];
        tokenIdToStateHash[tokenId] = newHash;
        emit CaseStateUpdated(tokenId, oldHash, newHash, block.timestamp);
    }

    /**
     * @notice Transfer with reason (for attorney handoff audit trail)
     */
    function transferWithReason(
        address from,
        address to,
        uint256 tokenId,
        string calldata reason
    ) external onlyOwner {
        _transfer(from, to, tokenId);
        emit CaseTransferred(tokenId, from, to, reason, block.timestamp);
    }

    /**
     * @notice Get total minted cases
     */
    function totalCases() external view returns (uint256) {
        return _nextTokenId;
    }

    // ─── Required overrides ──────────────────────────────────────────────

    function tokenURI(uint256 tokenId)
        public view override(ERC721, ERC721URIStorage) returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721URIStorage) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
