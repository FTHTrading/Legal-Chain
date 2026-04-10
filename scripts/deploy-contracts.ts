/**
 * deploy-contracts.ts
 *
 * Deploys all 5 UNYKORN Legal Chain contracts to Polygon Amoy (or mainnet).
 * Run:  npx hardhat run scripts/deploy-contracts.ts --network polygon-amoy
 *
 * After deploying, copy the printed addresses into .env.local.
 */

const { ethers } = require("hardhat");
const fs   = require("fs");
const path = require("path");

async function main() {
  const signers = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  // Pick the first signer with enough balance (issuer wallet has the POL on mainnet)
  let deployer = signers[0];
  for (const signer of signers) {
    const bal = await ethers.provider.getBalance(signer.address);
    if (bal >= ethers.parseEther("0.05")) { deployer = signer; break; }
  }

  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("\n=== UNYKORN LEGAL CHAIN — CONTRACT DEPLOYMENT ===");
  console.log("Network  :", network.name, `(chainId ${network.chainId})`);
  console.log("Deployer :", deployer.address);
  console.log("Balance  :", ethers.formatEther(balance), "MATIC");
  console.log("================================================\n");

  if (balance < ethers.parseEther("0.05")) {
    throw new Error("Deployer balance too low — need at least 0.05 MATIC");
  }

  const deployed: Record<string, string> = {};

  // 1 — AuditAnchor
  console.log("Deploying AuditAnchor...");
  const AuditAnchor = await ethers.getContractFactory("AuditAnchor", deployer);
  const auditAnchor = await AuditAnchor.deploy();
  await auditAnchor.waitForDeployment();
  deployed.NEXT_PUBLIC_AUDIT_ANCHOR_ADDRESS = await auditAnchor.getAddress();
  console.log("  ✓ AuditAnchor          :", deployed.NEXT_PUBLIC_AUDIT_ANCHOR_ADDRESS);

  // 2 — DocumentRegistry
  console.log("Deploying DocumentRegistry...");
  const DocumentRegistry = await ethers.getContractFactory("DocumentRegistry", deployer);
  const documentRegistry = await DocumentRegistry.deploy();
  await documentRegistry.waitForDeployment();
  deployed.NEXT_PUBLIC_DOCUMENT_REGISTRY_ADDRESS = await documentRegistry.getAddress();
  console.log("  ✓ DocumentRegistry     :", deployed.NEXT_PUBLIC_DOCUMENT_REGISTRY_ADDRESS);

  // 3 — LegalCaseNFT
  console.log("Deploying LegalCaseNFT...");
  const LegalCaseNFT = await ethers.getContractFactory("LegalCaseNFT", deployer);
  const legalCaseNFT = await LegalCaseNFT.deploy();
  await legalCaseNFT.waitForDeployment();
  deployed.NEXT_PUBLIC_LEGAL_CASE_NFT_ADDRESS = await legalCaseNFT.getAddress();
  console.log("  ✓ LegalCaseNFT         :", deployed.NEXT_PUBLIC_LEGAL_CASE_NFT_ADDRESS);

  // 4 — LegalCaseAccount (ERC-6551 implementation)
  console.log("Deploying LegalCaseAccount...");
  const LegalCaseAccount = await ethers.getContractFactory("LegalCaseAccount", deployer);
  const legalCaseAccount = await LegalCaseAccount.deploy();
  await legalCaseAccount.waitForDeployment();
  deployed.NEXT_PUBLIC_LEGAL_CASE_ACCOUNT_ADDRESS = await legalCaseAccount.getAddress();
  console.log("  ✓ LegalCaseAccount     :", deployed.NEXT_PUBLIC_LEGAL_CASE_ACCOUNT_ADDRESS);

  // 5 — LegalNameRegistry (.law / .legal namespaces)
  console.log("Deploying LegalNameRegistry...");
  const LegalNameRegistry = await ethers.getContractFactory("LegalNameRegistry", deployer);
  const legalNameRegistry = await LegalNameRegistry.deploy();
  await legalNameRegistry.waitForDeployment();
  deployed.NEXT_PUBLIC_LEGAL_NAME_REGISTRY_ADDRESS = await legalNameRegistry.getAddress();
  console.log("  ✓ LegalNameRegistry    :", deployed.NEXT_PUBLIC_LEGAL_NAME_REGISTRY_ADDRESS);

  console.log("\n=== ALL CONTRACTS DEPLOYED ===\n");
  console.log("Contract addresses:");
  for (const [key, addr] of Object.entries(deployed)) {
    console.log(`  ${key}=${addr}`);
  }

  // Patch .env.local with deployed addresses
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    let env = fs.readFileSync(envPath, "utf8");
    for (const [key, addr] of Object.entries(deployed)) {
      env = env.replace(new RegExp(`^${key}=.*$`, "m"), `${key}=${addr}`);
    }
    // Patch network vars to match the chain we actually deployed to
    if (String(network.chainId) === "137") {
      env = env.replace(/^NEXT_PUBLIC_POLYGON_NETWORK=.*$/m, "NEXT_PUBLIC_POLYGON_NETWORK=polygon-mainnet");
      env = env.replace(/^NEXT_PUBLIC_POLYGON_RPC=.*$/m, "NEXT_PUBLIC_POLYGON_RPC=https://polygon-rpc.com");
      env = env.replace(/^NEXT_PUBLIC_POLYGON_CHAIN_ID=.*$/m, "NEXT_PUBLIC_POLYGON_CHAIN_ID=137");
    }
    fs.writeFileSync(envPath, env, "utf8");
    console.log("\n✓ .env.local updated with deployed addresses");
  }

  // Save deployment log
  const log = {
    network: String(network.chainId),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: deployed,
  };
  const logPath = path.join(__dirname, "..", `deployment-${network.chainId}-${Date.now()}.json`);
  fs.writeFileSync(logPath, JSON.stringify(log, null, 2));
  console.log("✓ Deployment log saved:", path.basename(logPath));
  console.log("\nSend MATIC to issuer wallet then begin minting:");
  console.log("  Issuer:", process.env.POLYGON_ISSUER_ADDRESS);
}

main().catch((err) => {
  console.error("\n✗ Deployment failed:", err.message);
  process.exit(1);
});
