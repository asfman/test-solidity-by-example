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

        const Contract = await ethers.getContractFactory("EtherWallet");
        const contract = await Contract.deploy({value: ethers.utils.parseEther("10")});
        return { contract, owner, otherAccount };
    }

    describe("Withdraw", function () {
        it("only owner can withdraw the balance", async function () {
            const { contract, owner, otherAccount } = await loadFixture(deployFixture);
            console.log("owner balance ", ethers.utils.formatEther(await ethers.provider.getBalance(owner.address)));
            console.log("contract balance ", ethers.utils.formatEther(await contract.getBalance()));
            const oneEther = ethers.utils.parseEther("1");
            // we are using .connect(anotherAccount) to call the method from a different address.
            await expect(contract.withdraw(oneEther)).to.be.not.rejected;
            await expect(contract.connect(otherAccount).withdraw(oneEther)).to.be.rejected;
            await expect(contract.connect(owner).withdraw(oneEther.add(oneEther))).to.be.not.rejected;
            console.log("owner balance ", ethers.utils.formatEther(await ethers.provider.getBalance(owner.address)));
            console.log("contract balance ", ethers.utils.formatEther(await contract.getBalance()));
        });
    });
});
