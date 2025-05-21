import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-foundry";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",  // Specify the Solidity version
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "cancun" // Specify the EVM version
    }
  },
};

export default config;
