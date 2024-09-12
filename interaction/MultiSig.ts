import { ethers } from "hardhat";

async function main() {
    // Fetch the signers from ethers and log them for debugging
    const signers = await ethers.getSigners();

    // Assign each signer to a variable for later use
    const [owner, owner1, owner2,owner3,owner4] = signers;


    const MSTtokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const MST = await ethers.getContractAt("IERC20", MSTtokenAddress);

    const MultiSigAddress = "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE";
    const MultiSig = await ethers.getContractAt("IMultiSig", MultiSigAddress, owner);

    console.log("Signer1::", owner.address);
    console.log("Signer2::", owner1.address);
    console.log("Signer3::", owner2.address);
    console.log("Signer4::", owner3.address)
    console.log("Signer5::", owner4.address);


    // Specify the amount to transfer (e.g., 1000 MST)
    // const trfAmt = ethers.parseUnits("1000", 18);

    // Transfer 1000 MST tokens from owner to the MultiSig contract
    // const trf = await MST.transfer(MultiSigAddress, trfAmt);
    // await trf.wait();
    // console.log(`Transferred 1000 MST tokens to MultiSig contract. Transaction hash: ${trf.hash}`);

    // Check MultiSig contract's token balance after transfer

    // check contract balance before any operations

    // const _trf = await MST.balanceOf(MultiSigAddress);
    // console.log("Balance of multisig contract to interact::", _trf);
    // console.log(await MST.totalSupply());


    // propose a traansfer transaction 
    // const trfAmount =  ethers.parseUnits("10", 18);
    // const recipient = "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E";
    // const trx = await MultiSig.connect(owner).transfer(recipient, trfAmount, MST);
    // console.log(trx);
    // //  Removed the erroneous line
    //  await trx.wait();

    //   Propose a withdraw Trasaction;
    
    // const withdrawAmt = ethers.parseUnits("30", 18);
    // const withtrx = await MultiSig.connect(owner2).withdraw(withdrawAmt, MSTtokenAddress);
    // console.log(withdrawAmt);
    // await withtrx.wait();

    //  propose to updateQuorum;
    // const trx = await MultiSig.connect(owner).updateQorum(2);
    // // console.log(trx);
    // await trx.wait();

    // // other signers should approve the transaction
    // const trxId = 4;
    // const approveTx1 = await MultiSig.connect(owner).approveTransaction(trxId);
    // await approveTx1.wait()
    // console.log("approveTx1::", approveTx1.hash);
    // const approveTx2 = await MultiSig.connect(owner2).approveTransaction(trxId);
    // await approveTx2.wait()
    // console.log("approveTx2::", approveTx2.hash);
    // const approveTx3 = await MultiSig.connect(owner3).approveTransaction(trxId);
    // await approveTx3.wait()
    // console.log("approveTx3::", approveTx3.hash);
    // const approveTx4 = await MultiSig.connect(owner4).approveTransaction(trxId);
    // await approveTx4.wait()
    // // console.log("approveTx4::", approveTx4.hash);
    // Now check the balance of the recipient and balance of the contract;




    // const recipientBalance = await MST.balanceOf(recipient);
    // console.log("Balance of recipient after transaction:", ethers.formatUnits(recipientBalance, 18));


    const finalContractBalance = await MST.balanceOf(MultiSigAddress);
    console.log("Final balance of contract after transaction:", ethers.formatUnits(finalContractBalance, 18));
}






main().catch(error => {
    console.error("Error:", error);
    process.exit(1);
});
