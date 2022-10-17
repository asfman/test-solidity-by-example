import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("AbiEncode", function () {
    async function deployFixture() {

        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const Contract = await ethers.getContractFactory("Keccak");
        const contract = await Contract.deploy();
        return { contract, owner };
    }
    async function deployGuessFixture() {

        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const Contract = await ethers.getContractFactory("GuessTheMagicWord");
        const guess = await Contract.deploy();
        return { guess, owner };
    }
    describe("EncodePacked", function () {
        it("Should happen collision", async function () {
            const { contract, owner } = await loadFixture(deployFixture);
            const encodeData = ethers.utils.solidityKeccak256(["string", "string"], ["AA", "ABB"]);
            const encodeData2 = ethers.utils.solidityKeccak256(["string", "string"], ["AAA", "BB"]);
            console.log("solidityKeccak256 AA, ABB  ", encodeData);
            console.log("solidityKeccak256 AAA, BB  ", encodeData2);
            console.log("collision AA, ABB          ", await contract.collision("AA", "ABB"));
            console.log("collision AAA, BB          ", await contract.collision("AAA", "BB"));
            expect(await contract.collision("AA", "ABB")).to.equal(encodeData);
            expect(await contract.collision("AAA", "BB")).to.equal(encodeData2);
            // await expect(contract.collision("AA", "ABB")).to.emit(contract, "Response").withArgs(encodeData);
            // await expect(contract.collision("AAA", "BB")).to.emit(contract, "Response").withArgs(encodeData2);
        });
    });

    describe("GuessTheMagicWorld", function () {
        it("Should guess the right answer", async function () {
            const { guess } = await loadFixture(deployGuessFixture);
            await expect(guess.guess("Solidity")).to.emit(guess, "Guess").withArgs(true);
        });
        it("Should not guess the right answer", async function () {
            const { guess } = await loadFixture(deployGuessFixture);
            await expect(guess.guess("Asfman")).to.emit(guess, "Guess").withArgs(false);
        });  
    });
});