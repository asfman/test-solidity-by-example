import { ethers } from "hardhat";
import { hexDataSlice } from "@ethersproject/bytes";
import { id } from "@ethersproject/hash";

async function main() {
  // 0xc0457f922BD307A49C9A2364677E3cB3C6EC982A
  // const Contract = await ethers.getContractFactory("VerifySignature");
  // const contract = await Contract.deploy();

  // await contract.deployed();
  // console.log(contract.address);

  const contract = new ethers.Contract("0xa5F8a1FcdB4b36Ddb17C71cA90173043C28DE02f", [
    "function getMessageHash(address _to, uint _amount, string memory _message, uint _nonce) public pure returns (bytes32)",
    "function getEthSignedMessageHash(bytes32 _messageHash) public pure returns (bytes32)"], ethers.provider);
  const [signer] = await ethers.getSigners();
  const to = signer.address;
  const amount = 888;
  const message = "asfman";
  const nonce = 123;

  const hash = await contract.getMessageHash(to, amount, message, nonce);
  console.log(hash, signer.address);

  const sigMessage = await signer.signMessage(ethers.utils.arrayify(hash));
  console.log("signer.signMessage ", sigMessage);

  console.log("personal_sign      ", await ethers.provider.send("personal_sign", [hash, signer.address]));

  // 本地对ETHSignedMessageHash返回值签名
  const ethHash = await contract.getEthSignedMessageHash(hash);

  const signingKey = new ethers.utils.SigningKey("0xe6f990a63ae14b51987efe48c392bbec0a96df699f98ebc43ffc010347e5b843");
  const sig = ethers.utils.joinSignature(signingKey.signDigest(ethHash));
  console.log("signDigest         ", sig);

  const txCount = await ethers.provider.getTransactionCount(signer.address);
  const chainId = await ethers.provider.send("eth_chainId", []);
  let callData;
  const tx = function () {
    const from = signer.address;
    const to = "0xa5F8a1FcdB4b36Ddb17C71cA90173043C28DE02f";
    const value = "0x";
    const nonce = txCount;
    const gasLimit = 680333;
    const gasPrice = ethers.utils.parseUnits("10", "gwei");


    let ABI = [
      "function getMessageHash(address _to, uint _amount, string memory _message, uint _nonce)"
    ];
    let iface = new ethers.utils.Interface(ABI);
    //encodeFUnctionData: 1. this.getSighash(this.getFunction(functionFragment)) 2. this._abiCoder.encode(params, values): new ethers.utils.AbiCoder().encode(["uint", "address"], [123, owner.address])
    //calldat == abi.encodeWithSignature("transfer(address,uint256)", to, amount) == encodeFUnctionData("transfer", [owner.address, 888]);
    callData = iface.encodeFunctionData("getMessageHash", [from, 888, "asfman", 123]);
    // let fragment = iface.getFunction("getMessageHash");
    // console.log(fragment.format());
    // console.log("getSighash ", iface.getSighash(fragment))
    // console.log("hexDataSlice(id(text)) ", hexDataSlice(id("getMessageHash(address,uint256,string,uint256)"), 0, 4));
    // console.log(callData);
    let tx = {
      nonce,
      value: 0,
      to,
      gasPrice,
      gasLimit,
      data: callData,
      chainId: 5
    };
    return tx;
  }();

  // send raw transaction use provider.setTransaction
  const wallet = new ethers.Wallet("0xe6f990a63ae14b51987efe48c392bbec0a96df699f98ebc43ffc010347e5b843", ethers.provider);
  // const signedTx = await wallet.signTransaction(tx);
  // wallet.sendTransaction
  // console.log("signedTx ", signedTx);
  // await ethers.provider.sendTransaction(signedTx);

  // wallet.sendTransaction = wallet.signTransaction and then provider.sendTransaction
  await wallet.sendTransaction(tx);
  
  // send signed transaction signer.sendTransaction
  // const sendTx = await signer.sendTransaction(tx);
  // const res = await sendTx.wait();
  // console.log(res);
  // 通过eth_call读取数据 
  //   curl -X POST --data '{"jsonrpc":"2.0","method":"eth_call","params":[{"to": "0xa5F8a1FcdB4b36Ddb17C71cA90173043C28DE02f", "data": "0xa35f8a40000000000000000000000000c0457f922bd307a49c9a2364677e3cb3c6ec982a00000000000000000000000000000000000000000000000000000000000003780000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000007b00000000000000000000000000000000000000000000000000000000000000066173666d616e0000000000000000000000000000000000000000000000000000"}, "latest"],"id":1}' https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161                                                  
  // {"jsonrpc":"2.0","id":1,"result":"0xac73e3434755f9a442236d4430093e872fa25f23207c2631ee732ce78a68e496"}% 
  console.log("contract call hash ", hash);
  console.log("eth_call hash      ", await ethers.provider.send("eth_call", [{to: "0xa5F8a1FcdB4b36Ddb17C71cA90173043C28DE02f", data: callData}, "latest"]));
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
