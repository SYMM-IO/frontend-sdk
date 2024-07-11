import { useMemo } from "react";
import { Token, Currency } from "@uniswap/sdk-core";

import { useFallbackChainId } from "../../state/chains/hooks";
import { getCombinedTokens } from "../../utils/token";
import { useCurrencyFromMap, useTokenFromMapOrNetwork } from "./useCurrency";
import useActiveWagmi from "./useActiveWagmi";
import { AddressMap } from "../../utils/address";
import { useUSDCToken, useCollateralToken } from "../../constants/tokens";

export function useAllTokens(): { [address: string]: Token } {
  const { chainId } = useActiveWagmi();
  const COLLATERAL_TOKEN = useCollateralToken();
  const USDC_TOKEN = useUSDCToken();
  return useMemo(() => {
    if (chainId) {
      const tokenList = [COLLATERAL_TOKEN, USDC_TOKEN];
      const combinedTokens = getCombinedTokens(tokenList);
      return combinedTokens[chainId] ?? {};
    }
    return {};
  }, [COLLATERAL_TOKEN, USDC_TOKEN, chainId]);
}

// undefined if invalid or does not exist
// null if loading or null was passed
// otherwise returns the token
export function useToken(
  addressOrAddressMap?: AddressMap | string | null
): Token | null | undefined {
  const { chainId } = useActiveWagmi();
  const FALLBACK_CHAIN_ID = useFallbackChainId();
  const tokenAddress = useMemo(() => {
    if (!addressOrAddressMap) {
      return null;
    }
    if (typeof addressOrAddressMap === "string") {
      return addressOrAddressMap;
    }
    return addressOrAddressMap[chainId ?? FALLBACK_CHAIN_ID] ?? null;
  }, [addressOrAddressMap, chainId, FALLBACK_CHAIN_ID]);

  return useTokenByAddress(tokenAddress);
}

export function useTokenByAddress(
  tokenAddress?: string | null
): Token | null | undefined {
  const tokens = useAllTokens();
  return useTokenFromMapOrNetwork(tokens, tokenAddress);
}

export function useCurrency(
  addressOrAddressMap?: AddressMap | string | null
): Currency | null | undefined {
  const { chainId } = useActiveWagmi();
  const FALLBACK_CHAIN_ID = useFallbackChainId();
  const tokenAddress = useMemo(() => {
    if (!addressOrAddressMap) {
      return null;
    }
    if (typeof addressOrAddressMap === "string") {
      return addressOrAddressMap;
    }
    return addressOrAddressMap[chainId ?? FALLBACK_CHAIN_ID] ?? null;
  }, [addressOrAddressMap, chainId, FALLBACK_CHAIN_ID]);

  return useCurrencyByAddress(tokenAddress);
}

export function useCurrencyByAddress(
  currencyId?: string | null
): Currency | null | undefined {
  const tokens = useAllTokens();
  return useCurrencyFromMap(tokens, currencyId);
}
