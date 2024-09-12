import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import hre from "hardhat";

  
describe("MultiSigFactory", function () {
    async function deployToken() {
        const [owner] = await hre.ethers.getSigners();
        const KSHToken = await hre.ethers.getContractFactory("MST");
        const token = await KSHToken.deploy();
        return { token, owner };
    }
    async function deployMultiSigFactoryContract() {
        const [owner, owner1, owner2, owner3, owner4] = await hre.ethers.getSigners();
        const FactoryContract = await hre.ethers.getContractFactory("MultiSigFactory");
        const factoryContract = await FactoryContract.deploy();
        const { token } = await loadFixture(deployToken);
        const amt =  hre.ethers.parseUnits("1000", 18);
        token.transfer(factoryContract, amt);

        return { owner, owner1, owner2, owner3, owner4, factoryContract, token };

        

       
    }   
    
    describe("CreateMutisigWallet", function () {
        it("Should create a MultisgWallet", async function () {
            const { factoryContract, owner, owner1, owner2, owner3, owner4, token, } = await loadFixture(deployMultiSigFactoryContract);
            const qorum = 3
            await factoryContract.connect(owner).createMultiSigWallet(qorum, [owner1, owner2, owner3, owner4,]);
            const clones = await factoryContract.getMultiSigClones();
            expect(clones.length).to.equal(1);
    
            // expect(await factoryContract.createMultiSigWallet(qorum, [owner1, owner2, owner3, owner4])).to.be.f;
        });
        describe("MultiSigClones", function () {
            it("Should create a MultisgClone", async function () {
                const { factoryContract, owner, owner1, owner2, owner3, owner4, token, } = await loadFixture(deployMultiSigFactoryContract);
                const qorum = 3
                await factoryContract.connect(owner).createMultiSigWallet(qorum, [owner1, owner2, owner3, owner4,]);
                const _qorum = 4
                await factoryContract.connect(owner1).createMultiSigWallet(_qorum, [owner, owner2, owner3, owner4,]);
                const clones = await factoryContract.getMultiSigClones();
                expect(clones).to.have.lengthOf(2);
                
                
            });
        
        })
    });
});