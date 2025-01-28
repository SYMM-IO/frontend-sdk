import { useEffect, useMemo, useState } from "react";
import { useReadContract } from "wagmi";
import { Address } from "viem";

import { Account } from "../types/user";
import useActiveWagmi from "../lib/hooks/useActiveWagmi";
import { BalanceInfosType } from "../state/user/types";
import { ApiState } from "../types/api";
import { useHedgerInfo } from "../state/hedger/hooks";
import { useMultiAccountAddress } from "../state/chains";
import { useSupportedChainId } from "../lib/hooks/useSupportedChainId";
import { AppThunkDispatch, useAppDispatch } from "../state";
import { getBalanceInfo } from "../state/user/thunks";
import { MULTI_ACCOUNT_ABI } from "../constants";
import { useSingleContractMultipleMethods } from "../lib/hooks/multicall";
import { getSingleWagmiResult } from "../utils/multicall";

export function useUserAccounts() {
  const { account, chainId } = useActiveWagmi();
  const MULTI_ACCOUNT_ADDRESS = useMultiAccountAddress();
  const isSupportedChainId = useSupportedChainId();
  const { accountLength } = useAccountsLength();

  const calls = isSupportedChainId
    ? [
        {
          functionName: "getAccounts",
          callInputs: [account as Address, BigInt(0), BigInt(accountLength)],
        },
      ]
    : [];

  const {
    data: accounts,
    isLoading,
    error,
    isError,
    isSuccess,
  } = useSingleContractMultipleMethods(
    chainId ? (MULTI_ACCOUNT_ADDRESS[chainId] as Address) : "",
    MULTI_ACCOUNT_ABI,
    calls,
    {
      enabled: Boolean(account) && Boolean(accountLength) && isSupportedChainId,
    }
  );

  const accountsUnsorted = useMemo(() => {
    if (!accounts || !isSuccess || isError) return [];

    const accountsArray = getSingleWagmiResult(accounts) as Account[];

    return accountsArray
      ? accountsArray.map(
          (acc: {
            accountAddress: Address; // or whatever the correct type is
            name: string;
          }) =>
            ({
              accountAddress: acc.accountAddress.toString(),
              name: acc.name,
              owner: account,
            } as Account)
        )
      : [];
  }, [account, accounts, isError, isSuccess]);

  return useMemo(
    () => ({
      accounts: accountsUnsorted,
      isLoading,
      isError,
      error,
    }),
    [accountsUnsorted, error, isError, isLoading]
  );
}

export function useAccountsLength(): {
  accountLength: number;
  loading: boolean;
} {
  const isSupportedChainId = useSupportedChainId();

  const { account, chainId } = useActiveWagmi();
  const MULTI_ACCOUNT_ADDRESS = useMultiAccountAddress();

  const { data, isLoading, isSuccess, isError } = useReadContract({
    address: chainId ? (MULTI_ACCOUNT_ADDRESS[chainId] as Address) : undefined,
    abi: MULTI_ACCOUNT_ABI,
    functionName: "getAccountsLength",
    args: [account as Address],
    query: {
      enabled: Boolean(account) && isSupportedChainId,
      refetchInterval: 2000,
    },
  });

  return useMemo(
    () => ({
      accountLength: isSuccess ? Number(data) : 0,
      loading: isLoading,
      isError,
    }),
    [data, isError, isLoading, isSuccess]
  );
}

export function useBalanceInfos() {
  const [balanceInfo, setBalanceInfo] = useState<BalanceInfosType>({});
  const [balanceInfoStatus, setBalanceInfoStatus] = useState<ApiState>(
    ApiState.OK
  );

  const hedger = useHedgerInfo();
  const { baseUrl, clientName } = hedger || {};
  const { account, chainId } = useActiveWagmi();
  const MULTI_ACCOUNT_ADDRESS = useMultiAccountAddress();
  const multiAccountAddress = chainId
    ? MULTI_ACCOUNT_ADDRESS[chainId]
    : undefined;
  const dispatch: AppThunkDispatch = useAppDispatch();

  useEffect(() => {
    setBalanceInfoStatus(ApiState.LOADING);
    dispatch(getBalanceInfo({ account, multiAccountAddress, baseUrl }))
      .unwrap()
      .then((res) => {
        setBalanceInfo(res);
        setBalanceInfoStatus(ApiState.OK);
      })
      .catch(() => {
        setBalanceInfo({});
        setBalanceInfoStatus(ApiState.ERROR);
      });
  }, [account, baseUrl, clientName, dispatch, multiAccountAddress]);

  return { balanceInfo, balanceInfoStatus };
}
