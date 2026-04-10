// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/interfaces/IERC1271.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

/**
 * @title IERC6551Account
 * @notice Minimal ERC-6551 token-bound account interface
 */
interface IERC6551Account {
    receive() external payable;
    function token() external view returns (uint256 chainId, address tokenContract, uint256 tokenId);
    function state() external view returns (uint256);
    function isValidSigner(address signer, bytes calldata context) external view returns (bytes4 magicValue);
}

/**
 * @title LegalCaseAccount
 * @notice ERC-6551 token-bound account — each Case NFT gets one of these.
 *         The vault can hold MATIC, ERC-20 tokens, evidence hashes, and escrow.
 *         Only the NFT owner can execute transactions from the vault.
 *
 *         Architecture:
 *         Case NFT (ERC-721) → ERC-6551 Registry → This Account (vault)
 *         The vault IS the case's on-chain identity.
 */
contract LegalCaseAccount is IERC6551Account, IERC165, IERC1271, IERC721Receiver, IERC1155Receiver {

    uint256 public state;

    /// @notice Evidence hashes anchored to this case vault
    bytes32[] public evidenceHashes;
    mapping(bytes32 => uint256) public evidenceTimestamps;

    /// @notice Document hashes registered in this vault
    bytes32[] public documentHashes;
    mapping(bytes32 => uint256) public documentTimestamps;

    /// @notice Escrow deposits
    struct Escrow {
        address depositor;
        uint256 amount;
        string purpose;       // "retainer", "fee", "settlement", "bond"
        bool released;
        bool refunded;
        uint256 depositTime;
        uint256 resolveTime;
    }
    Escrow[] public escrows;

    // ─── Events ──────────────────────────────────────────────────────────

    event EvidenceAnchored(bytes32 indexed hash, uint256 timestamp);
    event DocumentAnchored(bytes32 indexed hash, uint256 timestamp);
    event EscrowDeposited(uint256 indexed escrowId, address indexed depositor, uint256 amount, string purpose);
    event EscrowReleased(uint256 indexed escrowId, address indexed to, uint256 amount);
    event EscrowRefunded(uint256 indexed escrowId, address indexed to, uint256 amount);
    event TransactionExecuted(address indexed target, uint256 value, bytes data);

    // ─── Modifiers ───────────────────────────────────────────────────────

    modifier onlyOwner() {
        require(_isOwner(msg.sender), "Not token owner");
        _;
    }

    // ─── Core ERC-6551 ──────────────────────────────────────────────────

    receive() external payable {}

    function token() public view returns (uint256 chainId, address tokenContract, uint256 tokenId) {
        bytes memory footer = new bytes(0x60);
        assembly {
            extcodecopy(address(), add(footer, 0x20), 0x4d, 0x60)
        }
        return abi.decode(footer, (uint256, address, uint256));
    }

    function isValidSigner(address signer, bytes calldata) external view returns (bytes4) {
        if (_isOwner(signer)) {
            return IERC6551Account.isValidSigner.selector;
        }
        return bytes4(0);
    }

    function isValidSignature(bytes32 hash, bytes memory signature) external view returns (bytes4) {
        (, address tokenContract, uint256 tokenId) = token();
        address owner = IERC721(tokenContract).ownerOf(tokenId);
        if (SignatureChecker.isValidSignatureNow(owner, hash, signature)) {
            return IERC1271.isValidSignature.selector;
        }
        return bytes4(0);
    }

    // ─── Execute (general tx from vault) ─────────────────────────────────

    function execute(address to, uint256 value, bytes calldata data, uint8)
        external payable onlyOwner returns (bytes memory)
    {
        require(to != address(0), "Invalid target");
        ++state;
        (bool success, bytes memory result) = to.call{value: value}(data);
        require(success, "Execution failed");
        emit TransactionExecuted(to, value, data);
        return result;
    }

    // ─── Evidence Anchoring ──────────────────────────────────────────────

    function anchorEvidence(bytes32 hash) external onlyOwner {
        require(evidenceTimestamps[hash] == 0, "Already anchored");
        evidenceHashes.push(hash);
        evidenceTimestamps[hash] = block.timestamp;
        ++state;
        emit EvidenceAnchored(hash, block.timestamp);
    }

    function anchorDocument(bytes32 hash) external onlyOwner {
        require(documentTimestamps[hash] == 0, "Already anchored");
        documentHashes.push(hash);
        documentTimestamps[hash] = block.timestamp;
        ++state;
        emit DocumentAnchored(hash, block.timestamp);
    }

    function getEvidenceCount() external view returns (uint256) {
        return evidenceHashes.length;
    }

    function getDocumentCount() external view returns (uint256) {
        return documentHashes.length;
    }

    // ─── Escrow System ──────────────────────────────────────────────────

    function depositEscrow(string calldata purpose) external payable {
        require(msg.value > 0, "No value");
        uint256 id = escrows.length;
        escrows.push(Escrow({
            depositor: msg.sender,
            amount: msg.value,
            purpose: purpose,
            released: false,
            refunded: false,
            depositTime: block.timestamp,
            resolveTime: 0
        }));
        ++state;
        emit EscrowDeposited(id, msg.sender, msg.value, purpose);
    }

    function releaseEscrow(uint256 escrowId, address payable to) external onlyOwner {
        Escrow storage e = escrows[escrowId];
        require(!e.released && !e.refunded, "Already resolved");
        e.released = true;
        e.resolveTime = block.timestamp;
        ++state;
        (bool sent,) = to.call{value: e.amount}("");
        require(sent, "Transfer failed");
        emit EscrowReleased(escrowId, to, e.amount);
    }

    function refundEscrow(uint256 escrowId) external onlyOwner {
        Escrow storage e = escrows[escrowId];
        require(!e.released && !e.refunded, "Already resolved");
        e.refunded = true;
        e.resolveTime = block.timestamp;
        ++state;
        (bool sent,) = payable(e.depositor).call{value: e.amount}("");
        require(sent, "Transfer failed");
        emit EscrowRefunded(escrowId, e.depositor, e.amount);
    }

    function getEscrowCount() external view returns (uint256) {
        return escrows.length;
    }

    // ─── Token receivers ─────────────────────────────────────────────────

    function onERC721Received(address, address, uint256, bytes calldata)
        external pure returns (bytes4)
    {
        return IERC721Receiver.onERC721Received.selector;
    }

    function onERC1155Received(address, address, uint256, uint256, bytes calldata)
        external pure returns (bytes4)
    {
        return IERC1155Receiver.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(address, address, uint256[] calldata, uint256[] calldata, bytes calldata)
        external pure returns (bytes4)
    {
        return IERC1155Receiver.onERC1155BatchReceived.selector;
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return
            interfaceId == type(IERC165).interfaceId ||
            interfaceId == type(IERC6551Account).interfaceId ||
            interfaceId == type(IERC1271).interfaceId ||
            interfaceId == type(IERC721Receiver).interfaceId ||
            interfaceId == type(IERC1155Receiver).interfaceId;
    }

    // ─── Internal ────────────────────────────────────────────────────────

    function _isOwner(address addr) internal view returns (bool) {
        (, address tokenContract, uint256 tokenId) = token();
        return addr == IERC721(tokenContract).ownerOf(tokenId);
    }
}
