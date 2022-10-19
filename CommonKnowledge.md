## solidity

### bytes to hex char

```shell
function uint8tohexchar(uint8 i) public pure returns (uint8) {
    return
        (i > 9)
            ? (i + 97 - 10) // ascii a-f
            : (i + 48); // ascii 0-9
}
function bytes1tohexchar(bytes1 b1) private pure returns (bytes memory) {
    uint8 i = uint8(b1);
    bytes memory o = new bytes(2);
    uint8 mask = 0x0f;
    o[1] = bytes1(uint8tohexchar(uint8(i & mask)));
    i = i >> 4;
    o[0] = bytes1(uint8tohexchar(uint8(i & mask)));
    return o;
}
// bytes4 covert to hex chars
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
```

### bytes to address

```shell
 address(uint160(uint(bytes32(data)))))
```

### get function selector

1. direct use keccak256
```shell
function getSelector(string calldata _func) external pure returns (bytes4) {
    return bytes4(keccak256(bytes(_func)));
}
bytes4 selector = this.getSelector("xxx(uint256,address)");
```
2. use contraction function selctor
```shell
Contract.func.selector
```

### contract call

***无状态读取用address.staticcall(bytes), 否者用address.call(bytes)***
1. abi.encodeWithSignature
等同于在abi.encode()参数后, 编码结果前加上了bytes4(keccak256(bytes(_func)))返回的4字节的函数选择器
```shell
CalleeContract.call(
    abi.encodeWithSignature("xxx(uint256)", 1) 
)
```
2. abi.encodeWithSelctor
等同于在abi.encode()参数后, 编码结果前加上了4字节的函数选择器
```shell
CalleeContract.call(
    abi.encodeWithSelector(selector, 1)
)
```
3. abi.encode
完全等同于abi.encodeWithSelctor?
```shell
CalleeContract.call(
    abi.encode(selector, 1)
)
```

## ethers.js

### encodeFunctionData 
1. iface.getSighash("getMesssageHash") 
2. ethers.utils.defaultAbiCoder.encode(["uint", "address"], [123, owner.address])
```shell
let ABI = [
    "function getMessageHash(address _to, uint _amount, string memory _message, uint _nonce)"
];
let iface = new ethers.utils.Interface(ABI);
let calldata = iface.encodeFunctionData("getMessageHash", [from, 888, "asfman", 123]);
signer.sendTransaction({
    to: contract.address,
    data: calldata
}
```
### decodeFunctionData 

***底层解码 ethers.utils.defaultAbiCoder.decode(['address','uint256','string','uint256'], ethers.utils.hexDataSlice(calldata, 4))***

```shell
let ABI = [
    "function getMessageHash(address _to, uint _amount, string memory _message, uint _nonce)"
];
let iface = new ethers.utils.Interface(ABI);
let [to, amount, message, nonce] = iface.decodeFunctionData("getMessageHash", calldata);
```

### contract call
比如有一个合约如下：
```shell
contract Callee {
    function take(string calldata _secrect) external {}
}
```
```shell
const ABI = ["function take(string calldata _secrect) external"]
const contract = new ethers.utils.Contract(calleeAddress, ABI, wallet)
```
#### 1. direct use contract.func
```shell
await contract.take("")
```

#### 2. use sendTransaction
signer.sendTransaction:
1. wallet.signTransaction(tx)
2. provider.sendTransaction(signedTx)

```shell
const iface = new ethers.utils.Interface(ABI);
const calldata = iface.encodeFunctionData("take", ["asfman"])
await signer.sendTransaction({
    to: contract.address,
    data: calldata
})
```
#### 3. use eth_sendRawTransaction
```shell
const gasLimit = 680333
const gasPrice = ethers.utils.parseUnits("10", "gwei")
const iface = new ethers.utils.Interface(ABI)
const calldata = iface.encodeFunctionData("take", ["asfman"])
const signedTx = await wallet.signTransaction({
    to: contract.address,
    nonce: await ethers.provider.getTransactionCount(owner.address),
    gasLimit,
    gasPrice,
    data: calldata
});
// await ethers.provider.send("eth_sendRawTransaction", [signedTx])
await ethers.provider.sendTransaction(signedTx)
```

### contract static call

#### 1. direct use contract.func
```shell
await contract.take("")
```

#### 2. use eth_call
类似于：curl -X POST --data '{"jsonrpc":"2.0","method":"eth_call","params":[{"to": "0xa5F8a1FcdB4b36", "data": "0xa35f8a4000007"}, "latest"],"id":1}' https://xxx
```shell
const iface = new ethers.utils.Interface(ABI)
const calldata = iface.encodeFunctionData("take", ["asfman"])
await ethers.provider.send("eth_call", [{to: contract.address, data: calldata}, "latest"]))
```
### cancel pending transaction

```shell
const tx = {
  nonce: nonceOfPendingTx,
  to: ethers.constants.AddressZero,
  data: '0x',
  gasPrice: gasPriceHigherThanPendingTx
}; // costs 21000 gas
signer.sendTransaction(tx);
```