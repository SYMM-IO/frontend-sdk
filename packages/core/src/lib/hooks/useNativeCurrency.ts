import { useMemo } from "react";
import { NativeCurrency, Token } from "@uniswap/sdk-core";

import { useFallbackChainId } from "../../state/chains/hooks";
import { nativeOnChain } from "../../utils/token";
import useActiveWagmi from "./useActiveWagmi";

export default function useNativeCurrency(): NativeCurrency | Token {
  const { chainId } = useActiveWagmi();
  const FALLBACK_CHAIN_ID = useFallbackChainId();

  return useMemo(
    () =>
      chainId
        ? nativeOnChain(chainId)
        : // display mainnet when not connected
          nativeOnChain(FALLBACK_CHAIN_ID),
    [FALLBACK_CHAIN_ID, chainId]
  );
}
