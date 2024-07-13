import { useMemo } from "react";

import { useSupportedChainId } from "../lib/hooks/useSupportedChainId";
import { useSingleContractMultipleMethods } from "../lib/hooks/multicall";
import { useActiveAccountAddress } from "../state/user/hooks";
import { useMultiAccountAddress } from "../state/chains";
import useActiveWagmi from "../lib/hooks/useActiveWagmi";
import { MULTI_ACCOUNT_ABI } from "../constants";

export function useIsAccessDelegated(
  target: string,
  selector: string
): boolean {
  const { chainId } = useActiveWagmi();
  const account = useActiveAccountAddress();
  const isSupportedChainId = useSupportedChainId();

  const MULTI_ACCOUNT_ADDRESS = useMultiAccountAddress();

  const calls = isSupportedChainId
    ? account && target && selector
      ? [
          {
            functionName: "delegatedAccesses",
            callInputs: [account, target, selector],
          },
        ]
      : []
    : [];

  const { data: accessResult } = useSingleContractMultipleMethods(
    chainId ? MULTI_ACCOUNT_ADDRESS[chainId] : "",
    MULTI_ACCOUNT_ABI,
    calls,
    { enabled: calls.length > 0 }
  );

  return useMemo(
    () =>
      accessResult && accessResult[0]
        ? (accessResult[0].result as boolean)
        : false,
    [accessResult]
  );
}
