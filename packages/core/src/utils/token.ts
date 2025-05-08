import { Ether, NativeCurrency, Token, Currency } from "@uniswap/sdk-core";
import invariant from "tiny-invariant";

import { WRAPPED_NATIVE_CURRENCY } from "../constants/tokens";
import { SupportedChainId } from "../constants/chains";
import { useFallbackChainId } from "../state/chains/hooks";
import { AddressMap, DecimalMap, SymbolMap } from "./address";
import { useV3Ids } from "../state/chains/hooks";

export const NATIVE_CHAIN_ID = "NATIVE";
export const DEFAULT_ERC20_DECIMALS = 18;

export type TokenMap = {
  [chainId: number]: Token;
};

export type TokenAddressMap = {
  [chainId: number]: { [address: string]: Token };
};

//generate same tokens by given AddressMap
export function duplicateTokenByAddressMap(
  addressMap: AddressMap,
  decimals: number,
  symbol: SymbolMap,
  name: SymbolMap,
  decimalMap: DecimalMap = {}
): TokenMap {
  return Object.keys(addressMap)
    .map((chainId) => Number(chainId)) //convert string to number because of the object.keys() always returns string
    .reduce((acc: TokenMap, chainId: number) => {
      acc[chainId] = new Token(
        chainId,
        addressMap[chainId],
        decimalMap[chainId] ?? decimals,
        symbol[chainId],
        name[chainId]
      );
      return acc;
    }, {});
}

export function useGetTokenWithFallbackChainId(
  tokenMap: TokenMap,
  chainId: number | undefined
): Token {
  const v3_ids = useV3Ids();
  const FALLBACK_CHAIN_ID = useFallbackChainId();
  if (chainId && v3_ids.includes(chainId)) return tokenMap[chainId];
  return tokenMap[FALLBACK_CHAIN_ID];
}

export function isBSC(chainId: number): boolean {
  return (
    chainId === SupportedChainId.BSC || chainId === SupportedChainId.BSC_TESTNET
  );
}

export function isFTM(chainId: number): chainId is SupportedChainId.FANTOM {
  return chainId === SupportedChainId.FANTOM;
}

export function isPolygon(
  chainId: number
): chainId is SupportedChainId.POLYGON {
  return chainId === SupportedChainId.POLYGON;
}

export function isMantle(chainId: number): chainId is SupportedChainId.MANTLE {
  return chainId === SupportedChainId.MANTLE;
}

export function isBASE(chainId: number): chainId is SupportedChainId.BASE {
  return chainId === SupportedChainId.BASE;
}

export function isBLAST(chainId: number): chainId is SupportedChainId.BLAST {
  return chainId === SupportedChainId.BLAST;
}

export function isIOTA(chainId: number): chainId is SupportedChainId.IOTA {
  return chainId === SupportedChainId.IOTA;
}

class BscNativeCurrency extends NativeCurrency {
  equals(other: Currency): boolean {
    return other.isNative && other.chainId === this.chainId;
  }

  get wrapped(): Token {
    if (!isBSC(this.chainId)) throw new Error("Not bnb");
    const wrapped = WRAPPED_NATIVE_CURRENCY[this.chainId];
    invariant(wrapped instanceof Token);
    return wrapped;
  }

  public constructor(chainId: number) {
    if (!isBSC(chainId)) throw new Error("Not bnb");
    super(chainId, 18, "BNB", "BNB");
  }
}

class MantleNativeCurrency extends NativeCurrency {
  equals(other: Currency): boolean {
    return other.isNative && other.chainId === this.chainId;
  }

  get wrapped(): Token {
    if (!isMantle(this.chainId)) throw new Error("Not Mantle");
    const wrapped = WRAPPED_NATIVE_CURRENCY[this.chainId];
    invariant(wrapped instanceof Token);
    return wrapped;
  }

  public constructor(chainId: number) {
    if (!isMantle(chainId)) throw new Error("Not Mantle");
    super(chainId, 18, "MANTLE", "MANTLE");
  }
}

class FtmNativeCurrency extends NativeCurrency {
  equals(other: Currency): boolean {
    return other.isNative && other.chainId === this.chainId;
  }

  get wrapped(): Token {
    if (!isFTM(this.chainId)) throw new Error("Not FTM");
    const wrapped = WRAPPED_NATIVE_CURRENCY[this.chainId];
    invariant(wrapped instanceof Token);
    return wrapped;
  }

  public constructor(chainId: number) {
    if (!isFTM(chainId)) throw new Error("Not FTM");
    super(chainId, 18, "FTM", "FTM");
  }
}

class PolygonNativeCurrency extends NativeCurrency {
  equals(other: Currency): boolean {
    return other.isNative && other.chainId === this.chainId;
  }

  get wrapped(): Token {
    if (!isPolygon(this.chainId)) throw new Error("Not Matic");
    const wrapped = WRAPPED_NATIVE_CURRENCY[this.chainId];
    invariant(wrapped instanceof Token);
    return wrapped;
  }

  public constructor(chainId: number) {
    if (!isPolygon(chainId)) throw new Error("Not Matic");
    super(chainId, 18, "Matic", "Matic");
  }
}

class BaseNativeCurrency extends NativeCurrency {
  equals(other: Currency): boolean {
    return other.isNative && other.chainId === this.chainId;
  }

  get wrapped(): Token {
    if (!isBASE(this.chainId)) throw new Error("Not Eth");
    const wrapped = WRAPPED_NATIVE_CURRENCY[this.chainId];
    invariant(wrapped instanceof Token);
    return wrapped;
  }

  public constructor(chainId: number) {
    if (!isBASE(chainId)) throw new Error("Not Eth");
    super(chainId, 18, "ETH", "ETH");
  }
}

class BlastNativeCurrency extends NativeCurrency {
  equals(other: Currency): boolean {
    return other.isNative && other.chainId === this.chainId;
  }

  get wrapped(): Token {
    if (!isBLAST(this.chainId)) throw new Error("Not Eth");
    const wrapped = WRAPPED_NATIVE_CURRENCY[this.chainId];
    invariant(wrapped instanceof Token);
    return wrapped;
  }

  public constructor(chainId: number) {
    if (!isBLAST(chainId)) throw new Error("Not Eth");
    super(chainId, 18, "ETH", "ETH");
  }
}

class IotaNativeCurrency extends NativeCurrency {
  equals(other: Currency): boolean {
    return other.isNative && other.chainId === this.chainId;
  }

  get wrapped(): Token {
    if (!isIOTA(this.chainId)) throw new Error("Not IOTA");
    const wrapped = WRAPPED_NATIVE_CURRENCY[this.chainId];
    invariant(wrapped instanceof Token);
    return wrapped;
  }

  public constructor(chainId: number) {
    if (!isIOTA(chainId)) throw new Error("Not IOTA");
    super(chainId, 18, "IOTA", "IOTA");
  }
}

class ExtendedEther extends Ether {
  public get wrapped(): Token {
    const wrapped = WRAPPED_NATIVE_CURRENCY[this.chainId];
    if (wrapped) return wrapped;
    throw new Error("Unsupported chain ID");
  }
}

const cachedNativeCurrency: { [chainId: number]: NativeCurrency | Token } = {};

export function nativeOnChain(chainId: number): NativeCurrency | Token {
  if (cachedNativeCurrency[chainId]) {
    return cachedNativeCurrency[chainId];
  }
  let nativeCurrency: NativeCurrency | Token;

  if (isBSC(chainId)) {
    nativeCurrency = new BscNativeCurrency(chainId);
  } else if (isFTM(chainId)) {
    nativeCurrency = new FtmNativeCurrency(chainId);
  } else if (isPolygon(chainId)) {
    nativeCurrency = new PolygonNativeCurrency(chainId);
  } else if (isMantle(chainId)) {
    nativeCurrency = new MantleNativeCurrency(chainId);
  } else if (isBASE(chainId)) {
    nativeCurrency = new BaseNativeCurrency(chainId);
  } else if (isBLAST(chainId)) {
    nativeCurrency = new BlastNativeCurrency(chainId);
  } else if (isIOTA(chainId)) {
    nativeCurrency = new IotaNativeCurrency(chainId);
  } else {
    nativeCurrency = ExtendedEther.onChain(chainId);
  }
  return (cachedNativeCurrency[chainId] = nativeCurrency);
}

export function getCombinedTokens(tokenList): TokenAddressMap {
  const combinedToken: TokenAddressMap = {};
  for (let i = 0; i < tokenList.length; i++) {
    const token = tokenList[i];
    const chains = Object.keys(token).map((c) => Number(c));
    for (let j = 0; j < chains.length; j++) {
      if (!combinedToken[chains[j]]) {
        combinedToken[chains[j]] = {};
      }
      const tokenMap = combinedToken[chains[j]];
      tokenMap[token[chains[j]].address] = token[chains[j]];
    }
  }

  return combinedToken;
}
