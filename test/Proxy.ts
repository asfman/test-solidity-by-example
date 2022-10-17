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

        const Contract = await ethers.getContractFactory("Proxy");
        const contract = await Contract.deploy();
        const Helper = await ethers.getContractFactory("Helper");
        const helper = await Helper.deploy();
        return { contract, helper, owner, otherAccount };
    }

    describe("Deploy TestContract1", function () {
        it("change owner", async function () {
            const { contract, helper, owner, otherAccount } = await loadFixture(deployFixture);
            let capturedValue
            const captureValue = (value: any) => {
                capturedValue = value
                return true
            }
            const tx = await contract.deploy(await helper.getBytecode1());
            const res = await tx.wait();
            const deployEvent = res.events.find((evt: any) => evt.event == "Deploy");
            const testContract1Addr = deployEvent.args[0];
            console.log(testContract1Addr);
            const testContract = new ethers.Contract(testContract1Addr, 
                ["function owner() public view returns (address)", "function setOwner(address _owner) public"],
                 ethers.provider);
            expect(await testContract.owner()).equal(contract.address);
            await contract.execute(testContract1Addr, await helper.getCalldata(otherAccount.address));
            expect(await testContract.owner()).equal(otherAccount.address);
            await testContract.connect(otherAccount).setOwner(owner.address);
            expect(await testContract.owner()).equal(owner.address);
        });
    });

});
