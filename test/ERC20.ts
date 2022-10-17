import { expect } from "chai";
import { ethers } from "hardhat";


describe("ERC20", function () {
    it("Transfer", async function () {
        const [signer, otherAccount, anotherAccount] = await ethers.getSigners();
        const Contract = await ethers.getContractFactory("ERC20");
        const contract = await Contract.deploy("wangyuheng", "wyh");
        await contract.deployed();
        await contract.mint(ethers.utils.parseEther("1"));
        console.log(await contract.name(), await contract.symbol());
        console.log(await contract.balanceOf(signer.address));
        console.log(await contract.balanceOf(otherAccount.address));

        await contract.transfer(otherAccount.address, ethers.utils.parseEther("0.5"));
        console.log(await contract.balanceOf(signer.address));
        console.log(await contract.balanceOf(otherAccount.address));

        await expect(contract.transferFrom(otherAccount.address, signer.address, ethers.utils.parseEther("0.5"))).to.be.rejected;

        await contract.connect(otherAccount).approve(signer.address, ethers.utils.parseEther("0.5"));
        console.log("allowance ", await contract.allowance(otherAccount.address, signer.address));

        await contract.connect(signer).transferFrom(otherAccount.address, anotherAccount.address, ethers.utils.parseEther("0.5"))
        console.log(await contract.balanceOf(signer.address));
        console.log(await contract.balanceOf(otherAccount.address));
        console.log(await contract.balanceOf(anotherAccount.address));
    });
});
