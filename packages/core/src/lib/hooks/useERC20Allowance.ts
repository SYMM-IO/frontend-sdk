import { useMemo } from "react";
import { Token } from "@uniswap/sdk-core";
import BigNumber from "bignumber.js";

import { Address, erc20Abi } from "viem";
import { useReadContract } from "wagmi";
import { BN_TEN, toBN } from "../../utils/numbers";

interface UseERC20Allowance {
  token?: Token;
  owner: Address | undefined;
  spender: string | undefined;
  enabled?: boolean;
}

export function useERC20Allowance({
  token,
  owner,
  spender,
  enabled = true,
}: UseERC20Allowance): {
  tokenAllowance: BigNumber | undefined;
  isSyncing: boolean;
  refetch: ReturnType<typeof useReadContract>["refetch"];
} {
  const { data, isLoading, refetch } = useReadContract({
    address: token?.address ? (token?.address as Address) : undefined,
    abi: erc20Abi,
    functionName: "allowance",
    args: [owner as Address, spender as Address],
    query: {
      enabled: Boolean(token && owner && spender && token.chainId && enabled),
      refetchInterval: 2000,
    },
  });

  return useMemo(
    () => ({
      tokenAllowance: token
        ? toBN(data as unknown as BigNumber).div(BN_TEN.pow(token.decimals))
        : undefined,
      isSyncing: isLoading,
      refetch,
    }),
    [data, isLoading, refetch, token]
  );
}
