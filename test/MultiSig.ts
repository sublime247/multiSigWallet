import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("MultiSig", function () {
  async function deployMultiSig() {
      
    const [owner, token, otherAccount, otherAccount1, otherAccount2, otherAccount3, otherAccount4, otherAccount5] = await hre.ethers.getSigners();
    const MultiSig = await hre.ethers.getContractFactory("MultiSig");
    const qorum = 4
    const multiSig = await MultiSig.deploy( qorum,[otherAccount,otherAccount1,otherAccount2,otherAccount3,otherAccount4,otherAccount5])
    return { owner, token, qorum, otherAccount, otherAccount1, otherAccount2, otherAccount3, otherAccount4, otherAccount5, multiSig };  
  }
  describe("Deployment", function () {
    it("Should check if qorum is set correctly", async function () {
      const { token, owner, multiSig, qorum} = await loadFixture(deployMultiSig);
      expect(await multiSig.qorum()).to.equal(qorum);
    });
    it("Should check if signers are set correctly", async function () {
      const { multiSig, otherAccount, otherAccount1, otherAccount2, otherAccount3, otherAccount4, otherAccount5 } = await loadFixture(deployMultiSig);
      
      const signers = await Promise.all([
        multiSig.signers(0),
        multiSig.signers(1),
        multiSig.signers(2),
        multiSig.signers(3),
        multiSig.signers(4),
        multiSig.signers(5),
      ]);
      const expectedSigners = [
        otherAccount.address,
        otherAccount1.address,
        otherAccount2.address,
        otherAccount3.address,
        otherAccount4.address,
        otherAccount5.address,
      ];

      expect(signers).to.deep.equal(expectedSigners);
    });
  });


  // describe("Transaction", async function () {

  //   it("Should check if transaction is created correctly", async function () {
      
  //     const { token, owner, multiSig, qorum, otherAccount, otherAccount2 } = await loadFixture(deployMultiSig);
  //     const amount =  hre.ethers.parseUnits("1000")
  //     const tokenAddress = "0x1234567890123456789012345678901234567890";
  //     await multiSig.connect(owner).transfer(otherAccount, amount, tokenAddress);
  
  //     const trx = await multiSig.transactions(1);
  //     expect(trx.recipient).to.equal(otherAccount.address);
  //   });
    
    
  // });

});
