import { useCallback, useMemo } from "react";

import useActiveWagmi from "../lib/hooks/useActiveWagmi";
import {
  DEFAULT_PRECISION,
  LIMIT_ORDER_DEADLINE,
  MARKET_ORDER_DEADLINE,
  MARKET_PRICE_COEFFICIENT,
} from "../constants/misc";
import {
  useAppName,
  useDiamondABI,
  useDiamondAddress,
  useMuonData,
  useWagmiConfig,
} from "../state/chains/hooks";
import { makeHttpRequest } from "../utils/http";
import { OrderType, TradeState, PositionType } from "../types/trade";
import { useCurrency } from "../lib/hooks/useTokens";
import { useSupportedChainId } from "../lib/hooks/useSupportedChainId";
import { useHedgerInfo, useSetNotionalCap } from "../state/hedger/hooks";
import { getAppNameHeader, getNotionalCapUrl } from "../state/hedger/thunks";
import {
  useActiveAccountAddress,
  useExpertMode,
  usePartyBsWhiteList,
  useSlippageTolerance,
} from "../state/user/hooks";
import { useTransactionAdder } from "../state/transactions/hooks";
import {
  TradeTransactionInfo,
  TransactionType,
} from "../state/transactions/types";
import { ConstructCallReturnType } from "../types/web3";
import {
  useActiveMarketId,
  useLockedPercentages,
  useOrderType,
  usePositionType,
} from "../state/trade/hooks";

import {
  removeTrailingZeros,
  toBN,
  toWei,
  formatPrice,
} from "../utils/numbers";
import {
  createTransactionCallback,
  TransactionCallbackState,
} from "../utils/web3";

import { useMarket } from "../hooks/useMarkets";
import { useMultiAccountable } from "../hooks/useMultiAccountable";
import useTradePage, {
  useLockedCVA,
  useLockedLF,
  useMaxFundingRate,
  useNotionalValue,
  usePartyALockedMM,
  usePartyBLockedMM,
} from "../hooks/useTradePage";
import { SendQuoteClient } from "../lib/muon";
import { Address, encodeFunctionData } from "viem";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { useCollateralAddress } from "../state/chains/hooks";

export function useSentQuoteCallback(): {
  state: TransactionCallbackState;
  callback: null | (() => Promise<any>);
  error: string | null;
} {
  const { account, chainId } = useActiveWagmi();
  const addTransaction = useTransactionAdder();
  const userExpertMode = useExpertMode();
  const addRecentTransaction = useAddRecentTransaction();
  const wagmiConfig = useWagmiConfig();

  const activeAccountAddress = useActiveAccountAddress();
  const isSupportedChainId = useSupportedChainId();

  const DIAMOND_ADDRESS = useDiamondAddress();
  const DIAMOND_ABI = useDiamondABI();

  const functionName = "sendQuote";
  const COLLATERAL_ADDRESS = useCollateralAddress();
  const collateralCurrency = useCurrency(
    chainId ? COLLATERAL_ADDRESS[chainId] : undefined
  );
  const orderType = useOrderType();
  const positionType = usePositionType();
  const { price, formattedAmounts } = useTradePage();
  const appName = useAppName();

  const marketId = useActiveMarketId();
  const market = useMarket(marketId);
  const slippage = useSlippageTolerance();
  const pricePrecision = useMemo(
    () => market?.pricePrecision ?? DEFAULT_PRECISION,
    [market]
  );
  const openPrice = useMemo(() => (price ? price : "0"), [price]);
  const autoSlippage = market ? market.autoSlippage : MARKET_PRICE_COEFFICIENT;
  const MuonData = useMuonData();

  const openPriceFinal = useMemo(() => {
    if (orderType === OrderType.LIMIT) return openPrice;

    if (slippage === "auto") {
      return positionType === PositionType.SHORT
        ? toBN(openPrice).div(autoSlippage).toString()
        : toBN(openPrice).times(autoSlippage).toString();
    }

    const spSigned =
      positionType === PositionType.SHORT ? slippage : slippage * -1;
    const slippageFactored = toBN(100 - spSigned).div(100);
    return toBN(openPrice).times(slippageFactored).toString();
  }, [orderType, openPrice, slippage, positionType, autoSlippage]);

  const openPriceWied = useMemo(
    () => toWei(formatPrice(openPriceFinal, pricePrecision)),
    [openPriceFinal, pricePrecision]
  );

  const quantityAsset = useMemo(
    () => (toBN(formattedAmounts[1]).isNaN() ? "0" : formattedAmounts[1]),
    [formattedAmounts]
  );

  const notionalValue = useNotionalValue(
    quantityAsset,
    formatPrice(openPriceFinal, pricePrecision)
  );
  const lockedCVA = useLockedCVA(notionalValue);
  const lockedLF = useLockedLF(notionalValue);
  const lockedPartyAMM = usePartyALockedMM(notionalValue);
  const lockedPartyBMM = usePartyBLockedMM(notionalValue);
  const { cva, partyAmm, partyBmm, lf } = useLockedPercentages();
  const updateNotionalCap = useSetNotionalCap();

  const maxFundingRate = useMaxFundingRate();
  const { baseUrl } = useHedgerInfo() || {};
  const partyBWhiteList = usePartyBsWhiteList();

  const getSignature = useCallback(async () => {
    if (
      !activeAccountAddress ||
      !chainId ||
      !Object.keys(DIAMOND_ADDRESS).length ||
      !marketId ||
      !SendQuoteClient ||
      !MuonData
    ) {
      throw new Error("Missing muon params");
    }

    const { AppName, Urls } = MuonData[chainId];
    const { success, signature, error } = await SendQuoteClient.getMuonSig(
      activeAccountAddress,
      AppName,
      Urls,
      chainId,
      DIAMOND_ADDRESS[chainId],
      marketId
    );

    if (success === false || !signature) {
      throw new Error(`Unable to fetch Muon signature: ${error}`);
    }
    return { signature };
  }, [DIAMOND_ADDRESS, MuonData, activeAccountAddress, chainId, marketId]);

  const getNotionalCap = useCallback(async () => {
    if (!market) {
      throw new Error("market is missing");
    }

    const notionalCapUrl = getNotionalCapUrl(market.id, baseUrl);

    const tempResponse = await makeHttpRequest<{
      total_cap: number;
      used: number;
    }>(notionalCapUrl, getAppNameHeader(appName));
    if (!tempResponse) return;
    const { total_cap, used }: { total_cap: number; used: number } =
      tempResponse;

    const freeCap = toBN(total_cap).minus(used);
    const notionalValue = toBN(openPrice).times(quantityAsset);
    updateNotionalCap({ name: market.name, used, totalCap: total_cap });

    if (freeCap.minus(notionalValue).lte(0)) throw new Error("Cap is reached.");
  }, [appName, baseUrl, market, openPrice, quantityAsset, updateNotionalCap]);

  const preConstructCall = useCallback(async (): ConstructCallReturnType => {
    try {
      if (
        !chainId ||
        !account ||
        !DIAMOND_ABI ||
        !Object.keys(DIAMOND_ADDRESS).length ||
        !marketId ||
        !collateralCurrency ||
        !partyBWhiteList ||
        !isSupportedChainId ||
        !cva ||
        !partyAmm ||
        !partyBmm ||
        !lf
      ) {
        throw new Error("Missing dependencies.");
      }

      await getNotionalCap();
      const { signature } = await getSignature();

      if (!signature) {
        throw new Error("Missing signature for constructCall.");
      }

      const deadline =
        orderType === OrderType.MARKET
          ? Math.floor(Date.now() / 1000) + MARKET_ORDER_DEADLINE
          : Math.floor(Date.now() / 1000) + LIMIT_ORDER_DEADLINE;

      const args = [
        partyBWhiteList,
        BigInt(marketId),
        (positionType === PositionType.SHORT ? 1 : 0) as number,
        (orderType === OrderType.MARKET ? 1 : 0) as number,
        BigInt(openPriceWied),
        BigInt(toWei(quantityAsset, 18)),
        toWei(lockedCVA),
        toWei(lockedLF),
        toWei(lockedPartyAMM), // partyAmm
        toWei(lockedPartyBMM), // partyBmm
        toWei(maxFundingRate),

        BigInt(deadline),
        signature,
      ];

      return {
        args,
        functionName,
        config: {
          account,
          to: DIAMOND_ADDRESS[chainId] as Address,
          data: encodeFunctionData({
            abi: DIAMOND_ABI,
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
  }, [
    chainId,
    account,
    DIAMOND_ABI,
    DIAMOND_ADDRESS,
    marketId,
    collateralCurrency,
    partyBWhiteList,
    isSupportedChainId,
    cva,
    partyAmm,
    partyBmm,
    lf,
    getNotionalCap,
    getSignature,
    quantityAsset,
    orderType,
    positionType,
    openPriceWied,
    lockedCVA,
    lockedLF,
    lockedPartyAMM,
    lockedPartyBMM,
    maxFundingRate,
  ]);

  const constructCall = useMultiAccountable(preConstructCall);

  return useMemo(() => {
    if (
      !account ||
      !chainId ||
      !DIAMOND_ABI ||
      !Object.keys(DIAMOND_ADDRESS).length ||
      !market ||
      !orderType ||
      !quantityAsset ||
      !activeAccountAddress
    ) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: "Missing dependencies",
      };
    }

    if (toBN(openPrice).lte(0)) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: "Price is out of range",
      };
    }
    if (toBN(quantityAsset).lte(0)) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: "Amount is too low",
      };
    }

    const txInfo = {
      type: TransactionType.TRADE,
      name: market.name,
      amount: removeTrailingZeros(quantityAsset),
      price: formatPrice(price, pricePrecision, true),
      state: TradeState.OPEN,
      slippage: orderType === OrderType.LIMIT ? null : slippage,
      hedger: "",
      positionType,
    } as TradeTransactionInfo;

    const summary = `${txInfo.name} Open Order`;

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
          summary,
          userExpertMode
        ),
    };
  }, [
    account,
    chainId,
    DIAMOND_ABI,
    DIAMOND_ADDRESS,
    market,
    orderType,
    quantityAsset,
    activeAccountAddress,
    openPrice,
    price,
    pricePrecision,
    slippage,
    positionType,
    constructCall,
    addTransaction,
    addRecentTransaction,
    wagmiConfig,
    userExpertMode,
  ]);
}
