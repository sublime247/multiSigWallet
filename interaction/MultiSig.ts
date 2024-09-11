import { ethers } from "hardhat";

async function main() {
    const MSTtokenAddress = "0x6F65fF6081A40CfDe22fA0b70A886919FA0BEADD";
    const MST = await ethers.getContractAt("IERC20", MSTtokenAddress);

    const MultiSigAddress = "0xE2E6F7cD1B298762185274325E3C65cceBB285E6";
    const MultiSig = await ethers.getContractAt("IMultiSig", MultiSigAddress);

    const trfAmt = ethers.parseUnits("100", 18);
    const trf = await MST.transfer(MultiSigAddress, trfAmt,);
    console.log(`Transaction hash: ${trf.hash}`);
    await trf.wait();
    // console.log(`Transaction confirmed in block: ${blockNumber}`);

    
} 

main().catch(error => {
    console.error("Error:", error);
    process.exit(1);
});
