import { useCallback, useMemo } from "react";
import { SiweMessage } from "siwe";
import { Address } from "viem";
import axios from "axios";

import { makeHttpRequest } from "../utils/http";
import useActiveWagmi from "../lib/hooks/useActiveWagmi";

import { useActiveAccountAddress } from "../state/user/hooks";
import { useFallbackChainId, usePartyBWhitelistAddress } from "../state/chains";

import { useSignMessage } from "../callbacks/useMultiAccount";
import { useIsAccessDelegated } from "./useIsAccessDelegated";
import {
  useGetOpenInstantOrdersCallback,
  useInstantCloseDataCallback,
  useUpdateInstantCloseDataCallback,
} from "../state/quotes/hooks";
import { InstantCloseStatus } from "../state/quotes/types";
import { useContractDelegateInstantOpen } from "./useContractDelegateInstantOpen";
import {
  useActiveMarketId,
  useOrderType,
  usePositionType,
} from "../state/trade/hooks";
import useTradePage, {
  useLockedCVA,
  useLockedLF,
  useMaxFundingRate,
  useNotionalValue,
  usePartyALockedMM,
  usePartyBLockedMM,
} from "./useTradePage";
import { OrderType, PositionType } from "../types/trade";
import { formatPrice, toBN } from "../utils/numbers";
import { useMarket } from "./useMarkets";
import { LIMIT_ORDER_DEADLINE, MARKET_ORDER_DEADLINE } from "../constants";
import { useHedgerInfo } from "../state/hedger/hooks";

type NonceResponseType = {
  nonce: string;
};

type ErrorResponse = {
  error_code: number;
  error_message: string;
  error_detail: string[];
};

type LoginResponseType =
  | {
      access_token: string;
    }
  | ErrorResponse;

type InstantActionResponseType =
  | {
      successful: string;
      message: string;
    }
  | ErrorResponse;

export default function useInstantActions() {
  const { instantUrl } = useHedgerInfo();
  const { account, chainId } = useActiveWagmi();
  const activeAddress = useActiveAccountAddress();

  const { callback: signMessageCallback } = useSignMessage();
  const GetOpenInstantOrders = useGetOpenInstantOrdersCallback();
  const updateInstantCloseData = useUpdateInstantCloseDataCallback();
  const addInstantCloseData = useInstantCloseDataCallback();

  const PARTY_B_WHITELIST = usePartyBWhitelistAddress();
  const FALLBACK_CHAIN_ID = useFallbackChainId();
  const partyBWhiteList = useMemo(
    () => [PARTY_B_WHITELIST[chainId ?? FALLBACK_CHAIN_ID]],
    [FALLBACK_CHAIN_ID, PARTY_B_WHITELIST, chainId]
  );

  const isAccessDelegated = useIsAccessDelegated(
    partyBWhiteList[0],
    "0x501e891f"
  );

  const instantOpenDelegateAccesses = useContractDelegateInstantOpen();
  const isSendQuoteDelegated = useMemo(() => {
    if (instantOpenDelegateAccesses && instantOpenDelegateAccesses.length > 1) {
      return instantOpenDelegateAccesses[0] && instantOpenDelegateAccesses[1];
    }
    return false;
  }, [instantOpenDelegateAccesses]);

  const marketId = useActiveMarketId();
  const { pricePrecision } = useMarket(marketId) || {};
  const orderType = useOrderType();
  const positionType = usePositionType();
  const { price, formattedAmounts } = useTradePage();
  const quantityAsset = useMemo(
    () => (toBN(formattedAmounts[1]).isNaN() ? "0" : formattedAmounts[1]),
    [formattedAmounts]
  );
  const notionalValue = useNotionalValue(
    quantityAsset,
    formatPrice(price, pricePrecision)
  );
  const lockedCVA = useLockedCVA(notionalValue);
  const lockedLF = useLockedLF(notionalValue);
  const lockedPartyAMM = usePartyALockedMM(notionalValue);
  const lockedPartyBMM = usePartyBLockedMM(notionalValue);
  const getDeadline = (orderType: OrderType) =>
    orderType === OrderType.MARKET
      ? Math.floor(Date.now() / 1000) + MARKET_ORDER_DEADLINE
      : Math.floor(Date.now() / 1000) + LIMIT_ORDER_DEADLINE;
  const maxFundingRate = useMaxFundingRate();

  const onSignMessage = useCallback(
    async (message: string) => {
      if (!signMessageCallback || !message) return "";

      try {
        const sign = await signMessageCallback(message);

        return sign;
      } catch (e) {
        if (e instanceof Error) {
          console.error(e);
        } else {
          console.debug(e);
        }
        throw e;
      }
    },
    [signMessageCallback]
  );

  const getNonce = useCallback(async () => {
    const nonceUrl = new URL(`nonce/${activeAddress}`, instantUrl).href;
    const nonceResponse = await makeHttpRequest<NonceResponseType>(nonceUrl);
    if (nonceResponse) return nonceResponse.nonce;
    return "";
  }, [activeAddress, instantUrl]);

  const getAccessToken = useCallback(
    async (
      signature: string,
      expirationTime: string,
      issuedAt: string,
      nonce: string
    ) => {
      const loginUrl = new URL(`login`, instantUrl).href;
      const body = {
        account_address: `${activeAddress}`,
        expiration_time: expirationTime,
        issued_at: issuedAt,
        signature,
        nonce,
      };

      try {
        const response = await axios.post<LoginResponseType>(loginUrl, body, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if ("access_token" in response.data) {
          localStorage.setItem("access_token", response.data.access_token);
          localStorage.setItem("expiration_time", expirationTime);
          localStorage.setItem("issued_at", issuedAt);
          localStorage.setItem("active_address", activeAddress ?? "");
        } else {
          console.error("Login Error:", response.data.error_message);
          localStorage.removeItem("access_token");
          localStorage.removeItem("expiration_time");
          localStorage.removeItem("issued_at");
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Axios error:", error.response?.data);
          throw new Error(
            error.response?.data.error_message || "An unknown error occurred"
          );
        } else {
          console.error("Unexpected error:", error);
          throw new Error("An unexpected error occurred");
        }
      }
    },
    [activeAddress, instantUrl]
  );

  const checkAccessToken = useCallback(async () => {
    if (!account || !chainId) return;

    const token = localStorage.getItem("access_token");
    const sub_account_address = localStorage.getItem("active_address");
    const currentDate = new Date();
    const expiration_date = new Date(
      localStorage.getItem("expiration_time") ?? "0"
    );

    if (
      token &&
      expiration_date > currentDate &&
      sub_account_address === activeAddress
    ) {
      return;
    } else {
      const nonceRes = await getNonce();
      const host = window.location.hostname;
      const { expirationTime, issuedAt, message } = createSiweMessage(
        account,
        `msg: ${activeAddress}`,
        chainId,
        nonceRes,
        host,
        `${instantUrl}login`
      );

      const sign = await onSignMessage(message);
      if (sign) {
        await getAccessToken(sign, expirationTime, issuedAt, nonceRes);
      }
    }
  }, [
    account,
    activeAddress,
    chainId,
    getAccessToken,
    getNonce,
    instantUrl,
    onSignMessage,
  ]);

  const cancelInstantAction = useCallback(
    async (quoteId: number) => {
      if (!quoteId) throw new Error("quote id is required");

      const cancelCloseUrl = new URL(`instant_close/${quoteId}`, instantUrl)
        .href;
      const cancelOpenUrl = new URL(`instant_open/${quoteId}`, instantUrl).href;
      const isCancelClose = quoteId > 0;

      try {
        await checkAccessToken();
        const token = localStorage.getItem("access_token");
        const res = await axios.delete(
          isCancelClose ? cancelCloseUrl : cancelOpenUrl,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.status === 200) {
          GetOpenInstantOrders();
          isCancelClose &&
            updateInstantCloseData({
              id: quoteId,
              status: InstantCloseStatus.FINISHED,
            });
        }
      } catch (error: any) {
        if (axios.isAxiosError(error)) {
          console.error("Axios error:", error.response?.data);
          throw new Error(
            error.response?.data.error_message || "An unknown error occurred"
          );
        } else {
          console.error("Unexpected error:", error);
          throw new Error(error?.message || "An unexpected error occurred");
        }
      }
    },
    [GetOpenInstantOrders, checkAccessToken, updateInstantCloseData]
  );

  const instantClose = useCallback(
    async (quoteId: number, closePrice: string, quantityToClose: string) => {
      const instantCloseUrl = new URL("instant_close", instantUrl).href;

      const body = {
        quote_id: quoteId,
        quantity_to_close: quantityToClose,
        close_price: closePrice,
      };

      try {
        await checkAccessToken();
        const token = localStorage.getItem("access_token");
        const res = await axios.post<InstantActionResponseType>(
          instantCloseUrl,
          body,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.status === 200) {
          addInstantCloseData({
            id: quoteId,
            timestamp: Math.floor(new Date().getTime() / 1000),
            amount: quantityToClose,
            status: InstantCloseStatus.STARTED,
          });
        }
      } catch (error: any) {
        if (axios.isAxiosError(error)) {
          console.error("Axios error:", error.response?.data);
          throw new Error(
            error.response?.data.error_message || "An unknown error occurred"
          );
        } else {
          console.error("Unexpected error:", error);
          throw new Error(error?.message || "An unexpected error occurred");
        }
      }
    },
    [addInstantCloseData, checkAccessToken, instantUrl]
  );

  const instantOpen = useCallback(async () => {
    if (!pricePrecision) throw new Error("missing market props");

    const instantOpenUrl = new URL("instant_open", instantUrl).href;

    const body = {
      symbolId: marketId,
      positionType: positionType === PositionType.SHORT ? 1 : 0,
      orderType: orderType === OrderType.MARKET ? 1 : 0,
      price: formatPrice(price, pricePrecision),
      quantity: quantityAsset,
      cva: lockedCVA,
      lf: lockedLF,
      partyAmm: lockedPartyAMM,
      partyBmm: lockedPartyBMM,
      maxFundingRate,
      deadline: getDeadline(orderType),
    };
    try {
      await checkAccessToken();

      const token = localStorage.getItem("access_token");
      const res = await axios.post<InstantActionResponseType>(
        instantOpenUrl,
        body,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 200) {
        GetOpenInstantOrders();
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data);
        throw new Error(
          error.response?.data.error_message || "An unknown error occurred"
        );
      } else {
        console.error("Unexpected error:", error);
        throw new Error(error?.message || "An unexpected error occurred");
      }
    }
  }, [
    GetOpenInstantOrders,
    checkAccessToken,
    lockedCVA,
    lockedLF,
    lockedPartyAMM,
    lockedPartyBMM,
    pricePrecision,
    marketId,
    maxFundingRate,
    orderType,
    positionType,
    price,
    quantityAsset,
  ]);

  return {
    instantClose,
    cancelInstantAction,
    isAccessDelegated,
    isSendQuoteDelegated,
    instantOpen,
  };
}

function createSiweMessage(
  address: Address,
  statement: string,
  chainId: number,
  nonce: string,
  domain: string,
  uri: string,
  version = "1"
) {
  const issuedAt = new Date().toISOString();
  const expirationTime = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now
  const message = new SiweMessage({
    domain,
    address,
    statement,
    chainId,
    nonce,
    version,
    uri,
    issuedAt,
    expirationTime,
  });
  console.log("siwe message:", message);
  return { message: message.prepareMessage(), issuedAt, expirationTime };
}
