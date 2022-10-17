import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Attack", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployFixture() {

        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const EtherStore = await ethers.getContractFactory("EtherStore");
        const etherStore = await EtherStore.deploy();

        const Attack = await ethers.getContractFactory("Attack");
        const attack = await Attack.deploy(etherStore.address);
        return { owner, etherStore, attack };
    }

    describe("attack", function () {
        it("Should return 1 ether", async function () {
            const { owner, etherStore, attack } = await loadFixture(deployFixture);
            //   await expect(attack.attack()).to.be.revertedWith("require 1 ether");
            // await expect(attack.attack({value: ethers.utils.parseEther("1")})).to.be.reverted;
            const oneEther = ethers.utils.parseEther("1");
            attack.attack({value: oneEther});
            const bl = await attack.getContractBalance();
            const bl2 = await ethers.provider.getBalance(attack.address);
            console.log(ethers.utils.formatEther(bl2));
            expect(oneEther).equal(bl);
            expect(oneEther).equal(bl2);
        });
        it("Should return 2 ether", async function () {
            const { owner, etherStore, attack } = await loadFixture(deployFixture);
            const oneEther = ethers.utils.parseEther("1");
            await etherStore.deposit({value: oneEther});
            expect(await etherStore.getContractBalance()).equal(oneEther);
            await expect(attack.attack({ value: oneEther })).to.be.rejected;
        });
    });

});
