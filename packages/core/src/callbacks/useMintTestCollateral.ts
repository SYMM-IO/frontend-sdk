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

import { Abi, Address, encodeFunctionData } from "viem";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { useCollateralToken } from "../constants/tokens";
import { useCollateralAddress, useWagmiConfig } from "../state/chains";
import { COLLATERAL_ABI } from "../constants";

export function useMintCollateral(): {
  state: TransactionCallbackState;
  callback: null | (() => ReturnType<typeof createTransactionCallback>);
  error: string | null;
} {
  const { account, chainId } = useActiveWagmi();
  const COLLATERAL_ADDRESS = useCollateralAddress();

  const isSupportedChainId = useSupportedChainId();
  const addRecentTransaction = useAddRecentTransaction();
  const COLLATERAL_TOKEN = useCollateralToken();
  const wagmiConfig = useWagmiConfig();

  const addTransaction = useTransactionAdder();

  const functionName = "mint";

  const constructCall = useCallback(async () => {
    try {
      if (
        !account ||
        !chainId ||
        !Object.keys(COLLATERAL_ADDRESS).length ||
        !isSupportedChainId
      ) {
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
          to: COLLATERAL_ADDRESS[chainId] as Address,
          data: encodeFunctionData({
            abi: COLLATERAL_ABI as Abi,
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
  }, [account, chainId, COLLATERAL_ADDRESS, isSupportedChainId]);

  return useMemo(() => {
    if (
      !account ||
      !chainId ||
      !chainId ||
      !Object.keys(COLLATERAL_ADDRESS).length
    ) {
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
    chainId,
    COLLATERAL_ADDRESS,
    COLLATERAL_TOKEN,
    constructCall,
    addTransaction,
    addRecentTransaction,
    wagmiConfig,
  ]);
}
