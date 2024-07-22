import { StaticImageData } from "next/legacy/image";
import {
  SupportedChainId,
  isSupportedChain,
} from "@symmio/frontend-sdk/constants/chains";
export const ChainInfo: { [chainId: number]: StaticImageData } = {
  [SupportedChainId.MAINNET]: require("/public/static/images/networks/mainnet.svg"),
  [SupportedChainId.ROPSTEN]: require("/public/static/images/networks/mainnet.svg"),
  [SupportedChainId.RINKEBY]: require("/public/static/images/networks/mainnet.svg"),
  [SupportedChainId.BSC]: require("/public/static/images/networks/binance.svg"),
  [SupportedChainId.BSC_TESTNET]: require("/public/static/images/networks/binance.svg"),
  [SupportedChainId.POLYGON]: require("/public/static/images/networks/polygon.svg"),
  [SupportedChainId.FANTOM]: require("/public/static/images/networks/fantom.svg"),
  [SupportedChainId.ARBITRUM]: require("/public/static/images/networks/arbitrum.png"),
  [SupportedChainId.BASE]: require("/public/static/images/networks/base.png"),
  [SupportedChainId.MANTLE]: require("/public/static/images/networks/mantle.svg"),
  [SupportedChainId.BLAST]: require("/public/static/images/networks/blast.svg"),
};

export function getChainLogo(chainId: number | undefined): any {
  if (chainId && isSupportedChain(chainId)) {
    return ChainInfo[chainId];
  }
  return undefined;
}
