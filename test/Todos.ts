import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Todos", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployTodosFixture() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("Todos");
    const contract = await Contract.deploy();
    return contract;
  }

  describe("Create", function () {
    it("Should create todo", async function () {
      const contract = await loadFixture(deployTodosFixture);

      const todoText = "zhs";
      await contract.create(todoText);
      const [ text, completed ] = await contract.get(0);
      expect(text).to.equal(todoText);
      expect(completed).to.equal(false);
    });
    it("Should update todo's text", async function () {
      const contract = await loadFixture(deployTodosFixture);
      const todoText = "zhs";
      const todoText2 = "zhs2";
      await contract.create(todoText);
      await contract.updateText(0, todoText2);
      const [ text, _ ] = await contract.get(0);
      expect(text).to.equal(todoText2);
    });
    it("Should update todo's completed", async function () {
      const contract = await loadFixture(deployTodosFixture);
      const todoText = "zhs";
      await contract.create(todoText);
      await contract.toggleCompleted(0);
      const [ _, completed ] = await contract.get(0);
      expect(completed).to.equal(true);
    });

  });

});
