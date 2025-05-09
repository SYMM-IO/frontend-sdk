import { SupportedChainId } from "@symmio/frontend-sdk/constants/chains";
import {
  bsc,
  fantom,
  base,
  polygon,
  arbitrum,
  mainnet,
  mantle,
  blast,
  Chain,
} from "wagmi/chains";
import { FrontEndsName } from "./addresses";
import { iota } from "./customChains";

const supportedWagmiChain = {
  [SupportedChainId.FANTOM]: fantom,
  [SupportedChainId.BSC]: bsc,
  [SupportedChainId.BASE]: base,
  [SupportedChainId.POLYGON]: polygon,
  [SupportedChainId.ARBITRUM]: arbitrum,
  [SupportedChainId.MAINNET]: mainnet,
  [SupportedChainId.MANTLE]: mantle,
  [SupportedChainId.BLAST]: blast,
  [SupportedChainId.IOTA]: iota,
};

function getWagmiChain(supportChainList: number[]): Chain[] {
  return supportChainList.map((chainId) => supportedWagmiChain[chainId]);
}

export const WEBSOCKET_RPC_URLS: { [key in SupportedChainId]?: string } = {
  [SupportedChainId.POLYGON]: "wss://polygon-bor-rpc.publicnode.com",
  [SupportedChainId.BSC]: "wss://bsc-rpc.publicnode.com",
  [SupportedChainId.MANTLE]: "wss://mantle-rpc.publicnode.com",
  [SupportedChainId.BASE]: "wss://base-rpc.publicnode.com",
  [SupportedChainId.BLAST]: "wss://blast.drpc.org",
};

export const ClientChain = [
  SupportedChainId.POLYGON,
  SupportedChainId.BSC,
  SupportedChainId.MANTLE,
  SupportedChainId.BASE,
  SupportedChainId.BLAST,
  SupportedChainId.IOTA,
];

export const ALL_CHAINS = Object.values(supportedWagmiChain);

export const APP_CHAINS = getWagmiChain(ClientChain);

export const FALLBACK_CHAIN_ID = SupportedChainId.POLYGON;
export const FALLBACK_FE_NAME = FrontEndsName.CLOVERFIELD;
