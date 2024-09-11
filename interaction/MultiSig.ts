import { ethers } from "hardhat";

async function main() {
    const MSTtokenAddress = "0x6F65fF6081A40CfDe22fA0b70A886919FA0BEADD";
    const MST = await ethers.getContractAt("IERC20", MSTtokenAddress);

    const MultiSigAddress = "0xE2E6F7cD1B298762185274325E3C65cceBB285E6";
    const MultiSig = await ethers.getContractAt("IMultiSig", MultiSigAddress);

    const trfAmt = ethers.parseUnits("1000", 18);
    const trf = await MST.transfer(MultiSigAddress, trfAmt);
    console.log(`Transaction hash: ${trf.hash}`);
      await trf.wait();
    // console.log(`Transaction confirmed in block: ${blockNumber}`);

    // trasfer request
    const trfAmt1 = ethers.parseUnits("10", 18);
    const trfAmt2 = await MultiSig.transfer("0x617F2E2fD72FD9D5503197092aC168c91465E7f2", trfAmt1, MSTtokenAddress);
    console.log(trfAmt2);
    trfAmt2.wait();
} 

main().catch(error => {
    console.error("Error:", error);
    process.exit(1);
});
