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
  mode,
} from "wagmi/chains";
import { FrontEndsName } from "./addresses";

const supportedWagmiChain = {
  [SupportedChainId.FANTOM]: fantom,
  [SupportedChainId.BSC]: bsc,
  [SupportedChainId.BASE]: base,
  [SupportedChainId.POLYGON]: polygon,
  [SupportedChainId.ARBITRUM]: arbitrum,
  [SupportedChainId.MAINNET]: mainnet,
  [SupportedChainId.MANTLE]: mantle,
  [SupportedChainId.BLAST]: blast,
  [SupportedChainId.MODE]: mode,
};

function getWagmiChain(supportChainList: number[]): Chain[] {
  return supportChainList.map((chainId) => supportedWagmiChain[chainId]);
}

export const WEBSOCKET_RPC_URLS: { [key in SupportedChainId]?: string } = {
  [SupportedChainId.POLYGON]: "wss://polygon.drpc.org",
  [SupportedChainId.BSC]: "wss://bsc-rpc.publicnode.com",
  [SupportedChainId.MANTLE]: "wss://mantle-rpc.publicnode.com",
  [SupportedChainId.BASE]: "wss://base-rpc.publicnode.com",
  [SupportedChainId.BLAST]: "wss://blast.drpc.org",
  [SupportedChainId.ARBITRUM]: "wss://arbitrum-one-rpc.publicnode.com",
};

export const ClientChain = [
  SupportedChainId.POLYGON,
  SupportedChainId.BSC,
  SupportedChainId.MANTLE,
  SupportedChainId.BASE,
  SupportedChainId.BLAST,
  SupportedChainId.MODE,
  SupportedChainId.ARBITRUM,
];

export const ALL_CHAINS = Object.values(supportedWagmiChain);

export const APP_CHAINS = getWagmiChain(ClientChain);

export const FALLBACK_CHAIN_ID = SupportedChainId.POLYGON;
export const FALLBACK_FE_NAME = FrontEndsName.ORBS;
