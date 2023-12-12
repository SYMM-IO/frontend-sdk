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

import {
  useActiveAccountAddress,
  useSlippageTolerance,
} from "../state/user/hooks";
import { useMarketData } from "../state/hedger/hooks";
import { useTransactionAdder } from "../state/transactions/hooks";
import {
  TradeTransactionInfo,
  TransactionType,
} from "../state/transactions/types";

import { useMarket } from "../hooks/useMarkets";
import {
  useDiamondContract,
  useMultiAccountContract,
} from "../hooks/useContract";
import { useMultiAccountable } from "../hooks/useMultiAccountable";
import { SendOrCloseQuoteClient } from "../lib/muon";
import { useSingleUpnlAndPriceSig } from "../hooks/useMuonSign";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { ConstructCallReturnType } from "../types/web3";
import { encodeFunctionData } from "viem";
import useActiveWagmi from "../lib/hooks/useActiveWagmi";
import { SendTransactionResult } from "@wagmi/core";

export function useClosePosition(
  quote: Quote | null,
  orderType: OrderType,
  typedPrice: string,
  quantityToClose: string
): {
  state: TransactionCallbackState;
  callback: null | (() => Promise<SendTransactionResult | undefined>);
  error: string | null;
} {
  const { account, chainId } = useActiveWagmi();
  const addTransaction = useTransactionAdder();
  const addRecentTransaction = useAddRecentTransaction();
  const isSupportedChainId = useSupportedChainId();

  const Contract = useDiamondContract();
  const MultiAccountContract = useMultiAccountContract();

  const functionName = "requestToClosePosition";
  const activeAccountAddress = useActiveAccountAddress();

  const slippage = useSlippageTolerance();

  const market = useMarket(quote?.marketId);
  const marketData = useMarketData(market?.name);
  const positionType = quote?.positionType;
  const pricePrecision = useMemo(
    () => market?.pricePrecision ?? DEFAULT_PRECISION,
    [market]
  );

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
        ? closePriceBN.times(MARKET_PRICE_COEFFICIENT)
        : closePriceBN.div(MARKET_PRICE_COEFFICIENT);
    }

    const spSigned =
      positionType === PositionType.SHORT ? slippage * -1 : slippage;
    const slippageFactored = toBN(100 - spSigned).div(100);
    return toBN(closePriceBN).times(slippageFactored);
  }, [closePriceBN, slippage, positionType, orderType]);

  const fakeSignature = useSingleUpnlAndPriceSig(markPriceBN);

  //TODO: remove this way
  const closePriceWied = useMemo(
    () => toWei(formatPrice(fromWei(closePriceFinal), pricePrecision)),
    [closePriceFinal, pricePrecision]
  );

  const getSignature = useCallback(async () => {
    try {
      if (!quote || !chainId || !Contract || !activeAccountAddress) {
        throw new Error("Missing Muon params");
      }
      if (!SendOrCloseQuoteClient) {
        return { signature: fakeSignature };
      }

      const result = await SendOrCloseQuoteClient.getMuonSig(
        activeAccountAddress,
        chainId,
        Contract?.address,
        quote?.marketId
      );

      const { success, signature, error } = result;
      if (success === false || !signature) {
        throw new Error(`Unable to fetch Muon signature: ${error}`);
      }
      return { signature };
    } catch (error) {
      if (error && typeof error === "string") throw new Error(error);
      throw new Error("error3");
    }
  }, [Contract, activeAccountAddress, chainId, fakeSignature, quote]);

  const preConstructCall =
    useCallback(async (): Promise<ConstructCallReturnType> => {
      try {
        if (
          !account ||
          !Contract ||
          !quote ||
          !quantityToClose ||
          !isSupportedChainId
        ) {
          throw new Error("Missing dependencies for constructCall.");
        }

        const { signature } = await getSignature();
        if (!signature) {
          throw new Error("Missing signature for constructCall.");
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
          signature,
        ] as const;

        return {
          args,
          functionName,
          config: {
            account,
            to: Contract.address,
            data: encodeFunctionData({
              abi: Contract.abi,
              functionName,
              args: [
                BigInt(quote.id),
                BigInt(closePriceWied),
                BigInt(toWei(quantityToClose)),
                orderType === OrderType.MARKET ? 1 : 0,
                BigInt(deadline),
                signature,
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
      account,
      Contract,
      quote,
      quantityToClose,
      isSupportedChainId,
      getSignature,
      orderType,
      closePriceWied,
    ]);

  const constructCall = useMultiAccountable(preConstructCall);

  return useMemo(() => {
    if (
      !account ||
      !chainId ||
      !Contract ||
      !market ||
      !quote ||
      !orderType ||
      !MultiAccountContract
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
          MultiAccountContract,
          constructCall,
          addTransaction,
          addRecentTransaction,
          txInfo,
          summary,
          true
        ),
    };
  }, [
    account,
    chainId,
    Contract,
    market,
    quote,
    orderType,
    MultiAccountContract,
    closePriceBN,
    quantityToClose,
    slippage,
    constructCall,
    addTransaction,
    addRecentTransaction,
  ]);
}
