import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("EtherWallet", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployFixture() {

        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const Contract = await ethers.getContractFactory("Storage");
        const contract = await Contract.deploy();
        return { contract, owner, otherAccount };
    }

    describe("Get Slot value", function () {
        it("should get slot 2", async function () {
            const { contract, owner, otherAccount } = await loadFixture(deployFixture);
            const ret = await contract.get(2);
            expect(ret).equal(789);
        });
    });
    describe("Set Slot value", function () {
        it("should change slot 2's value", async function () {
            const { contract, owner, otherAccount } = await loadFixture(deployFixture);
            const data = 888888;
            await contract.set(2, data);
            const ret = await contract.get(2);
            expect(ret).equal(data);
        });
    });    
});
