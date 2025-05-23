import { Hex } from "viem";
import PrivateWealthabi from "../utils/abi/PrivateWealth.json" assert { type: "json" };

export const PRIVATE_WEALTH_CONTRACT_ADDRESS = "0x85111ef5328a16971048c78e349244e94cc1a81f" as Hex;


export const PrivateWealthABI = PrivateWealthabi.abi;
