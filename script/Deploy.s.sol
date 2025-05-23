// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {PrivateWealth} from "../contracts/PrivateWealth.sol";

contract DeployPrivateWealth is Script {
    function run() public returns (PrivateWealth) {
        vm.createSelectFork("https://sepolia.base.org");
        vm.startBroadcast();
        address coValidator = 0x63D8135aF4D393B1dB43B649010c8D3EE19FC9fd;
        PrivateWealth privateWealth = new PrivateWealth(coValidator);
        vm.stopBroadcast();
        return privateWealth;
    }
}
