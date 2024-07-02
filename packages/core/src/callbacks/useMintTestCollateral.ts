import { useCallback, useMemo } from "react";
import BigNumber from "bignumber.js";

import useActiveWagmi from "../lib/hooks/useActiveWagmi";
import { useSupportedChainId } from "../lib/hooks/useSupportedChainId";

import { useTransactionAdder } from "../state/transactions/hooks";
import {
  MintTransactionInfo,
  TransactionType,
} from "../state/transactions/types";
import {
  TransactionCallbackState,
  createTransactionCallback,
} from "../utils/web3";

import { useCollateralContract } from "../hooks/useContract";
import { Address, encodeFunctionData } from "viem";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { useCollateralToken } from "../constants/tokens";
import { useWagmiConfig } from "../state/chains";

export function useMintCollateral(): {
  state: TransactionCallbackState;
  callback: null | (() => Promise<any>);
  error: string | null;
} {
  const { account, chainId } = useActiveWagmi();
  const CollateralContract = useCollateralContract();
  const isSupportedChainId = useSupportedChainId();
  const addRecentTransaction = useAddRecentTransaction();
  const COLLATERAL_TOKEN = useCollateralToken();
  const wagmiConfig = useWagmiConfig();

  const addTransaction = useTransactionAdder();

  const functionName = "mint";

  const constructCall = useCallback(async () => {
    try {
      if (!account || !CollateralContract || !isSupportedChainId) {
        throw new Error("Missing dependencies.");
      }

      const args = [
        account as Address,
        BigInt(new BigNumber(50000).shiftedBy(18).toFixed()),
      ];

      return {
        args,
        functionName,
        config: {
          account,
          to: CollateralContract.address,
          data: encodeFunctionData({
            abi: CollateralContract.abi,
            functionName,
            args,
          }),
          value: BigInt(0),
        },
      };
    } catch (error) {
      if (error && typeof error === "string") throw new Error(error);
      throw new Error("error3");
    }
  }, [account, CollateralContract, isSupportedChainId]);

  return useMemo(() => {
    if (!account || !CollateralContract || !chainId) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: "Missing dependencies",
      };
    }
    const collateralSymbol = COLLATERAL_TOKEN[chainId].symbol ?? "";

    const txInfo = {
      type: TransactionType.MINT,
      amount: "50000",
    } as MintTransactionInfo;

    const summary = `&#34;Mint&#34; ${txInfo.amount} ${collateralSymbol} {status}`;

    return {
      state: TransactionCallbackState.VALID,
      error: null,
      callback: () =>
        createTransactionCallback(
          functionName,
          CollateralContract,
          constructCall,
          addTransaction,
          addRecentTransaction,
          txInfo,
          wagmiConfig,
          summary
        ),
    };
  }, [
    account,
    CollateralContract,
    chainId,
    COLLATERAL_TOKEN,
    constructCall,
    addTransaction,
    addRecentTransaction,
    wagmiConfig,
  ]);
}
