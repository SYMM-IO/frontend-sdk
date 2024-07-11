export enum SupportedChainId {
  NOT_SET = 0,
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  BSC = 56,
  BASE = 8453,
  BSC_TESTNET = 97,
  POLYGON = 137,
  FANTOM = 250,
  ARBITRUM = 42161,
  MANTLE = 5000,
  BLAST = 81457,
}

export const SUPPORTED_CHAIN_IDS: SupportedChainId[] = Object.values(
  SupportedChainId
).filter((id) => typeof id === "number") as SupportedChainId[];

export function isSupportedChain(
  chainId: number | null | undefined
): chainId is SupportedChainId {
  return !!chainId && !!SupportedChainId[chainId];
}

export const CHAIN_IDS_TO_NAMES = {
  [SupportedChainId.MAINNET]: "mainnet",
  [SupportedChainId.ROPSTEN]: "ropsten",
  [SupportedChainId.RINKEBY]: "rinkeby",
  [SupportedChainId.POLYGON]: "polygon",
  [SupportedChainId.ARBITRUM]: "arbitrum",
  [SupportedChainId.FANTOM]: "fantom",
  [SupportedChainId.BSC]: "bsc",
  [SupportedChainId.BSC_TESTNET]: "bsc-testnet",
  [SupportedChainId.BASE]: "base",
  [SupportedChainId.MANTLE]: "mantle",
  [SupportedChainId.BLAST]: "blast",
};

/**
 * All the chain IDs that are running the Ethereum protocol.
 */
export const L1_CHAIN_IDS = [
  SupportedChainId.MAINNET,
  SupportedChainId.ROPSTEN,
  SupportedChainId.RINKEBY,
  SupportedChainId.POLYGON,
] as const;

export type SupportedL1ChainId = (typeof L1_CHAIN_IDS)[number];

/**
 * Controls some L2 specific behavior, e.g. slippage tolerance, special UI behavior.
 * The expectation is that all of these networks have immediate transaction confirmation.
 */
export const L2_CHAIN_IDS = [
  SupportedChainId.ARBITRUM,
  SupportedChainId.BASE,
  SupportedChainId.BSC,
  SupportedChainId.FANTOM,
  SupportedChainId.BSC_TESTNET,
  SupportedChainId.MANTLE,
  SupportedChainId.BLAST,
] as const;

export type SupportedL2ChainId = (typeof L2_CHAIN_IDS)[number];
