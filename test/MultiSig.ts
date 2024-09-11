import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("MultiSig", function () {
  async function deployToken() {
    const [owner] = await hre.ethers.getSigners();
    const KSHToken = await hre.ethers.getContractFactory("MST");
    const token = await KSHToken.deploy();
    
    return { token, owner };
}
  async function deployMultiSig() {
      
    const [owner, owner6, owner2, owner1, owner3, owner4, owner5, owner7] = await hre.ethers.getSigners();
    const MultiSig = await hre.ethers.getContractFactory("MultiSig");
    const qorum = 4
    const multiSig = await MultiSig.deploy(qorum, [owner6, owner2, owner1, owner3, owner4, owner5]);
    const {token} = await loadFixture(deployToken);
    await token.transfer(multiSig, hre.ethers.parseUnits("100", 18));
    return { owner, token, qorum, owner6, owner2, owner1, owner3, owner4, owner5, owner7, multiSig };  
  }
  describe("Deployment", function () {
    it("Should check if qorum is set correctly", async function () {
      const { token, owner, multiSig, qorum} = await loadFixture(deployMultiSig);
      expect(await multiSig.qorum()).to.equal(qorum).revertedWith("NotAValidQorum");
    });
    it("Should check if signers are set correctly", async function () {
      const { multiSig,  owner6, owner2, owner1, owner3, owner4, owner5 } = await loadFixture(deployMultiSig);
      
      const signers = await Promise.all([
        multiSig.signers(0),
        multiSig.signers(1),
        multiSig.signers(2),
        multiSig.signers(3),
        multiSig.signers(4),
        multiSig.signers(5),
      ]);
      const expectedSigners = [
        owner6.address,
        owner2.address,
        owner1.address,
        owner3.address,
        owner4.address,
        owner5.address,
      ];

      expect(signers).to.deep.equal(expectedSigners);
    });
  });


  describe("Transfer",  function () {

    it("Should check if address is not address zero", async function () {
      
      const { token, owner, multiSig, qorum, owner6, owner1 } = await loadFixture(deployMultiSig);
      const amount = hre.ethers.parseUnits("100", 18);
      await multiSig.connect(owner).transfer(owner6, amount, token);
       
      const trx = await multiSig.transactions(1);
      expect(trx.sender).to.not.equal("0x00000000000000000000000")
      expect(trx.recipient).to.equal(owner6.address);
      expect(trx.id).to.equal(1);
      expect(trx.sender).to.equal(owner.address)
   
    });
    it("Should check if transferFunction is created correctly", async function () {
      
      const { token, owner, multiSig, qorum, owner6, owner1 } = await loadFixture(deployMultiSig);
      const amount = hre.ethers.parseUnits("100", 18);
      await multiSig.connect(owner).transfer(owner6, amount, token);
       
      const trx = await multiSig.transactions(1);
      expect(trx.recipient).to.equal(owner6.address);
      expect(trx.id).to.equal(1);
      expect(trx.sender).to.equal(owner.address)
   
    });
    
    
  });

  describe("Approve Transaction",  function () {
    it("Should prevent signers to approve transaction twice", async function () {
      const { token, owner, multiSig, qorum, owner6, owner1, owner2, owner3, owner4, owner5 } = await loadFixture(deployMultiSig);
      const amount = hre.ethers.parseUnits("50", 18);
      await multiSig.connect(owner).transfer(owner1.address, amount, token);
      // await multiSig.approveTransaction(1);
     await expect( multiSig.connect(owner).approveTransaction(1)).to.be.revertedWithCustomError(multiSig, "CannotSignTransactionTwice");
      
    });
    it("Should allow a signer approve transaction", async function () {
      const { token, owner, multiSig, qorum, owner6, owner1, owner2, owner3, owner4, owner5 } = await loadFixture(deployMultiSig);
      const amount = hre.ethers.parseUnits("50", 18);
      await multiSig.connect(owner).transfer(owner, amount, token);
      await expect( multiSig.approveTransaction(1)).to.be.revertedWithCustomError(multiSig, "CannotSignTransactionTwice");
      
      const trx = await multiSig.transactions(1);
      expect(trx.numberOfApproval).to.equal(1);
      expect(trx.isCompleted).to.equal(false);
    });

    it("Should allow other valid signers approve transaction", async function () {
      const { token, owner, multiSig, qorum, owner6, owner1, owner2, owner3, owner4, owner5 } = await loadFixture(deployMultiSig);
      const amount = hre.ethers.parseUnits("50", 18);
      await multiSig.connect(owner).transfer(owner1.address, amount, token);
      await multiSig.connect(owner1).approveTransaction(1);
      await multiSig.connect(owner2).approveTransaction(1);
      await multiSig.connect(owner3).approveTransaction(1);

      const trx = await multiSig.transactions(1);
      expect(trx.numberOfApproval).to.be.equal(4);
      expect(trx.isCompleted).to.be.equal(true);
    });
    it("Should allow other valid signers approve quorom", async function () {
      const { token, owner, multiSig, qorum, owner6, owner1, owner2, owner3, owner4, owner5 } = await loadFixture(deployMultiSig);
      await multiSig.connect(owner).updateQorum(4);
      await multiSig.connect(owner1).approveTransaction(1);
      await multiSig.connect(owner2).approveTransaction(1);
      await multiSig.connect(owner3).approveTransaction(1);

      const trx = await multiSig.transactions(1);
      expect(trx.numberOfApproval).to.be.equal(4);
      expect(trx.isCompleted).to.be.equal(true);
    });
    });
  describe("WithdrawFunction", function () {
    it("it Should check if withdrawalFunction is created correctly", async function () {
      const {token, owner, owner1, owner2, owner3, owner4, owner5, owner6, multiSig} = await  loadFixture(deployMultiSig);
      const amount =  hre.ethers.parseUnits("100", 18);
      await multiSig.connect(owner).transfer(owner, amount, token);
      const trx = await multiSig.transactions(1);
      expect(trx.id).to.equal(1);
      expect(trx.recipient).to.equal(owner.address);
      expect(trx.sender).to.equal(trx.sender);
    });
  });

  describe("UpdateQorumFunction", function () {
    it("Should check if Qorum is set correctly", async function () {
      const { token, owner, multiSig, qorum, owner6, owner1, owner2, owner3, owner4, owner5 } = await loadFixture(deployMultiSig);
      const newQorum = 4;
      await multiSig.connect(owner).updateQorum(newQorum);
      const nQ = await multiSig.transactions(1);
      expect(nQ.trxType).to.equal(1);
      expect(nQ.isCompleted).to.equal(false);
      expect(nQ.numberOfApproval).to.equal(1);
      expect(nQ.proposedQuorom).to.equal(4);

    });
  });

  describe("AddSignerFunction", function () {
    it("Should check if Signer is added correctly", async function () {
      const { token, owner, multiSig, qorum, owner6, owner1, owner2, owner3, owner4, owner5 } = await loadFixture(deployMultiSig);
      await multiSig.connect(owner).addSigners(owner6);
      const nQ = await multiSig.transactions(1);
      expect(nQ.trxType).to.equal(2);
      expect(nQ.isCompleted).to.equal(false);
      expect(nQ.numberOfApproval).to.equal(1);
      expect(nQ.newSigner).to.equal(owner6);

    });
    it("Should allow other valid signers approve newSigner", async function () {
      const { token, owner, multiSig, qorum, owner6, owner1, owner2, owner3, owner4, owner5 } = await loadFixture(deployMultiSig);
      await multiSig.connect(owner).addSigners(owner6);
      await multiSig.connect(owner1).approveTransaction(1);
      await multiSig.connect(owner2).approveTransaction(1);
      await multiSig.connect(owner3).approveTransaction(1);

      const trx = await multiSig.transactions(1);
      expect(trx.numberOfApproval).to.be.equal(4);
      expect(trx.isCompleted).to.be.equal(true);
    });
  });
});
