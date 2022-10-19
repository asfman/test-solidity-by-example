// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "hardhat/console.sol";

contract Caller {
    event Log(address caller);

    function call(address callee) public {
        console.log("getMessageHash: ", bytes4ToHex(this.getSelector("getMessageHash(address, uint256, string, uint256)")));
        console.log("bytes4(keccak256(bytes(\"fk()\"))): %s", bytes4ToHex(this.getSelector("fk()")));
        console.log("Callee.fk.selector: %s", bytes4ToHex(Callee.fk.selector));
        (bool success, bytes memory data) = callee.staticcall(
            // abi.encode(this.getSelector("fk()"))
            // Callee.fk.selector equal this.getSelector("fk()") 
            abi.encode(Callee.fk.selector)
        );
        require(success, "call failed");
        console.log("bytesToHex: %s", bytes20ToHex(data, 12));
        bytes20 b20 = bytesToBytes20WithOffset(data);
        console.log("address(uint(b20) ", address(uint160(uint(bytes32(data)))));
        address caller = address(b20);
        emit Log(caller);
        // callee's msg.sender is Caller
        console.log("msg.sender: ", caller);
    }

    function delegatecall(address callee) public {
        (bool success, bytes memory data) = callee.delegatecall(
            abi.encodeWithSignature("fk()")
        );
        require(success, "call failed");
        address caller = address(bytesToBytes20WithOffset(data));
        // callee's msg.sender is who call the Caller Contract
        console.log("msg.sender: ", msg.sender);
        emit Log(caller);
    }

    function callwithargs(address callee) public {
        bytes4 selector = this.getSelector("fkwithargs(uint256)");
        console.log("getSelector ", bytes4ToHex(selector));

        (bool success, ) = callee.call(
            // abi.encodeWithSignature("fkwithargs(uint256)", 1) 等同于在 abi.encode(1) 编码结果前加上了 4 字节的函数选择器
            // 与 abi.encodeWithSignature 功能类似，只不过第一个参数为函数选择器，为函数签名 Keccak 哈希的前 4 个字节
            // abi.encodeWithSelector(Callee.fkwithargs.selector, 1)
            // must use uint256 not uint

            abi.encode(selector, 1)
        );
        require(success, "call failed");
    }

    function uint8tohexchar(uint8 i) public pure returns (uint8) {
        return
            (i > 9)
                ? (i + 97 - 10) // ascii a-f
                : (i + 48); // ascii 0-9
    }

    // 单字节转换成连个16进制字符
    function bytes1tohexchar(bytes1 b1) private pure returns (bytes memory) {
        uint8 i = uint8(b1);
        bytes memory o = new bytes(2);
        uint8 mask = 0x0f;
        o[1] = bytes1(uint8tohexchar(uint8(i & mask)));
        i = i >> 4;
        o[0] = bytes1(uint8tohexchar(uint8(i & mask)));
        return o;
    }

    function bytes4ToHex(bytes4 bb)
        private
        pure
        returns (string memory)
    {
        bytes memory bts = new bytes(8);
        for (uint i = 0; i < 4; i++) {
            bytes1 b1 = bb[i];
            bytes memory bchars = bytes1tohexchar(b1);
            bts[i * 2] = bchars[0];
            bts[i * 2 + 1] = bchars[1];
        }
        return string(bts);
    }

    function bytes20ToHex(bytes memory bb, uint offset)
        private
        pure
        returns (string memory)
    {
        bytes memory bts = new bytes(40);
        for (uint i = 0; i < 20; i++) {
            bytes1 b1 = bb[offset + i];
            bytes memory bchars = bytes1tohexchar(b1);
            bts[i * 2] = bchars[0];
            bts[i * 2 + 1] = bchars[1];
        }
        return string(bts);
    }

    function bytesToBytes20WithOffset(bytes memory bb)
        private
        pure
        returns (bytes20)
    {
        bytes20 out;
        for (uint i = 0; i < 20; i++) {
            out |= bytes20(bb[12 + i]) >> (i * 8);
        }
        return out;
    }

    function getSelector(string calldata _func) external pure returns (bytes4) {
        return bytes4(keccak256(bytes(_func)));
    }
}

contract Callee {
    function fk() external view returns (address) {
        return msg.sender;
    }

    function fkwithargs(uint i) external view {
        console.log(i);
    }
}
