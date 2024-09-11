import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const MSTModule = buildModule("MSTModule", (m) => {


  const mst = m.contract("MST");

  return { mst };
});

export default MSTModule;
