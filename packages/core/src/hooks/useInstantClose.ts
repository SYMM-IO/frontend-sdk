import { useCallback, useMemo } from "react";
import { SiweMessage } from "siwe";
import { Address } from "viem";
import axios from "axios";

import { makeHttpRequest } from "../utils/http";
import useActiveWagmi from "../lib/hooks/useActiveWagmi";

import { useHedgerInfo } from "../state/hedger/hooks";
import { useActiveAccountAddress } from "../state/user/hooks";
import { useFallbackChainId, usePartyBWhitelistAddress } from "../state/chains";

import { useSignMessage } from "../callbacks/useMultiAccount";
import { useIsAccessDelegated } from "./useIsAccessDelegated";
import {
  useGetOpenInstantClosesCallback,
  useInstantCloseDataCallback,
  useUpdateInstantCloseDataCallback,
} from "../state/quotes/hooks";
import { InstantCloseStatus } from "../state/quotes/types";

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

type InstantCloseResponseType =
  | {
      successful: string;
      message: string;
    }
  | ErrorResponse;

export default function useInstantClose(
  quantityToClose: string,
  closePrice: string | undefined,
  quoteId: number | undefined
) {
  const { account, chainId } = useActiveWagmi();
  const activeAddress = useActiveAccountAddress();
  const { baseUrl } = useHedgerInfo() || {};
  const { callback: signMessageCallback } = useSignMessage();
  const GetOpenInstantCloses = useGetOpenInstantClosesCallback();
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
    const nonceUrl = new URL(`nonce/${activeAddress}`, baseUrl).href;
    const nonceResponse = await makeHttpRequest<NonceResponseType>(nonceUrl);
    if (nonceResponse) return nonceResponse.nonce;
    return "";
  }, [activeAddress, baseUrl]);

  const getAccessToken = useCallback(
    async (
      signature: string,
      expirationTime: string,
      issuedAt: string,
      nonce: string
    ) => {
      const loginUrl = new URL(`login`, baseUrl).href;
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
    [activeAddress, baseUrl]
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
        `${baseUrl}/login`
      );

      const sign = await onSignMessage(message);
      if (sign) {
        await getAccessToken(sign, expirationTime, issuedAt, nonceRes);
      }
    }
  }, [
    account,
    activeAddress,
    baseUrl,
    chainId,
    getAccessToken,
    getNonce,
    onSignMessage,
  ]);

  const cancelClose = useCallback(async () => {
    if (!quoteId) throw new Error("quote id is required");

    const cancelCloseUrl = new URL(`instant_close/${quoteId}`, baseUrl).href;
    try {
      await checkAccessToken();
      const token = localStorage.getItem("access_token");
      const res = await axios.delete(cancelCloseUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 200) {
        GetOpenInstantCloses();
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
  }, [
    GetOpenInstantCloses,
    baseUrl,
    checkAccessToken,
    quoteId,
    updateInstantCloseData,
  ]);

  const instantClose = useCallback(async () => {
    if (!quoteId || !closePrice) throw new Error("missing props");
    if (!quantityToClose) throw new Error("Amount is too low");
    const instantCloseUrl = new URL("instant_close", baseUrl).href;

    const body = {
      quote_id: quoteId,
      quantity_to_close: quantityToClose,
      close_price: closePrice,
    };

    try {
      await checkAccessToken();
      const token = localStorage.getItem("access_token");
      const res = await axios.post<InstantCloseResponseType>(
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
  }, [
    addInstantCloseData,
    baseUrl,
    checkAccessToken,
    closePrice,
    quantityToClose,
    quoteId,
  ]);

  return { instantClose, cancelClose, isAccessDelegated };
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
  return { message: message.prepareMessage(), issuedAt, expirationTime };
}
