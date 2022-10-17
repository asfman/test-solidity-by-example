import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Payable", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployFixture() {

        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const Contract = await ethers.getContractFactory("Payable");
        const contract = await Contract.deploy();
        return { contract, owner };
    }

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const { contract, owner } = await loadFixture(deployFixture);
            expect(await contract.owner()).to.equal(owner.address);
        });
        it("Should send ether to constructor", async function() {
            const Contract = await ethers.getContractFactory("Payable");
            // deploy contract with 1 eth
            await Contract.deploy({value: ethers.utils.parseEther("1")});
        });
    });
    describe("Transfer", function () {
        it("Should transfer 1 ether to owner", async function () {
            const Contract = await ethers.getContractFactory("Payable");
            // deploy contract with 1 eth
            const contract = await Contract.deploy({value: ethers.utils.parseEther("1")});
            const [owner,] = await ethers.getSigners();
            console.log(ethers.utils.formatEther(await ethers.provider.getBalance(owner.address)));
            await contract.transfer(owner.address, ethers.utils.parseEther("1")); 
            console.log(ethers.utils.formatEther(await ethers.provider.getBalance(owner.address)));
        });
    });
});
