import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { id } from "@ethersproject/hash";

describe("CallMethods", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployFixture() {

        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const Contract = await ethers.getContractFactory("FrontRunme");
        const secrect = "asfman";
        const secrectHash = id(secrect);
        console.log("secrectHash ", secrectHash);
        const contract = await Contract.deploy(secrectHash, { value: ethers.utils.parseEther("100") });
        return { contract, secrect, owner };
    }

    describe("call take method with eth_sendRawTransaction", function () {
        it("should take the balances", async function () {
            const { contract, secrect, owner } = await loadFixture(deployFixture);
            console.log("before ", ethers.utils.formatEther(await ethers.provider.getBalance(owner.address)));
            const iface = new ethers.utils.Interface(["function take(string calldata _secrect) external"]);
            let calldata = iface.encodeFunctionData("take", ["asfman"]);
            // use eth_sendRawTransaction 
            const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
            const gasLimit = 680333;
            const gasPrice = ethers.utils.parseUnits("10", "gwei");
            const signedTx = await wallet.signTransaction({
                to: contract.address,
                nonce: await ethers.provider.getTransactionCount(owner.address),
                gasLimit,
                gasPrice,
                data: calldata
            });
            // await ethers.provider.send("eth_sendRawTransaction", [signedTx]);
            await ethers.provider.sendTransaction(signedTx);
            console.log("after ", ethers.utils.formatEther(await ethers.provider.getBalance(owner.address)));
        });
    });
    describe("call take method with sendTransaction", function () {
        // signer.sendTransaction == wallet.signTransaction + provider.sendTransaction
        it("should take the balances", async function () {
            const { contract, secrect, owner } = await loadFixture(deployFixture);
            console.log("before ", ethers.utils.formatEther(await ethers.provider.getBalance(owner.address)));
            // await contract.take(secrect);
            const iface = new ethers.utils.Interface(["function take(string calldata _secrect) external"]);
            let calldata = iface.encodeFunctionData("take", ["asfman"]);
            // use sendTransaction
            await expect(owner.sendTransaction({
                to: contract.address,
                data: calldata
            })).to.emit(contract, "success");
            calldata = iface.encodeFunctionData("take", ["asfman1"]);
            await expect(owner.sendTransaction({
                to: contract.address,
                data: calldata
            })).to.emit(contract, "fail");
            console.log("after ", ethers.utils.formatEther(await ethers.provider.getBalance(owner.address)));
        });
    });
    describe("call take method with contract", function () {
        it("should take the balances", async function () {
            const { contract, secrect, owner } = await loadFixture(deployFixture);
            console.log("before ", ethers.utils.formatEther(await ethers.provider.getBalance(owner.address)));
            await contract.take(secrect);
            console.log("after ", ethers.utils.formatEther(await ethers.provider.getBalance(owner.address)));
        });
    });
});
