import { useCallback, useMemo } from "react";
import { Token } from "@uniswap/sdk-core";

import useActiveWagmi from "../../lib/hooks/useActiveWagmi";

import { useAppDispatch, useAppSelector } from "../declaration";
import { addTransaction } from "./actions";
import { TransactionDetails, TransactionInfo, TransactionType } from "./types";
import useWagmi from "../../lib/hooks/useWagmi";

export interface TransactionResponseLight {
  hash: string;
}

// helper that can take a ethers library transaction response and add it to the list of transactions
export function useTransactionAdder(): (
  hash: string,
  info: TransactionInfo,
  summary?: string
) => void {
  const { chainId, account } = useWagmi();
  const dispatch = useAppDispatch();

  return useCallback(
    (hash: string, info: TransactionInfo, summary?: string) => {
      if (!account) return;
      if (!chainId) return;

      if (!hash) {
        throw Error("No transaction hash found.");
      }
      dispatch(addTransaction({ hash, from: account, info, chainId, summary }));
    },
    [account, chainId, dispatch]
  );
}

// returns all the transactions for the current chain
export function useAllTransactions(): { [txHash: string]: TransactionDetails } {
  const { chainId } = useActiveWagmi();

  const state = useAppSelector((state) => state.transactions);

  return chainId ? state[chainId] ?? {} : {};
}

export function useTransaction(
  transactionHash?: string
): TransactionDetails | undefined {
  const allTransactions = useAllTransactions();

  if (!transactionHash) {
    return undefined;
  }

  return allTransactions[transactionHash];
}

/**
 * Returns whether a transaction happened in the last day (86400 seconds * 1000 milliseconds / second)
 * @param tx to check for recency
 */
export function isTransactionRecent(tx: TransactionDetails): boolean {
  return new Date().getTime() - tx.addedTime < 86_400_000;
}

export function useIsTransactionPending(transactionHash?: string): boolean {
  const transactions = useAllTransactions();

  if (!transactionHash || !transactions[transactionHash]) return false;

  return !transactions[transactionHash].receipt;
}

export function useIsTransactionConfirmed(transactionHash?: string): boolean {
  const transactions = useAllTransactions();

  if (!transactionHash || !transactions[transactionHash]) return false;

  return Boolean(transactions[transactionHash].receipt);
}

// returns whether a token has a pending approval transaction
export function useHasPendingApproval(
  token?: Token,
  spender?: string
): boolean {
  const allTransactions = useAllTransactions();
  return useMemo(
    () =>
      typeof token?.address === "string" &&
      typeof spender === "string" &&
      Object.keys(allTransactions).some((hash) => {
        const tx = allTransactions[hash];
        if (!tx) return false;
        if (tx.receipt) {
          return false;
        } else {
          if (tx.info.type !== TransactionType.APPROVAL) return false;
          return (
            tx.info.spender === spender &&
            tx.info.tokenAddress === token.address &&
            isTransactionRecent(tx)
          );
        }
      }),
    [allTransactions, spender, token?.address]
  );
}

// return whether has a pending transaction
export function useIsHavePendingTransaction(transactionType?: TransactionType) {
  const { account } = useActiveWagmi();
  const allTransactions = useAllTransactions();
  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions);
    return txs
      .filter(isTransactionRecent)
      .sort(
        (a: TransactionDetails, b: TransactionDetails) =>
          b.addedTime - a.addedTime
      )
      .filter((tx) => tx.from == account);
  }, [allTransactions, account]);

  const pending = sortedRecentTransactions
    .filter((tx) => {
      if (!transactionType) return !tx.receipt;
      else return !tx.receipt && tx.info.type === transactionType;
    })
    .map((tx) => tx.hash);
  return useMemo(() => pending.length > 0, [pending.length]);
}
