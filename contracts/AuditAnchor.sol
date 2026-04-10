// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AuditAnchor
 * @notice Immutable on-chain audit trail. Batches of platform audit hashes
 *         are anchored to Polygon — proving what happened and when.
 *         Cheap (~$0.001/anchor) and tamper-proof.
 */
contract AuditAnchor is Ownable {

    struct Anchor {
        bytes32 batchHash;      // SHA-256 of the audit batch
        uint256 entryCount;     // Number of audit entries in batch
        uint256 timestamp;      // Block timestamp
        uint256 blockNumber;    // Block number for reference
    }

    /// @notice All anchors in order
    Anchor[] public anchors;

    /// @notice Lookup: batchHash → anchor index
    mapping(bytes32 => uint256) public hashToIndex;
    /// @notice Quick existence check
    mapping(bytes32 => bool) public hashExists;

    event AuditAnchored(
        uint256 indexed anchorId,
        bytes32 indexed batchHash,
        uint256 entryCount,
        uint256 timestamp,
        uint256 blockNumber
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Anchor a batch of audit entries
     * @param batchHash   SHA-256 of the concatenated audit entry hashes
     * @param entryCount  Number of entries in the batch
     */
    function anchor(bytes32 batchHash, uint256 entryCount) external onlyOwner returns (uint256) {
        require(!hashExists[batchHash], "Hash already anchored");
        require(entryCount > 0, "Empty batch");

        uint256 anchorId = anchors.length;
        anchors.push(Anchor({
            batchHash: batchHash,
            entryCount: entryCount,
            timestamp: block.timestamp,
            blockNumber: block.number
        }));

        hashToIndex[batchHash] = anchorId;
        hashExists[batchHash] = true;

        emit AuditAnchored(anchorId, batchHash, entryCount, block.timestamp, block.number);
        return anchorId;
    }

    /**
     * @notice Verify a batch hash exists on-chain
     */
    function verify(bytes32 batchHash) external view returns (bool exists, uint256 timestamp, uint256 blockNumber) {
        if (!hashExists[batchHash]) return (false, 0, 0);
        Anchor storage a = anchors[hashToIndex[batchHash]];
        return (true, a.timestamp, a.blockNumber);
    }

    /**
     * @notice Get total number of anchors
     */
    function totalAnchors() external view returns (uint256) {
        return anchors.length;
    }

    /**
     * @notice Get anchor by ID
     */
    function getAnchor(uint256 anchorId) external view returns (
        bytes32 batchHash, uint256 entryCount, uint256 timestamp, uint256 blockNumber
    ) {
        require(anchorId < anchors.length, "Invalid anchor ID");
        Anchor storage a = anchors[anchorId];
        return (a.batchHash, a.entryCount, a.timestamp, a.blockNumber);
    }
}
