import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("MultisigWallet", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployFixture() {

        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const Contract = await ethers.getContractFactory("MultiSigWallet");
        const contract = await Contract.deploy([owner.address, otherAccount.address], 2);

        const TestContract = await ethers.getContractFactory("TestMultiContract");
        const testContract = await TestContract.deploy();
        return { contract, testContract, owner, otherAccount };
    }

    describe("MultisigWallet", function () {
        it("two owner can execute transaction", async function () {
            const { contract, testContract, owner, otherAccount } = await loadFixture(deployFixture);
            const callData = await testContract.getData();
            await contract.submitTransaction(testContract.address, 0, callData);
            await contract.confirmTransaction(0);
            await expect(contract.executeTransaction(0)).to.be.rejectedWith("cannot execute tx");
            await contract.connect(otherAccount).confirmTransaction(0);
            console.log("before execute: ", await testContract.i());
            await contract.executeTransaction(0);
            console.log("execute: ", await testContract.i());
            expect(await testContract.i()).to.equal(123);
        });
    });
});
