import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("ERC20", function () {
    async function deployFixture() {
        const [signer, otherAccount] = await ethers.getSigners();
        const MyNFT = await ethers.getContractFactory("MyNFT");
        const myNFT = await MyNFT.deploy();
        return { myNFT, signer, otherAccount };
    }
    describe("Mint", function () {
        it("Mint 2 NFT", async function () {
            const { myNFT, signer, otherAccount } = await loadFixture(deployFixture);
            await myNFT.mint(otherAccount.address, 1);
            await expect(myNFT.mint(otherAccount.address, 2)).to.not.be.rejected;

            const owner1 = await myNFT.ownerOf(1);
            expect(otherAccount.address).equal(owner1);

        });
    });
    describe("Transfer", function () {
        it("Transfer NFT from one account to another account", async function () {
            const { myNFT, signer, otherAccount } = await loadFixture(deployFixture);
            await myNFT.mint(otherAccount.address, 1);
            await myNFT.mint(otherAccount.address, 2);
            await myNFT.connect(otherAccount).approve(signer.address, 2);
            await myNFT.connect(signer).transferFrom(otherAccount.address, signer.address, 2);
            expect(await myNFT.ownerOf(2)).equal(signer.address);
        });
    });
});
