import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("AbiEncode", function () {
    async function deployFixture() {

        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const Contract = await ethers.getContractFactory("AbiEncode");
        const abiEncode = await Contract.deploy();
        const Token = await ethers.getContractFactory("Token");
        const token = await Token.deploy();
        return { abiEncode, token, owner };
    }
    describe("EncodeDecode", function () {
        it("encodeWithSignature", async function () {
            const { abiEncode, token, owner } = await loadFixture(deployFixture);
            const callData = await abiEncode.encodeWithSignature(owner.address, 123);
            console.log(callData);
            await abiEncode.test(token.address, callData);
        });
        it("encodeWithSelector", async function () {
            const { abiEncode, token, owner } = await loadFixture(deployFixture);
            const callData = await abiEncode.encodeWithSelector(owner.address, 123);
            console.log(callData);
            await abiEncode.test(token.address, callData);
        });
        it("encodeCall", async function () {
            const { abiEncode, token, owner } = await loadFixture(deployFixture);
            const callData = await abiEncode.encodeCall(owner.address, 123);
            console.log(callData);
            await abiEncode.test(token.address, callData);
        });
    });
});