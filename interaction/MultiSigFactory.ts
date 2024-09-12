import { ethers } from "hardhat";

async function main() {
    const [deployer, signer1, signer2, signer3, signer4] = await ethers.getSigners();
    const multifactoryAddress = "0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB";

    const multifactory = await ethers.getContractAt("MultiSigFactory", multifactoryAddress);
    const quorom = 3;
    const signers = [signer1.address, signer2.address, signer3.address, signer4.address]
    const signers1 = [signer1.address, signer2.address, signer3.address, signer4.address]
    
    // const CreateMutisigWallet = await multifactory.createMultiSigWallet(quorom, signers);
    // console.log(CreateMutisigWallet);
    // await CreateMutisigWallet.wait();
    const MSTtokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const MST = await ethers.getContractAt("IERC20", MSTtokenAddress);

    const multiSigClones = await multifactory.getMultiSigClones();
    console.log("Created MultiSig wallets:", multiSigClones.length-1);
    const singleClone = multiSigClones[0];
    const MultiSig = await ethers.getContractAt("IMultiSig", singleClone, deployer);



    // Transfer 1000 MST tokens from owner to the MultiSig contract
    // const trfAmt = ethers.parseUnits("1000", 18);
    // const trf = await MST.transfer(singleClone, trfAmt);
    // await trf.wait();
    // console.log(`Transferred 1000 MST tokens to MultiSig contract. Transaction hash: ${trf.hash}`);
    
    // console.log(await MST.balanceOf(singleClone));

    // propose a transfer function
    // const trfAmount =  ethers.parseUnits("10", 18);
    // const recipient = "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E";
    // const trx = await MultiSig.connect(signer1).transfer(recipient, trfAmount, MST);

    // console.log(trx);
    // await trx.wait();


        //   Propose a withdraw Trasaction;
    
    const withdrawAmt = ethers.parseUnits("30", 18);
    const withtrx = await MultiSig.connect(signer2).withdraw(withdrawAmt, MSTtokenAddress);
    console.log(withdrawAmt);
    await withtrx.wait();

    // other signers should approve the transaction
    // const trxId = 3;
    // const approveTx1 = await MultiSig.connect(signer2).approveTransaction(trxId);
    // await approveTx1.wait()
    // console.log("approveTx1::", approveTx1.hash);
    // const approveTx2 = await MultiSig.connect(signer3).approveTransaction(trxId);
    // await approveTx2.wait()

    console.log(await MST.balanceOf(signer2));

    
    



}


main().catch(error => {
    console.error("Error:", error);
    process.exit(1);
});
