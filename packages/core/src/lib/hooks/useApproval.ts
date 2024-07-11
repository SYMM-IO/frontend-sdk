import { useCallback, useMemo } from "react";
import { Address, erc20Abi } from "viem";
import { simulateContract, writeContract } from "@wagmi/core";
import { useReadContract } from "wagmi";
import { Currency, Token } from "@uniswap/sdk-core";

import { useERC20Allowance } from "./useERC20Allowance";
import BigNumber from "bignumber.js";
import { BN_TEN } from "../../utils/numbers";
import useWagmi from "./useWagmi";
import { useWagmiConfig } from "../../state/chains";

export enum ApprovalState {
  UNKNOWN = "UNKNOWN",
  NOT_APPROVED = "NOT_APPROVED",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
}

export function useApprovalStateForSpender(
  currency: Currency | undefined,
  amountToApprove: BigNumber.Value | undefined,
  owner: Address | undefined,
  spender: string | undefined,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean
): [ApprovalState, ReturnType<typeof useReadContract>["refetch"]] {
  const token = currency?.isToken ? currency.wrapped : undefined;

  const { tokenAllowance, refetch } = useERC20Allowance({
    token,
    owner,
    spender,
  });

  const pendingApproval = useIsPendingApproval(token, spender);

  return useMemo(() => {
    if (!currency) return [ApprovalState.UNKNOWN, refetch];
    if (!amountToApprove || !spender) return [ApprovalState.UNKNOWN, refetch];
    if (currency.isNative) return [ApprovalState.APPROVED, refetch];
    // we might not have enough data to know whether or not we need to approve
    if (!tokenAllowance) return [ApprovalState.UNKNOWN, refetch];

    // amountToApprove will be defined if tokenAllowance is
    return [
      tokenAllowance.lt(amountToApprove)
        ? pendingApproval
          ? ApprovalState.PENDING
          : ApprovalState.NOT_APPROVED
        : ApprovalState.APPROVED,
      refetch,
    ];
  }, [
    currency,
    refetch,
    amountToApprove,
    spender,
    tokenAllowance,
    pendingApproval,
  ]);
}

export function useApproval(
  currency: Currency | undefined,
  amountToApprove: BigNumber.Value | undefined,
  owner: Address | undefined,
  spender: string | undefined,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean
): [
  ApprovalState,
  () => Promise<
    | { response: string; tokenAddress: string; spenderAddress: string }
    | undefined
  >
] {
  const { chainId } = useWagmi();
  const config = useWagmiConfig();

  const token = currency?.isToken ? currency.wrapped : undefined;

  // check the current approval status
  const [approvalState] = useApprovalStateForSpender(
    currency,
    amountToApprove,
    owner,
    spender,
    useIsPendingApproval
  );

  const approve = useCallback(async () => {
    function logFailure(error: Error | string): undefined {
      console.warn(`${token?.symbol || "Token"} approval failed:`, error);
      return;
    }

    // Bail early if there is an issue.
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      return logFailure("approve was called unnecessarily");
    } else if (!chainId) {
      return logFailure("no chainId");
    } else if (!token) {
      return logFailure("no token");
    } else if (!amountToApprove) {
      return logFailure("missing amount to approve");
    } else if (!spender) {
      return logFailure("no spender");
    }

    const amountToApproveBN = BN_TEN.pow(token.decimals)
      .times(amountToApprove || 0)
      .toString();

    const { request } = await simulateContract(config, {
      abi: erc20Abi,
      address: token.address as Address,
      functionName: "approve",
      args: [spender as Address, BigInt(amountToApproveBN)],
    });

    const hash = await writeContract(config, request);

    return {
      response: hash,
      tokenAddress: token.address,
      spenderAddress: spender,
    };
  }, [approvalState, chainId, token, amountToApprove, spender, config]);

  return [approvalState, approve];
}
