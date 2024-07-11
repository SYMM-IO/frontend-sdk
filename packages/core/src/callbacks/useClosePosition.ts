import { useCallback, useMemo } from "react";

import {
  DEFAULT_PRECISION,
  LIMIT_ORDER_DEADLINE,
  MARKET_ORDER_DEADLINE,
  MARKET_PRICE_COEFFICIENT,
} from "../constants/misc";
import {
  createTransactionCallback,
  TransactionCallbackState,
} from "../utils/web3";
import {
  BN_ZERO,
  formatPrice,
  fromWei,
  removeTrailingZeros,
  RoundMode,
  toBN,
  toWei,
  toWeiBN,
} from "../utils/numbers";
import { Quote } from "../types/quote";
import { OrderType, PositionType, TradeState } from "../types/trade";
import { useSupportedChainId } from "../lib/hooks/useSupportedChainId";

import { useExpertMode, useSlippageTolerance } from "../state/user/hooks";
import { useMarketData } from "../state/hedger/hooks";
import { useTransactionAdder } from "../state/transactions/hooks";
import {
  TradeTransactionInfo,
  TransactionType,
} from "../state/transactions/types";

import { useMarket } from "../hooks/useMarkets";
import { useMultiAccountable } from "../hooks/useMultiAccountable";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { ConstructCallReturnType } from "../types/web3";
import { Address, encodeFunctionData } from "viem";
import useActiveWagmi from "../lib/hooks/useActiveWagmi";
import {
  useDiamondABI,
  useDiamondAddress,
  useWagmiConfig,
} from "../state/chains";

export function useClosePosition(
  quote: Quote | null,
  orderType: OrderType,
  typedPrice: string,
  quantityToClose: string
): {
  state: TransactionCallbackState;
  callback: null | (() => Promise<any>);
  error: string | null;
} {
  const { account, chainId } = useActiveWagmi();
  const addTransaction = useTransactionAdder();
  const addRecentTransaction = useAddRecentTransaction();
  const isSupportedChainId = useSupportedChainId();
  const userExpertMode = useExpertMode();
  const wagmiConfig = useWagmiConfig();

  const DIAMOND_ADDRESS = useDiamondAddress();
  const DIAMOND_ABI = useDiamondABI();

  const functionName = "requestToClosePosition";

  const market = useMarket(quote?.marketId);
  const marketData = useMarketData(market?.name);
  const positionType = quote?.positionType;
  const pricePrecision = useMemo(
    () => market?.pricePrecision ?? DEFAULT_PRECISION,
    [market]
  );

  const slippage = useSlippageTolerance();
  const autoSlippage = market ? market.autoSlippage : MARKET_PRICE_COEFFICIENT;

  const markPriceBN = useMemo(() => {
    if (!marketData || !marketData.markPrice) return BN_ZERO;
    return toWeiBN(
      toBN(marketData.markPrice).toFixed(pricePrecision, RoundMode.ROUND_DOWN)
    );
  }, [marketData, pricePrecision]);

  const typedPriceBN = useMemo(
    () =>
      toWeiBN(toBN(typedPrice).toFixed(pricePrecision, RoundMode.ROUND_DOWN)),
    [typedPrice, pricePrecision]
  );

  const closePriceBN = useMemo(
    () => (orderType === OrderType.MARKET ? markPriceBN : typedPriceBN),
    [orderType, markPriceBN, typedPriceBN]
  );

  const closePriceFinal = useMemo(() => {
    if (orderType === OrderType.LIMIT) return closePriceBN;

    if (slippage === "auto") {
      return positionType === PositionType.SHORT
        ? closePriceBN.times(autoSlippage)
        : closePriceBN.div(autoSlippage);
    }

    const spSigned =
      positionType === PositionType.SHORT ? slippage * -1 : slippage;
    const slippageFactored = toBN(100 - spSigned).div(100);
    return toBN(closePriceBN).times(slippageFactored);
  }, [orderType, closePriceBN, slippage, positionType, autoSlippage]);

  //TODO: remove this way
  const closePriceWied = useMemo(
    () => toWei(formatPrice(fromWei(closePriceFinal), pricePrecision)),
    [closePriceFinal, pricePrecision]
  );

  const preConstructCall = useCallback(async (): ConstructCallReturnType => {
    try {
      if (
        !chainId ||
        !account ||
        !DIAMOND_ABI ||
        !Object.keys(DIAMOND_ADDRESS).length ||
        !quote ||
        !quantityToClose ||
        !isSupportedChainId
      ) {
        throw new Error("Missing dependencies for constructCall.");
      }

      const deadline =
        orderType === OrderType.MARKET
          ? Math.floor(Date.now() / 1000) + MARKET_ORDER_DEADLINE
          : Math.floor(Date.now() / 1000) + LIMIT_ORDER_DEADLINE;

      const args = [
        BigInt(quote.id),
        BigInt(closePriceWied),
        BigInt(toWei(quantityToClose)),
        orderType === OrderType.MARKET ? 1 : 0,
        BigInt(deadline),
      ] as const;

      return {
        args,
        functionName,
        config: {
          account,
          to: DIAMOND_ADDRESS[chainId] as Address,
          data: encodeFunctionData({
            abi: DIAMOND_ABI,
            functionName,
            args: [
              BigInt(quote.id),
              BigInt(closePriceWied),
              BigInt(toWei(quantityToClose)),
              orderType === OrderType.MARKET ? 1 : 0,
              BigInt(deadline),
            ],
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
    quote,
    quantityToClose,
    isSupportedChainId,
    orderType,
    closePriceWied,
  ]);

  const constructCall = useMultiAccountable(preConstructCall);

  return useMemo(() => {
    if (
      !account ||
      !chainId ||
      !DIAMOND_ABI ||
      !Object.keys(DIAMOND_ADDRESS).length ||
      !market ||
      !quote ||
      !orderType
    ) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: "Missing dependencies.",
      };
    }

    if (closePriceBN.lte(0)) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: "Price is out of range",
      };
    }
    if (!quantityToClose || toBN(quantityToClose).eq(0)) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: "Amount is too low",
      };
    }

    const txInfo = {
      type: TransactionType.TRADE,
      name: market.name,
      amount: removeTrailingZeros(quantityToClose),
      price: closePriceBN.div(1e18).toFormat(),
      state: TradeState.CLOSE,
      slippage: orderType === OrderType.LIMIT ? null : slippage,
      hedger: "",
      positionType: quote.positionType,
      id: quote.id.toString(),
    } as TradeTransactionInfo;

    const summary = `${txInfo.name}-Q${txInfo.id} Close Position`;
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
    quote,
    orderType,
    closePriceBN,
    quantityToClose,
    slippage,
    constructCall,
    addTransaction,
    addRecentTransaction,
    wagmiConfig,
    userExpertMode,
  ]);
}
