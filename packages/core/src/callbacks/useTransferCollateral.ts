import { useCallback, useMemo } from "react";
import BigNumber from "bignumber.js";

import {
  createTransactionCallback,
  TransactionCallbackState,
} from "../utils/web3";
import { formatPrice } from "../utils/numbers";
import { useCollateralToken } from "../constants/tokens";
import { useGetTokenWithFallbackChainId } from "../utils/token";
import { TransferTab } from "../types/transfer";

import { useActiveAccount, useExpertMode } from "../state/user/hooks";
import { useTransactionAdder } from "../state/transactions/hooks";
import {
  TransactionType,
  TransferCollateralTransactionInfo,
} from "../state/transactions/types";

import { DeallocateCollateralClient } from "../lib/muon";
import useActiveWagmi from "../lib/hooks/useActiveWagmi";
import { useSupportedChainId } from "../lib/hooks/useSupportedChainId";
import {
  useDiamondContract,
  useMultiAccountContract,
} from "../hooks/useContract";
import { ConstructCallReturnType } from "../types/web3";
import { Address, encodeFunctionData } from "viem";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { useMuonData, useWagmiConfig } from "../state/chains";

export function useTransferCollateral(
  typedAmount: string,
  activeTab: TransferTab
): {
  state: TransactionCallbackState;
  callback: null | (() => Promise<any>);
  error: string | null;
} {
  const { account, chainId } = useActiveWagmi();
  const DiamondContract = useDiamondContract();
  const MultiAccountContract = useMultiAccountContract();
  const activeAccount = useActiveAccount();
  const isSupportedChainId = useSupportedChainId();
  const COLLATERAL_TOKEN = useCollateralToken();
  const userExpertMode = useExpertMode();
  const wagmiConfig = useWagmiConfig();

  const collateralCurrency = useGetTokenWithFallbackChainId(
    COLLATERAL_TOKEN,
    chainId
  );
  const addTransaction = useTransactionAdder();
  const addRecentTransaction = useAddRecentTransaction();
  const MuonData = useMuonData();

  const getSignature = useCallback(async () => {
    if (
      !chainId ||
      !DiamondContract ||
      !activeAccount ||
      !DeallocateCollateralClient ||
      !MuonData
    ) {
      throw new Error("Missing muon params");
    }

    const { AppName, Urls } = MuonData[chainId];
    const result = await DeallocateCollateralClient.getMuonSig(
      activeAccount.accountAddress,
      AppName,
      Urls,
      chainId,
      DiamondContract?.address
    );
    const { success, signature, error } = result;
    if (success === false || !signature) {
      throw new Error(`Unable to fetch Muon signature: ${error}`);
    }
    return { signature };
  }, [DiamondContract, MuonData, activeAccount, chainId]);

  const methodName = useMemo(() => {
    return activeTab === TransferTab.DEPOSIT
      ? "depositAndAllocateForAccount"
      : activeTab === TransferTab.DEALLOCATE
      ? "deallocate"
      : activeTab === TransferTab.WITHDRAW
      ? "withdrawFromAccount"
      : activeTab === TransferTab.ALLOCATE
      ? "allocate"
      : "";
  }, [activeTab]);

  const constructCall = useCallback(async (): ConstructCallReturnType => {
    try {
      if (
        !account ||
        !activeAccount ||
        !DiamondContract ||
        !MultiAccountContract ||
        !collateralCurrency ||
        !typedAmount ||
        !isSupportedChainId
      ) {
        throw new Error("Missing dependencies.");
      }
      const amount = new BigNumber(typedAmount)
        .shiftedBy(collateralCurrency.decimals)
        .toFixed();
      const collateralShiftAmount = `1e${collateralCurrency.decimals}`;

      if (activeTab === TransferTab.DEPOSIT) {
        const args = [activeAccount.accountAddress as Address, BigInt(amount)];
        const functionName = "depositAndAllocateForAccount";

        return {
          args,
          functionName,
          config: {
            account,
            to: MultiAccountContract.address,
            data: encodeFunctionData({
              abi: MultiAccountContract.abi,
              functionName,
              args,
            }),
            value: BigInt(0),
          },
        };
      } else if (activeTab === TransferTab.DEALLOCATE) {
        const fixedAmount = formatPrice(
          typedAmount,
          collateralCurrency.decimals
        );
        const amount = new BigNumber(fixedAmount).times(1e18).toFixed();

        const { signature } = await getSignature();

        if (!signature) {
          throw new Error(`Unable to fetch Muon signature`);
        }

        const diamondArgs = [BigInt(amount), signature] as const;

        const calldata = encodeFunctionData({
          abi: DiamondContract.abi,
          functionName: "deallocate",
          args: [...diamondArgs],
        });

        const args = [activeAccount.accountAddress as Address, [calldata]];
        const functionName = "_call";

        return {
          args,
          functionName,
          config: {
            account,
            value: BigInt(0),
            to: MultiAccountContract.address,
            data: encodeFunctionData({
              abi: MultiAccountContract.abi,
              functionName,
              args,
            }),
          },
        };
      } else if (activeTab === TransferTab.WITHDRAW) {
        const fixedAmount = formatPrice(
          typedAmount,
          collateralCurrency.decimals
        );
        const amount = new BigNumber(fixedAmount)
          .times(collateralShiftAmount)
          .toFixed();
        const args = [activeAccount.accountAddress as Address, BigInt(amount)];
        const functionName = "withdrawFromAccount";
        return {
          args,
          functionName,
          config: {
            account,
            to: MultiAccountContract.address,
            data: encodeFunctionData({
              abi: MultiAccountContract.abi,
              functionName,
              args,
            }),
            value: BigInt(0),
          },
        };
      } else if (activeTab === TransferTab.ALLOCATE) {
        const fixedAmount = formatPrice(
          typedAmount,
          collateralCurrency.decimals
        );
        const amount = new BigNumber(fixedAmount).times(1e18).toFixed();
        const diamondArgs = [BigInt(amount)] as const;

        const calldata = encodeFunctionData({
          abi: DiamondContract.abi,
          functionName: "allocate",
          args: [...diamondArgs],
        });

        const args = [activeAccount.accountAddress as Address, [calldata]];
        const functionName = "_call";

        return {
          args,
          functionName,
          config: {
            account,
            value: BigInt(0),
            to: MultiAccountContract.address,
            data: encodeFunctionData({
              abi: MultiAccountContract.abi,
              functionName,
              args,
            }),
          },
        };
      }

      return {
        args: [],
        functionName: "",
        config: {
          account,
          to: MultiAccountContract.address,
          data: "0x",
          value: BigInt(0),
        },
      };
    } catch (error) {
      if (error && typeof error === "string") throw new Error(error);
      throw new Error("error3");
    }
  }, [
    account,
    activeAccount,
    DiamondContract,
    MultiAccountContract,
    collateralCurrency,
    typedAmount,
    isSupportedChainId,
    activeTab,
    getSignature,
  ]);

  return useMemo(() => {
    if (
      !account ||
      !activeAccount ||
      !chainId ||
      !DiamondContract ||
      !MultiAccountContract ||
      !collateralCurrency
    ) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: "Missing dependencies",
      };
    }

    const txInfo = {
      type: TransactionType.TRANSFER_COLLATERAL,
      transferType: activeTab,
      accountName: activeAccount.name,
      amount: typedAmount,
      accountAddress: activeAccount.accountAddress,
    } as TransferCollateralTransactionInfo;

    const summary = `${txInfo.amount} ${collateralCurrency?.symbol} ${txInfo.transferType}`;

    return {
      state: TransactionCallbackState.VALID,
      error: null,
      callback: () =>
        createTransactionCallback(
          methodName === "deallocate" || methodName === "allocate"
            ? "_call"
            : methodName,
          MultiAccountContract,
          constructCall,
          addTransaction,
          addRecentTransaction,
          txInfo,
          wagmiConfig,
          summary,
          undefined,
          userExpertMode
        ),
    };
  }, [
    account,
    activeAccount,
    chainId,
    DiamondContract,
    MultiAccountContract,
    collateralCurrency,
    activeTab,
    typedAmount,
    methodName,
    constructCall,
    addTransaction,
    addRecentTransaction,
    wagmiConfig,
    userExpertMode,
  ]);
}
