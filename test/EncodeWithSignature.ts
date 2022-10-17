import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("EncodeWithSignature", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployFixture() {

        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const Caller = await ethers.getContractFactory("Caller");
        const caller = await Caller.deploy();
        const Callee = await ethers.getContractFactory("Callee");
        const callee = await Callee.deploy();
        return { caller, callee, owner };
    }

    describe("CallExistMethods", function () {
        it("Should get the right address", async function () {
            const { caller, callee, owner } = await loadFixture(deployFixture);
            await expect(caller.call(callee.address)).to.emit(caller, "Log").withArgs(caller.address);
        });
    });
    describe("CallNotExistMethods", function () {
        it("Should revert", async function () {
            const { caller, callee, owner } = await loadFixture(deployFixture);
            await expect(caller.call(caller.address)).to.be.rejected;
        });
    });
    describe("DelegateCallExistMethods", function () {
        it("Should get the right address", async function () {
            const { caller, callee, owner } = await loadFixture(deployFixture);
            await expect(caller.delegatecall(callee.address)).to.emit(caller, "Log").withArgs(owner.address);
        });
    });
    describe("CallExistMethodWithArgs", function () {
        it("Should success", async function () {
            const { caller, callee, owner } = await loadFixture(deployFixture);
            await expect(caller.callwithargs(callee.address)).to.be.not.rejected;
        });
    });
});
