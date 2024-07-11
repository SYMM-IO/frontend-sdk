import * as toolkitRaw from "@reduxjs/toolkit/dist/redux-toolkit.cjs.production.min.js";
import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
const { createAsyncThunk } = ((toolkitRaw as any).default ??
  toolkitRaw) as typeof toolkitRaw;
import {
  BALANCE_CHANGES_DATA,
  TOTAL_DEPOSITS_AND_WITHDRAWALS,
} from "../../apollo/queries";
import { makeHttpRequest } from "../../utils/http";
import {
  BalanceHistoryData,
  BalanceInfo,
  BalanceInfosType,
  DepositWithdrawalsData,
} from "./types";
import { BALANCE_HISTORY_ITEMS_NUMBER } from "../../constants/misc";
import { getAppNameHeader } from "../hedger/thunks";
import { WEB_SETTING } from "../../config/index";
import { Address } from "viem";

export const getIsWhiteList = createAsyncThunk(
  "user/getWalletWhitelist",
  async (payload: {
    baseUrl: string;
    account: Address;
    multiAccountAddress: string | undefined;
    appName: string;
  }) => {
    const {
      baseUrl: hedgerUrl,
      account,
      multiAccountAddress,
      appName,
    } = payload;

    if (!hedgerUrl) {
      throw new Error("hedgerUrl is empty");
    }
    if (!account) {
      throw new Error("account is empty");
    }
    if (!multiAccountAddress) {
      throw new Error("multiAccountAddress is empty");
    }

    const { href: isWhiteListUrl } = new URL(
      `/check_in-whitelist/${account}/${multiAccountAddress}`,
      hedgerUrl
    );

    let isWhiteList: null | boolean = null;
    try {
      if (!WEB_SETTING.checkWhiteList) return { isWhiteList: true };

      const [whiteListRes] = await Promise.allSettled([
        makeHttpRequest<boolean>(isWhiteListUrl, getAppNameHeader(appName)),
      ]);
      if (whiteListRes.status === "fulfilled") {
        isWhiteList = whiteListRes.value;
      }
    } catch (error) {
      isWhiteList = false;
      console.error(error, " happened in check-in-whitelist");
    }

    return { isWhiteList };
  }
);

export const getBalanceHistory = createAsyncThunk(
  "user/getBalanceHistory",
  async ({
    account,
    chainId,
    skip,
    first,
    client,
  }: {
    account: string | null | undefined;
    chainId: number | undefined;
    skip: number;
    first: number;
    client: ApolloClient<NormalizedCacheObject>;
  }) => {
    if (!account) {
      throw new Error("account is undefined");
    }
    if (!chainId) {
      throw new Error("chainId is empty");
    }
    if (!client) {
      throw new Error("Apollo client is not provided");
    }

    try {
      let hasMore = true;

      const {
        data: { balanceChanges },
      } = await client.query<{
        balanceChanges: BalanceHistoryData[];
      }>({
        query: BALANCE_CHANGES_DATA,
        variables: { account: account.toLowerCase(), first, skip },
        fetchPolicy: "no-cache",
      });

      if (balanceChanges.length !== BALANCE_HISTORY_ITEMS_NUMBER) {
        hasMore = false;
      }
      hasMore = true;
      return { result: balanceChanges, hasMore };
    } catch (error) {
      console.error(error);
      throw new Error(`Unable to query balance history data from Client`);
    }
  }
);

export const getTotalDepositsAndWithdrawals = createAsyncThunk(
  "user/getTotalDepositsAndWithdrawals",
  async ({
    account,
    chainId,
    client,
  }: {
    account: string | null | undefined;
    chainId: number | undefined;
    client: ApolloClient<NormalizedCacheObject>;
  }) => {
    if (!account) {
      throw new Error("account is undefined");
    }
    if (!chainId) {
      throw new Error("chainId is empty");
    }
    if (!client) {
      throw new Error("Apollo client is not provided");
    }

    try {
      const {
        data: { accounts },
      } = await client.query<{ accounts: DepositWithdrawalsData[] }>({
        query: TOTAL_DEPOSITS_AND_WITHDRAWALS,
        variables: { id: account.toLowerCase() },
        fetchPolicy: "no-cache",
      });

      if (accounts.length) return { result: accounts[0] };
      return { result: null };
    } catch (error) {
      console.error(error);
      throw new Error(`Unable to query Deposits And Withdrawals from Client`);
    }
  }
);

export const getBalanceInfo = createAsyncThunk(
  "user/getBalanceInfo",
  async (payload: {
    baseUrl: string | undefined;
    account: string | undefined;
    multiAccountAddress: string | undefined;
  }) => {
    const { baseUrl: hedgerUrl, account, multiAccountAddress } = payload;

    if (!hedgerUrl) {
      throw new Error("hedgerUrl is empty");
    }
    if (!account) {
      throw new Error("account is empty");
    }

    const { href: balanceInfoUrl } = new URL(
      `/get_balance_info/${account}/${multiAccountAddress}`,
      hedgerUrl
    );

    const balanceInfos: BalanceInfosType = {};
    try {
      const [balanceInfoRes] = await Promise.allSettled([
        makeHttpRequest(balanceInfoUrl),
      ]);

      if (balanceInfoRes.status === "fulfilled") {
        const value = balanceInfoRes.value as BalanceInfo;
        const keys = Object.keys(value);

        keys.forEach((key) => {
          const info = value[key]?.party_a;
          balanceInfos[key.toLowerCase()] = {
            allocatedBalance: info.allocated_balance,
            availableBalance: info.available_balance,
            cva: info.cva,
            lf: info.lf,
            notional: info.notional,
            mm: info.party_a_mm,
            pendingCva: info.pending_cva,
            pendingLf: info.pending_lf,
            pendingMm: info.pending_party_a_mm,
            upnl: info.upnl,
            timestamp: info.timestamp,
          } as BalanceInfo;
        });
      }
    } catch (error) {
      console.error(error, " happened in getBalanceInfo");
      throw error;
    }

    return balanceInfos;
  }
);
