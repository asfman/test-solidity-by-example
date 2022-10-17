import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("AbiDecode", function () {
    async function deployFixture() {

        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const Contract = await ethers.getContractFactory("AbiDecode");
        const contract = await Contract.deploy();
        return { contract, owner };
    }
    describe("EncodeDecode", function () {
        it("Should decode right", async function () {
            const { contract, owner } = await loadFixture(deployFixture);
            const encodeData = new ethers.utils.AbiCoder().encode(["uint", "address"], [123, owner.address]);
            console.log(encodeData);
            console.log(new ethers.utils.AbiCoder().decode(["uint", "address"], encodeData));
            await expect(contract.encode(123, owner.address)).to.emit(contract, "Encode").withArgs(encodeData);
            await expect(contract.decode(encodeData)).to.emit(contract, "Decode").withArgs(123, owner.address); 
        });
    });
});