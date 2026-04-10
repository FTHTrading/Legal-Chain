require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env.local" });

const DEPLOYER_PK = process.env.POLYGON_DEPLOYER_PRIVATE_KEY || "";
const ISSUER_PK   = process.env.POLYGON_ISSUER_PRIVATE_KEY   || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "cancun",
    },
  },
  networks: {
    "polygon-amoy": {
      url: "https://rpc-amoy.polygon.technology",
      chainId: 80002,
      accounts: [DEPLOYER_PK, ISSUER_PK].filter(Boolean),
      gasPrice: "auto",
    },
    "polygon-mainnet": {
      url: "https://polygon-rpc.com",
      chainId: 137,
      accounts: [DEPLOYER_PK, ISSUER_PK].filter(Boolean),
      gasPrice: "auto",
    },
  },
  paths: {
    sources:   "./contracts",
    tests:     "./test",
    artifacts: "./artifacts",
    cache:     "./cache",
  },
};
