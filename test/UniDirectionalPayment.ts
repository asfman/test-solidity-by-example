import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Proxy", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployFixture() {

        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const Contract = await ethers.getContractFactory("UniDirectionalPaymentChannel");
        const contract = await Contract.deploy(otherAccount.address, { value: ethers.utils.parseEther("100") });
        return { contract, owner, otherAccount };
    }

    describe("UniDirectionalPayment", function () {
        it("close", async function () {
            const ethAmount = ethers.utils.parseEther("100");
            const { contract, owner, otherAccount } = await loadFixture(deployFixture);
            const hash = await contract.getHash(ethAmount);
            const sig = await owner.signMessage(ethers.utils.arrayify(hash));
            console.log("sig ", sig);
            expect(await contract.verify(ethAmount, sig)).equal(true);
            console.log("before ", ethers.utils.formatEther(await ethers.provider.getBalance(otherAccount.address)));
            await contract.connect(otherAccount).close(ethAmount, sig);
            console.log("after ", ethers.utils.formatEther(await ethers.provider.getBalance(otherAccount.address)));
        });
        it("cancel", async function () {
            const { contract, owner, otherAccount } = await loadFixture(deployFixture);
            console.log("before ", ethers.utils.formatEther(await ethers.provider.getBalance(owner.address)));
            await new Promise((resolve) => {
                setTimeout(resolve, 7000);
            });
            await contract.cancel();
            console.log("after ", ethers.utils.formatEther(await ethers.provider.getBalance(owner.address)));
        });
    });

});
