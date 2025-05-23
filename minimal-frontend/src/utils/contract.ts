import PrivateWealthabi from "../../../artifacts/PrivateWealth.sol/PrivateWealth.json" assert { type: "json" };
import Address from "../../../broadcast/Deploy.s.sol/84532/run-latest.json" assert { type: "json" };

export const PRIVATE_WEALTH_CONTRACT_ADDRESS =
  Address.transactions[0].contractAddress as `0x${string}`;


export const PrivateWealthABI = PrivateWealthabi.abi;
