import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MetaCoinModule", (m) => {
  const MetaCoin = m.contract("MetaCoin");
  return { MetaCoin };
});
