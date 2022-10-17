import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Todos", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployFixture() {

        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const Contract = await ethers.getContractFactory("Event");
        const contract = await Contract.deploy();
        return { contract, owner };
    }

    describe("Event", function () {
        it("Should emit event", async function () {
            const { contract, owner } = await loadFixture(deployFixture);
            await expect(contract.test()).to.emit(contract, "Log").withArgs(owner.address, "Hello World!");
            await expect(contract.test()).to.emit(contract, "Log").withArgs(owner.address, "Hello EVM!");
            await expect(contract.test()).to.emit(contract, "AnotherLog");
        });

    });

});
