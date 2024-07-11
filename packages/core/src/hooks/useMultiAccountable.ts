import { useCallback } from "react";
import { useActiveAccountAddress } from "../state/user/hooks";
import { GLOBAL_MULTI_ACCOUNTABLE_PAUSED } from "../constants/misc";
import { Address, encodeFunctionData } from "viem";
import { ConstructCallReturnType } from "../types/web3";
import useWagmi from "../lib/hooks/useWagmi";
import { ContractFunctionRevertedError, BaseError } from "viem";
import {
  useDiamondABI,
  useDiamondAddress,
  useMultiAccountABI,
  useMultiAccountAddress,
  useWagmiConfig,
} from "../state/chains";
import { simulateContract } from "@wagmi/core";

export function useMultiAccountable(
  constructCall: () => ConstructCallReturnType,
  disable?: boolean
) {
  const activeAccountAddress = useActiveAccountAddress();
  const { account, chainId } = useWagmi();

  const MULTI_ACCOUNT_ADDRESS = useMultiAccountAddress();
  const MULTI_ACCOUNT_ABI = useMultiAccountABI();

  const DIAMOND_ADDRESS = useDiamondAddress();
  const DIAMOND_ABI = useDiamondABI();

  const wagmiConfig = useWagmiConfig();

  return useCallback(async (): ConstructCallReturnType => {
    if (disable || GLOBAL_MULTI_ACCOUNTABLE_PAUSED)
      return await constructCall();

    let callData: any = null;
    try {
      if (
        !chainId ||
        !constructCall ||
        !activeAccountAddress ||
        !DIAMOND_ABI ||
        !Object.keys(DIAMOND_ADDRESS).length ||
        !MULTI_ACCOUNT_ABI ||
        !Object.keys(MULTI_ACCOUNT_ADDRESS).length ||
        !account
      ) {
        throw new Error("Missing in generating constructCall.");
      }

      const call = await constructCall();
      if ("error" in call) throw call;
      const { config, args: preArgs, functionName } = call;
      callData = { config, args: preArgs, functionName }; // Store the call data

      if (functionName) {
        // @ts-ignore
        await simulateContract(wagmiConfig, {
          args: preArgs,
          abi: DIAMOND_ABI,
          address: DIAMOND_ADDRESS[chainId] as Address,
          functionName,
          account: activeAccountAddress as Address,
          value: config.value || BigInt(0),
        });
      }

      const args = [activeAccountAddress as Address, [config.data]];
      return {
        args,
        functionName,
        config: {
          account,
          to: MULTI_ACCOUNT_ADDRESS[chainId] as Address,
          data: encodeFunctionData({
            abi: MULTI_ACCOUNT_ABI,
            functionName: "_call",
            args,
          }),
          value: config.value || BigInt(0),
        },
      };
    } catch (error) {
      if (error instanceof BaseError) {
        const revertError = error.walk(
          (err) => err instanceof ContractFunctionRevertedError
        );
        if (revertError instanceof ContractFunctionRevertedError) {
          console.log(revertError.reason?.toString() || "");
          throw error;
        }
      }
      if (error && typeof error === "string") throw new Error(error);

      if (callData) return { ...callData, error };

      throw new Error("error3");
    }
  }, [
    DIAMOND_ABI,
    DIAMOND_ADDRESS,
    MULTI_ACCOUNT_ABI,
    MULTI_ACCOUNT_ADDRESS,
    account,
    activeAccountAddress,
    chainId,
    constructCall,
    disable,
    wagmiConfig,
  ]);
}
