// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "hardhat/console.sol";

contract Payable {
    // Payable address can receive Ether
    address payable public owner;

    // Payable constructor can receive Ether
    constructor() payable {
        owner = payable(msg.sender);
    }

    // Function to transfer Ether from this contract to address from input
    function transfer(address payable _to, uint _amount) public {
        console.log("balance: %s ether", address(this).balance/10**18);
        // use transfer, _to muset payable.
        // This function is no longer recommended for sending Ether.
        // _to.transfer(_amount);

        // Call returns a boolean value indicating success or failure.
        // This is the current recommended method to use.
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "Failed to send Ether");
        console.log("balance: %s ether", address(this).balance/10**18);
        // Call returns a boolean value indicating success or failure.
        // This is the current recommended method to use.        
        // bool sent = _to.send(_amount);
        // require(sent, "Failed to send Ether");
    }
}
