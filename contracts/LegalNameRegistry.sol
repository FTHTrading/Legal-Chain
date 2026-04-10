// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LegalNameRegistry
 * @notice ERC-721 namespace registry for .law and .legal domain NFTs.
 *         Users mint their legal identity (e.g., "kevan.law", "smithfirm.legal")
 *         as transferable NFTs. Names resolve to owner addresses and metadata.
 *
 *         Supported TLDs: .law, .legal
 *         Name rules: 3-63 chars, lowercase alphanumeric + hyphens, no leading/trailing hyphens
 */
contract LegalNameRegistry is ERC721, ERC721URIStorage, Ownable {

    uint256 private _nextTokenId;

    /// @notice Supported TLDs
    string[] public tlds;

    /// @notice Full name (e.g., "kevan.law") → token ID
    mapping(string => uint256) public nameToTokenId;
    /// @notice token ID → full name
    mapping(uint256 => string) public tokenIdToName;
    /// @notice Full name → registered
    mapping(string => bool) public nameRegistered;
    /// @notice Full name → expiry timestamp (0 = no expiry during testnet)
    mapping(string => uint256) public nameExpiry;
    /// @notice Full name → resolution metadata (JSON or address)
    mapping(string => string) public nameResolution;

    /// @notice Registration fee per name (in MATIC)
    uint256 public registrationFee;
    /// @notice Renewal fee per year
    uint256 public renewalFee;

    event NameRegistered(
        uint256 indexed tokenId,
        string indexed tld,
        string name,
        string fullName,
        address indexed owner,
        uint256 timestamp,
        uint256 expiry
    );

    event NameRenewed(
        string indexed fullName,
        uint256 newExpiry,
        uint256 timestamp
    );

    event NameResolutionUpdated(
        string indexed fullName,
        string resolution,
        uint256 timestamp
    );

    event RegistrationFeeUpdated(uint256 oldFee, uint256 newFee);
    event RenewalFeeUpdated(uint256 oldFee, uint256 newFee);

    constructor() ERC721("UNYKORN Legal Namespace", "UNY-NS") Ownable(msg.sender) {
        tlds.push("law");
        tlds.push("legal");
        // Start at 0 fee on testnet — owner can set later
        registrationFee = 0;
        renewalFee = 0;
    }

    /**
     * @notice Register a name under a supported TLD
     * @param name     The name portion (e.g., "kevan")
     * @param tld      The TLD (e.g., "law" or "legal")
     * @param uri      Token URI for metadata
     * @param resolution Initial resolution (address or JSON)
     */
    function registerName(
        string calldata name,
        string calldata tld,
        string calldata uri,
        string calldata resolution
    ) external payable returns (uint256) {
        require(msg.value >= registrationFee, "Insufficient fee");
        require(_isValidTld(tld), "Unsupported TLD");
        require(_isValidName(name), "Invalid name");

        string memory fullName = string(abi.encodePacked(name, ".", tld));
        require(!nameRegistered[fullName], "Name already registered");

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);

        nameToTokenId[fullName] = tokenId;
        tokenIdToName[tokenId] = fullName;
        nameRegistered[fullName] = true;
        nameExpiry[fullName] = block.timestamp + 365 days;
        nameResolution[fullName] = resolution;

        emit NameRegistered(tokenId, tld, name, fullName, msg.sender, block.timestamp, nameExpiry[fullName]);
        return tokenId;
    }

    /**
     * @notice Renew a name for another year
     */
    function renewName(string calldata fullName) external payable {
        require(nameRegistered[fullName], "Name not registered");
        require(msg.value >= renewalFee, "Insufficient fee");

        uint256 tokenId = nameToTokenId[fullName];
        require(ownerOf(tokenId) == msg.sender, "Not name owner");

        uint256 currentExpiry = nameExpiry[fullName];
        uint256 newExpiry;
        if (currentExpiry > block.timestamp) {
            newExpiry = currentExpiry + 365 days;
        } else {
            newExpiry = block.timestamp + 365 days;
        }
        nameExpiry[fullName] = newExpiry;

        emit NameRenewed(fullName, newExpiry, block.timestamp);
    }

    /**
     * @notice Update name resolution (only by name owner)
     */
    function updateResolution(string calldata fullName, string calldata resolution) external {
        require(nameRegistered[fullName], "Name not registered");
        uint256 tokenId = nameToTokenId[fullName];
        require(ownerOf(tokenId) == msg.sender, "Not name owner");
        nameResolution[fullName] = resolution;
        emit NameResolutionUpdated(fullName, resolution, block.timestamp);
    }

    /**
     * @notice Resolve a name to its metadata
     */
    function resolve(string calldata fullName) external view returns (
        bool exists,
        address owner,
        string memory resolution,
        uint256 expiry,
        uint256 tokenId
    ) {
        if (!nameRegistered[fullName]) return (false, address(0), "", 0, 0);
        uint256 tid = nameToTokenId[fullName];
        return (true, ownerOf(tid), nameResolution[fullName], nameExpiry[fullName], tid);
    }

    /**
     * @notice Check if a name is available
     */
    function isAvailable(string calldata name, string calldata tld) external view returns (bool) {
        if (!_isValidTld(tld) || !_isValidName(name)) return false;
        string memory fullName = string(abi.encodePacked(name, ".", tld));
        if (!nameRegistered[fullName]) return true;
        // Also available if expired
        return nameExpiry[fullName] < block.timestamp;
    }

    /**
     * @notice Get total names registered
     */
    function totalNames() external view returns (uint256) {
        return _nextTokenId;
    }

    /**
     * @notice Set registration fee (owner only)
     */
    function setRegistrationFee(uint256 fee) external onlyOwner {
        uint256 old = registrationFee;
        registrationFee = fee;
        emit RegistrationFeeUpdated(old, fee);
    }

    /**
     * @notice Set renewal fee (owner only)
     */
    function setRenewalFee(uint256 fee) external onlyOwner {
        uint256 old = renewalFee;
        renewalFee = fee;
        emit RenewalFeeUpdated(old, fee);
    }

    /**
     * @notice Add a new TLD (owner only)
     */
    function addTld(string calldata tld) external onlyOwner {
        require(!_isValidTld(tld), "TLD already exists");
        tlds.push(tld);
    }

    /**
     * @notice Withdraw collected fees
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");
        (bool sent,) = payable(owner()).call{value: balance}("");
        require(sent, "Withdraw failed");
    }

    // ─── Internal helpers ────────────────────────────────────────────────

    function _isValidTld(string calldata tld) internal view returns (bool) {
        for (uint256 i = 0; i < tlds.length; i++) {
            if (keccak256(bytes(tlds[i])) == keccak256(bytes(tld))) return true;
        }
        return false;
    }

    function _isValidName(string calldata name) internal pure returns (bool) {
        bytes memory b = bytes(name);
        if (b.length < 3 || b.length > 63) return false;
        // No leading/trailing hyphens
        if (b[0] == 0x2d || b[b.length - 1] == 0x2d) return false;
        for (uint256 i = 0; i < b.length; i++) {
            bytes1 c = b[i];
            // a-z, 0-9, hyphen
            if (!(c >= 0x61 && c <= 0x7a) && !(c >= 0x30 && c <= 0x39) && c != 0x2d) return false;
        }
        return true;
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
