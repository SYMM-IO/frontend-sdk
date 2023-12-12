import { useCallback, useMemo } from "react";

import useActiveWagmi from "../lib/hooks/useActiveWagmi";
import {
  DEFAULT_PRECISION,
  LIMIT_ORDER_DEADLINE,
  MARKET_ORDER_DEADLINE,
  MARKET_PRICE_COEFFICIENT,
} from "../constants/misc";
import { useAppName, useFallbackChainId } from "../state/chains/hooks";
import { makeHttpRequest } from "../utils/http";
import { OrderType, TradeState, PositionType } from "../types/trade";
import { useCurrency } from "../lib/hooks/useTokens";
import { useSupportedChainId } from "../lib/hooks/useSupportedChainId";
import { useHedgerInfo, useSetNotionalCap } from "../state/hedger/hooks";
import { getAppNameHeader } from "../state/hedger/thunks";
import {
  useActiveAccountAddress,
  useLeverage,
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
  useActiveMarketPrice,
  useLockedPercentages,
  useOrderType,
  usePositionType,
} from "../state/trade/hooks";

import {
  removeTrailingZeros,
  toBN,
  toWei,
  formatPrice,
  BN_ZERO,
  fromWei,
  toWeiBN,
} from "../utils/numbers";
import {
  createTransactionCallback,
  TransactionCallbackState,
} from "../utils/web3";

import { useMarket } from "../hooks/useMarkets";
import {
  useDiamondContract,
  useMultiAccountContract,
} from "../hooks/useContract";
import { useMultiAccountable } from "../hooks/useMultiAccountable";
import useTradePage, {
  useLockedCVA,
  useLockedLF,
  useLockedMM,
  useMaxInterestRate,
  useNotionalValue,
} from "../hooks/useTradePage";
import { SendOrCloseQuoteClient } from "../lib/muon";
import { useSingleUpnlAndPriceSig } from "../hooks/useMuonSign";
import { encodeFunctionData } from "viem";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import {
  useCollateralAddress,
  usePartyBWhitelistAddress,
} from "../state/chains/hooks";
import { SendTransactionResult } from "@wagmi/core";

export function useSentQuoteCallback(): {
  state: TransactionCallbackState;
  callback: null | (() => Promise<SendTransactionResult | undefined>);
  error: string | null;
} {
  const { account, chainId } = useActiveWagmi();
  const addTransaction = useTransactionAdder();
  const addRecentTransaction = useAddRecentTransaction();

  const activeAccountAddress = useActiveAccountAddress();
  const isSupportedChainId = useSupportedChainId();

  const DiamondContract = useDiamondContract();
  const MultiAccountContract = useMultiAccountContract();
  const functionName = "sendQuote";
  const COLLATERAL_ADDRESS = useCollateralAddress();
  const collateralCurrency = useCurrency(
    chainId ? COLLATERAL_ADDRESS[chainId] : undefined
  );
  const orderType = useOrderType();
  const positionType = usePositionType();
  const { price, formattedAmounts } = useTradePage();
  const leverage = useLeverage();
  const appName = useAppName();

  const marketId = useActiveMarketId();
  const market = useMarket(marketId);
  const marketPrice = useActiveMarketPrice();
  const slippage = useSlippageTolerance();
  const pricePrecision = useMemo(
    () => market?.pricePrecision ?? DEFAULT_PRECISION,
    [market]
  );
  const openPriceBN = useMemo(() => (price ? toBN(price) : BN_ZERO), [price]);

  const openPriceFinal = useMemo(() => {
    if (orderType === OrderType.LIMIT) return openPriceBN;

    if (slippage === "auto") {
      return positionType === PositionType.SHORT
        ? openPriceBN.div(MARKET_PRICE_COEFFICIENT)
        : openPriceBN.times(MARKET_PRICE_COEFFICIENT);
    }

    const spSigned =
      positionType === PositionType.SHORT ? slippage : slippage * -1;
    const slippageFactored = toBN(100 - spSigned).div(100);
    return toBN(openPriceBN).times(slippageFactored);
  }, [openPriceBN, slippage, positionType, orderType]);

  const openPriceWied = useMemo(
    () => toWei(formatPrice(openPriceFinal, pricePrecision)),
    [openPriceFinal, pricePrecision]
  );

  const quantityAsset = useMemo(
    () =>
      toBN(formattedAmounts[1]).isNaN() ? toBN(0) : toBN(formattedAmounts[1]),
    [formattedAmounts]
  );

  const notionalValue = useNotionalValue(quantityAsset.toString(), openPriceBN);
  const lockedCVA = useLockedCVA(notionalValue);
  const lockedMM = useLockedMM(notionalValue);
  const lockedLF = useLockedLF(notionalValue);
  const { cva, mm, lf } = useLockedPercentages();
  const updateNotionalCap = useSetNotionalCap();

  const maxInterestRate = useMaxInterestRate(notionalValue);
  const fakeSignature = useSingleUpnlAndPriceSig(toWeiBN(marketPrice));
  const { baseUrl } = useHedgerInfo() || {};
  const PARTY_B_WHITELIST = usePartyBWhitelistAddress();
  const FALLBACK_CHAIN_ID = useFallbackChainId();
  const partyBWhiteList = useMemo(
    () => [PARTY_B_WHITELIST[chainId ?? FALLBACK_CHAIN_ID]],
    [FALLBACK_CHAIN_ID, PARTY_B_WHITELIST, chainId]
  );

  const getSignature = useCallback(async () => {
    if (!SendOrCloseQuoteClient) {
      return { signature: fakeSignature, price: marketPrice.toString() };
    }

    if (!activeAccountAddress || !chainId || !DiamondContract || !marketId) {
      throw new Error("Missing muon params");
    }

    const { success, signature, error } =
      await SendOrCloseQuoteClient.getMuonSig(
        activeAccountAddress,
        chainId,
        DiamondContract.address,
        marketId
      );

    if (success === false || !signature) {
      throw new Error(`Unable to fetch Muon signature: ${error}`);
    }
    return { signature, price: fromWei(signature.price.toString()) };
  }, [
    DiamondContract,
    activeAccountAddress,
    chainId,
    fakeSignature,
    marketId,
    marketPrice,
  ]);

  const getNotionalCap = useCallback(async () => {
    if (!market) {
      throw new Error("market is missing");
    }
    const { href: notionalCapUrl } = new URL(
      `notional_cap/${market.name}`,
      baseUrl
    );
    const tempResponse = await makeHttpRequest<{
      total_cap: number;
      used: number;
    }>(notionalCapUrl, getAppNameHeader(appName));
    if (!tempResponse) return;
    const { total_cap, used }: { total_cap: number; used: number } =
      tempResponse;

    const freeCap = toBN(total_cap).minus(used);
    const notionalValue = openPriceBN.times(quantityAsset);
    updateNotionalCap({ name: market.name, used, totalCap: total_cap });

    if (freeCap.minus(notionalValue).lte(0)) throw new Error("Cap is reached.");
  }, [appName, baseUrl, market, openPriceBN, quantityAsset, updateNotionalCap]);

  const preConstructCall =
    useCallback(async (): Promise<ConstructCallReturnType> => {
      try {
        if (
          !account ||
          !DiamondContract ||
          !marketId ||
          !collateralCurrency ||
          !partyBWhiteList ||
          !isSupportedChainId ||
          !cva ||
          !mm ||
          !lf
        ) {
          throw new Error("Missing dependencies.");
        }

        await getNotionalCap();
        const { signature, price } = await getSignature();

        if (!signature) {
          throw new Error("Missing signature for constructCall.");
        }

        const muonNotionalValue = toBN(quantityAsset).times(price);
        const muonCVA = muonNotionalValue.times(cva).div(100).div(leverage);
        const muonMM = muonNotionalValue.times(mm).div(100).div(leverage);
        const muonLF = muonNotionalValue.times(lf).div(100).div(leverage);

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
          orderType === OrderType.MARKET ? toWei(muonCVA) : toWei(lockedCVA),
          orderType === OrderType.MARKET ? toWei(muonMM) : toWei(lockedMM),
          orderType === OrderType.MARKET ? toWei(muonLF) : toWei(lockedLF),
          toWei(maxInterestRate),
          BigInt(deadline),
          signature,
        ];

        return {
          args,
          functionName,
          config: {
            account,
            to: DiamondContract.address,
            data: encodeFunctionData({
              abi: DiamondContract.abi,
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
      account,
      DiamondContract,
      marketId,
      collateralCurrency,
      partyBWhiteList,
      isSupportedChainId,
      cva,
      mm,
      lf,
      getNotionalCap,
      getSignature,
      quantityAsset,
      leverage,
      orderType,
      positionType,
      openPriceWied,
      lockedCVA,
      lockedMM,
      lockedLF,
      maxInterestRate,
    ]);

  const constructCall = useMultiAccountable(preConstructCall);

  return useMemo(() => {
    if (
      !account ||
      !chainId ||
      !DiamondContract ||
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

    if (openPriceBN.lte(0)) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: "Price is out of range",
      };
    }
    if (quantityAsset.lte(0)) {
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
    DiamondContract,
    market,
    orderType,
    quantityAsset,
    activeAccountAddress,
    openPriceBN,
    price,
    pricePrecision,
    slippage,
    positionType,
    MultiAccountContract,
    constructCall,
    addTransaction,
    addRecentTransaction,
  ]);
}
