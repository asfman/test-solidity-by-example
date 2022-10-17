import { expect } from "chai";
import { ethers } from "hardhat";


describe("VerifySignature", function () {
    it("check signature", async function () {
        const [signer, otherAccount] = await ethers.getSigners();
        const Contract = await ethers.getContractFactory("VerifySignature");
        const contract = await Contract.deploy();
        await contract.deployed();

        const to = otherAccount.address;
        const amount = 888;
        const message = "asfman";
        const nonce = 123;

        const hash = await contract.getMessageHash(to, amount, message, nonce);
        console.log("hash: ", hash);

        // const sig = await signer.signMessage(ethers.utils.arrayify(hash));
        // console.log("sig           ", sig);
  
        // const sig2 = await ethers.provider.send("personal_sign", [ethers.utils.hexlify(hash), signer.address]);
        // console.log("personal_sign ", sig2);

        const ethHash = await contract.getEthSignedMessageHash(hash);
        // 本地对ETHSignedMessageHash返回值签名
        const signingKey = new ethers.utils.SigningKey("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
        const sig = ethers.utils.joinSignature(signingKey.signDigest(ethers.utils.hexlify(ethHash)));
        console.log("sig          ", sig);

        const recoverSigner = await contract.recoverSigner(ethHash, sig);
        console.log("reover signer  ", recoverSigner);
        console.log("signer address ", signer.address);
        expect(signer.address).to.equal(recoverSigner);
 
        expect(await contract.verify(signer.address, to, amount, message, nonce, sig)).to.be.true;
        expect(await contract.verify(signer.address, to, amount + 1, message, nonce, sig)).to.be.false;
    });
});
