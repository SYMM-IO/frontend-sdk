import { useEffect, useMemo, useState } from "react";
import { useReadContract } from "wagmi";
import { Address } from "viem";

import { Account } from "../types/user";
import { useMultiAccountContract } from "./useContract";
import useActiveWagmi from "../lib/hooks/useActiveWagmi";
import { BalanceInfosType } from "../state/user/types";
import { ApiState } from "../types/api";
import { useHedgerInfo } from "../state/hedger/hooks";
import { useMultiAccountAddress } from "../state/chains";
import { useSupportedChainId } from "../lib/hooks/useSupportedChainId";
import { AppThunkDispatch, useAppDispatch } from "../state";
import { getBalanceInfo } from "../state/user/thunks";

export function useUserAccounts() {
  const { account } = useActiveWagmi();
  const MultiAccountContract = useMultiAccountContract();
  const isSupportedChainId = useSupportedChainId();
  const { accountLength } = useAccountsLength();

  const {
    data: accounts,
    isLoading,
    error,
    isError,
    isSuccess,
  } = useReadContract({
    address: MultiAccountContract?.address,
    abi: MultiAccountContract?.abi,
    functionName: "getAccounts",
    args: [account as Address, BigInt(0), BigInt(accountLength)],
    query: {
      enabled: Boolean(account) && Boolean(accountLength) && isSupportedChainId,
    },
  });

  const accountsUnsorted = useMemo(() => {
    if (!accounts || !isSuccess || isError) return [];

    const accountsArray = accounts as Account[];

    return accountsArray.map(
      (acc: {
        accountAddress: Address; // or whatever the correct type is
        name: string;
      }) =>
        ({
          accountAddress: acc.accountAddress.toString(),
          name: acc.name,
        } as Account)
    );
  }, [accounts, isError, isSuccess]);

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

  const { account } = useActiveWagmi();
  const MultiAccountContract = useMultiAccountContract();

  const { data, isLoading, isSuccess, isError } = useReadContract({
    address: MultiAccountContract?.address,
    abi: MultiAccountContract?.abi,
    functionName: "getAccountsLength",
    args: [account as Address],
    query: {
      enabled: Boolean(account) && isSupportedChainId,
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
