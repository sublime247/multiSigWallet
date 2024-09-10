import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const MultiSigModule = buildModule("MultiSigModule", (m) => {


  const multiSig = m.contract("Lock");

  return { multiSig };
});

export default MultiSigModule;
