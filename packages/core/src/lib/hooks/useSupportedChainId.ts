import { useMemo } from "react";

import useActiveWagmi from "./useActiveWagmi";
import { useV3Ids } from "../../state/chains/hooks";

// Allow user to connect any chain globally, but restrict unsupported ones if needed
export function useSupportedChainId() {
  const { chainId, account } = useActiveWagmi();
  const v3_ids = useV3Ids();
  return useMemo(() => {
    if (!chainId || !account) return false;
    return v3_ids.includes(chainId);
  }, [chainId, account, v3_ids]);
}
