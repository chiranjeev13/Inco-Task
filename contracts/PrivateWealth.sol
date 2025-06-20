// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {e, ebool, euint256} from "@inco/lightning/src/Lib.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
contract PrivateWealth is Ownable {
    mapping(address => euint256) private participantWealth;
    mapping(address => bool) isCounted;

    address public coValidator;
    address[] public participants;
    address[] public winners;
    euint256 public maxWealth;

    using e for *;

    constructor(address _coValidator) Ownable(msg.sender) {
        coValidator = _coValidator;
    }

    function submitWealth(bytes memory eAmount) public {
        require(!isCounted[msg.sender], "Already Amount Added");
        require(participants.length < 4, "Max participants reached");
        euint256 value = eAmount.newEuint256(msg.sender);
        value.allowThis();
        participantWealth[msg.sender] = value;
        isCounted[msg.sender] = true;
        participants.push(msg.sender);
    }

    function richest() public {
        require(participants.length > 0, "No participants available");

        while (winners.length > 0) {
            winners.pop();
        }

        uint256 n = participants.length;

        maxWealth = participantWealth[participants[0]];
        for (uint256 i = 1; i < n; i++) {
            ebool isGreater = participantWealth[participants[i]].gt(maxWealth);
            maxWealth = e.select(
                isGreater,
                participantWealth[participants[i]],
                maxWealth
            );
        }

        for (uint256 i = 0; i < n; i++) {
            ebool isEqual = participantWealth[participants[i]].eq(maxWealth);
            isEqual.requestDecryption(
                this.resultCallback.selector,
                abi.encode(participants[i])
            );
        }
    }

    function resultCallback(
        uint256 /* requestId */,
        bool result,
        bytes memory data
    ) external {
        require(msg.sender == coValidator, "Only co-validator can call");

        if (result) {
            require(isCounted[abi.decode(data, (address))], "Not counted");
            for (uint256 i = 0; i < winners.length; i++) {
                if (winners[i] == abi.decode(data, (address))) {
                    return;
                }
            }
            winners.push(abi.decode(data, (address)));
        }
    }

    function resetArrays() public {

        while (participants.length > 0) {
            address participant = participants[participants.length - 1];
            uint256 v = 0;
            participantWealth[participant] = v.asEuint256();
            isCounted[participant] = false;
            participants.pop();
        }

        while (winners.length > 0) {
            winners.pop();
        }

        maxWealth = 0.asEuint256();
    }

    function getWinners() public view returns (address[] memory) {
        return winners;
    }

    function getParticipants() public view returns (address[] memory) {
        return participants;
    }

    function updateCoValidator(address _coValidator) public onlyOwner {
        coValidator = _coValidator;
    }

    function getWealthbyUser() public view returns (euint256) {
        require((msg.sender).isAllowed(participantWealth[msg.sender]), "Not Allowed to fetch");
        return participantWealth[msg.sender];
    }
}
