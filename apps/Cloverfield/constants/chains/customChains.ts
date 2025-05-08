import { type Chain } from "viem";

export const iota = {
  id: 8822,
  name: "Iota",
  nativeCurrency: {
    name: "IOTA",
    symbol: "IOTA",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://rpc.ankr.com/iota_evm"] },
  },
  blockExplorers: {
    default: { name: "IOTA Explorer", url: "https://explorer.evm.iota.org/" },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 25022,
    },
  },
} as const satisfies Chain;
// ens
