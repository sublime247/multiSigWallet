import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const MultiSigModule = buildModule("MultiSigModule", (m) => {
  const quorum = 4;
  const signers = [
   "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
   "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
  ];

 
  const multiSig = m.contract("MultiSig", [quorum, signers]);

  return { multiSig };
});

export default MultiSigModule;
