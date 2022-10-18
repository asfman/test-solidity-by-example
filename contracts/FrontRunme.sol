// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "hardhat/console.sol";

contract FrontRunme {

    event success();
    event fail();

    bytes32 public secretHash;

    constructor(bytes32 _secretHash) payable {
        secretHash = _secretHash;
    }

    function take(string calldata _secrect) external {
        if(keccak256(abi.encodePacked(_secrect)) == secretHash) {
            uint myBalance = address(this).balance;
            bool ok = payable(msg.sender).send(myBalance); 
            require(ok, "take failed");
            emit success();
        } else {
            emit fail();
        }
    }
}