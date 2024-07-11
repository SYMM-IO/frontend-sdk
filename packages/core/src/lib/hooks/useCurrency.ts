import { useMemo } from "react";
import { Currency, Token } from "@uniswap/sdk-core";

import { useTokenShorthand } from "../../constants/tokens";
import { isSupportedChain } from "../../constants/chains";
import { isAddress } from "../../utils/validate";

import useWagmi from "./useWagmi";

import useNativeCurrency from "./useNativeCurrency";
import { useV3Ids } from "../../state/chains/hooks";

type TokenMap = { [address: string]: Token };

/**
 * Returns a Token from the tokenAddress.
 * Returns null if token is loading or null was passed.
 * Returns undefined if tokenAddress is invalid or token does not exist.
 */
export function useTokenFromMapOrNetwork(
  tokens: TokenMap,
  tokenAddress?: string | null
): Token | null | undefined {
  const address = tokenAddress ? isAddress(tokenAddress) : false;
  const token: Token | undefined = address ? tokens[address] : undefined;

  return token;
}

/**
 * Returns a Currency from the currencyId.
 * Returns null if currency is loading or null was passed.
 * Returns undefined if currencyId is invalid or token does not exist.
 */
export function useCurrencyFromMap(
  tokens: TokenMap,
  currencyId?: string | null
): Currency | null | undefined {
  const { chainId } = useWagmi();
  const nativeCurrency = useNativeCurrency();
  const isNative = Boolean(
    nativeCurrency &&
      (currencyId?.toUpperCase() === "ETH" ||
        currencyId?.toUpperCase() === "FTM")
  );
  const TOKEN_SHORTHANDS = useTokenShorthand();
  const v3_ids = useV3Ids();
  const shorthandMatchAddress = useMemo(() => {
    const chain =
      typeof chainId === "number" && v3_ids.includes(chainId)
        ? chainId
        : undefined;
    //TODO
    return chain && currencyId
      ? TOKEN_SHORTHANDS[currencyId.toUpperCase()]?.[chain]
      : undefined;
  }, [TOKEN_SHORTHANDS, chainId, currencyId, v3_ids]);

  const token = useTokenFromMapOrNetwork(
    tokens,
    isNative ? undefined : shorthandMatchAddress ?? currencyId
  );

  if (
    currencyId === null ||
    currencyId === undefined ||
    !isSupportedChain(chainId)
  )
    return null;

  // this case so we use our builtin wrapped token instead of wrapped tokens on token lists
  const wrappedNative = nativeCurrency?.wrapped;
  if (wrappedNative?.address?.toUpperCase() === currencyId?.toUpperCase())
    return wrappedNative;

  return isNative ? nativeCurrency : token;
}
