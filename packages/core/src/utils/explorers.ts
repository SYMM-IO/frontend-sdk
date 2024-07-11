import { ChainInfo } from "../constants/chainInfo";
import { SupportedChainId } from "../constants/chains";

export enum ExplorerDataType {
  TRANSACTION = "transaction",
  TOKEN = "token",
  ADDRESS = "address",
}

export function getExplorerLink(
  chainId: SupportedChainId,
  type: ExplorerDataType,
  data: string,
  FALLBACK_CHAIN_ID: number
): string {
  const base =
    chainId in ChainInfo
      ? ChainInfo[chainId]["blockExplorerUrl"]
      : ChainInfo[FALLBACK_CHAIN_ID]["blockExplorerUrl"];
  switch (type) {
    case ExplorerDataType.TRANSACTION:
      return `${base}/tx/${data}`;
    case ExplorerDataType.ADDRESS:
      return `${base}/address/${data}`;
    case ExplorerDataType.TOKEN:
      return `${base}/token/${data}`;
    default:
      return base;
  }
}
