// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract AbiDecode {

    event Encode(bytes);
    event Decode(uint, address);

    function encode(uint x, address addr) external returns (bytes memory bts) {
        bts = abi.encode(x, addr);
        emit Encode(bts);
    }

    function decode(bytes calldata data) external returns (uint x, address addr)
    {
        (x, addr) = abi.decode( data, (uint, address));
        emit Decode(x, addr);
    }
}
