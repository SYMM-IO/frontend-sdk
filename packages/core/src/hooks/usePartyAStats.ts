import { Address } from "viem";

import { useSingleContractMultipleMethods } from "../lib/hooks/multicall";

import { useSupportedChainId } from "../lib/hooks/useSupportedChainId";

import { fromWei } from "../utils/numbers";
import { getMultipleBN, getSingleWagmiResult } from "../utils/multicall";

import { UserPartyAStatDetail } from "../types/user";
import {
  useCollateralAddress,
  useCollateralDecimal,
  useDiamondAddress,
  useFallbackChainId,
} from "../state/chains";
import useActiveWagmi from "../lib/hooks/useActiveWagmi";
import { COLLATERAL_ABI, DIAMOND_ABI } from "../constants";

//TODO why its not covered by useMemo
//we converted all BigNumbers to string to avoid spurious rerenders
export function usePartyAStats(
  account: string | null | undefined
): UserPartyAStatDetail {
  const { chainId } = useActiveWagmi();
  const isSupportedChainId = useSupportedChainId();

  const DIAMOND_ADDRESS = useDiamondAddress();

  const COLLATERAL_ADDRESS = useCollateralAddress();

  const collateralDecimal = useCollateralDecimal();
  const fallBackChainId = useFallbackChainId();

  const partyAStatsCallsFirstCall = isSupportedChainId
    ? !account
      ? []
      : [
          {
            functionName: "balanceOf",
            callInputs: [account],
          },
          {
            functionName: "partyAStats",
            callInputs: [account],
          },
        ]
    : [];

  const partyAStatsCallsSecondCall = isSupportedChainId
    ? !account
      ? []
      : [
          {
            functionName: "getBalanceLimitPerUser",
            callInputs: [],
          },
          {
            functionName: "withdrawCooldownOf",
            callInputs: [account],
          },
          {
            functionName: "coolDownsOfMA",
            callInputs: [],
          },
        ]
    : [];

  const {
    data: cBalance,
    isLoading: iscBalanceLoading,
    isError: isFcBalanceError,
  } = useSingleContractMultipleMethods(
    chainId ? COLLATERAL_ADDRESS[chainId] : "",
    COLLATERAL_ABI,
    [
      {
        functionName: "balanceOf",
        callInputs: [account as Address],
      },
    ],
    {
      watch: true,
    }
  );

  const {
    data: firstData,
    isLoading: isFirstCallLoading,
    isError: isFirstCallError,
  } = useSingleContractMultipleMethods(
    chainId ? DIAMOND_ADDRESS[chainId] : "",
    DIAMOND_ABI,
    partyAStatsCallsFirstCall,
    {
      watch: true,
      enabled: partyAStatsCallsFirstCall.length > 0,
    }
  );

  const {
    data: secondData,
    isLoading: isSecondCallLoading,
    isError: isSecondCallError,
  } = useSingleContractMultipleMethods(
    chainId ? DIAMOND_ADDRESS[chainId] : "",
    DIAMOND_ABI,
    partyAStatsCallsSecondCall,
    {
      watch: true,
      enabled: partyAStatsCallsSecondCall.length > 0,
    }
  );

  const loading =
    isFirstCallLoading || isSecondCallLoading || iscBalanceLoading;
  const isError = isFirstCallError || isSecondCallError || isFcBalanceError;

  const multipleBNResult = getMultipleBN(firstData?.[1]?.result);

  return {
    collateralBalance:
      fromWei(
        getSingleWagmiResult(cBalance),
        collateralDecimal[chainId ?? fallBackChainId]
      ) ?? "0",
    accountBalance: fromWei(getSingleWagmiResult(firstData, 0)),
    liquidationStatus:
      getSingleWagmiResult<boolean[]>(firstData, 1)?.[0] ?? false,
    accountBalanceLimit: fromWei(getSingleWagmiResult(secondData, 0)),
    withdrawCooldown: getSingleWagmiResult(secondData, 1)?.toString() ?? "0",
    cooldownMA: getMultipleBN(secondData?.[2]?.result)[0]?.toString() ?? "0",

    allocatedBalance: fromWei(multipleBNResult[1]),
    lockedCVA: fromWei(multipleBNResult[2]),
    lockedLF: fromWei(multipleBNResult[3]),
    lockedPartyAMM: fromWei(multipleBNResult[4]),
    lockedPartyBMM: fromWei(multipleBNResult[5]),

    pendingLockedCVA: fromWei(multipleBNResult[6]),
    pendingLockedLF: fromWei(multipleBNResult[7]),
    pendingLockedPartyAMM: fromWei(multipleBNResult[8]),
    pendingLockedPartyBMM: fromWei(multipleBNResult[9]),

    positionsCount: multipleBNResult[10]?.toNumber() ?? 0,
    pendingCount: multipleBNResult[11]?.toNumber() ?? 0,
    nonces: multipleBNResult[12]?.toNumber() ?? 0,
    quotesCount: (multipleBNResult[13]?.toNumber() ?? 75) + 5,
    loading,
    isError,
  };
}

export function useForceCooldowns() {
  const { chainId } = useActiveWagmi();
  const isSupportedChainId = useSupportedChainId();
  const DIAMOND_ADDRESS = useDiamondAddress();

  const cooldownsCall = isSupportedChainId
    ? [
        {
          functionName: "coolDownsOfMA",
          callInputs: [],
        },
        {
          functionName: "forceCloseCooldowns",
          callInputs: [],
        },
        {
          functionName: "forceCloseMinSigPeriod",
          callInputs: [],
        },
      ]
    : [];

  const { data, isLoading, isError } = useSingleContractMultipleMethods(
    chainId ? DIAMOND_ADDRESS[chainId] : "",
    DIAMOND_ABI,
    cooldownsCall,
    {
      watch: true,
      enabled: cooldownsCall.length > 0,
    }
  );

  return {
    forceCancelCooldown: getMultipleBN(data?.[0]?.result)[1]?.toString() ?? "0",
    forceCancelCloseCooldown:
      getMultipleBN(data?.[0]?.result)[2]?.toString() ?? "0",
    forceCloseFirstCooldown:
      getMultipleBN(data?.[1]?.result)[0]?.toString() ?? "0",
    forceCloseSecondCooldown:
      getMultipleBN(data?.[1]?.result)[1]?.toString() ?? "0",
    forceCloseMinSigPeriod: getSingleWagmiResult(data, 2)?.toString() ?? "0",

    loading: isLoading,
    isError,
  };
}
