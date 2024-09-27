import * as toolkitRaw from "@reduxjs/toolkit/dist/redux-toolkit.cjs.production.min.js";
const { createAsyncThunk } = ((toolkitRaw as any).default ??
  toolkitRaw) as typeof toolkitRaw;
import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { ORDER_HISTORY_DATA } from "../../apollo/queries";
import {
  InstantCloseResponseType,
  InstantCloseStatus,
  InstantOpenResponseType,
  SubGraphData,
} from "./types";
import { Quote } from "../../types/quote";
import { OrderType } from "../../types/trade";
import { fromWei } from "../../utils/numbers";
import {
  getPositionTypeByIndex,
  getQuoteStateByIndex,
} from "../../hooks/useQuotes";
import { makeHttpRequest } from "../../utils/http";
import {
  ActionStatus,
  LastSeenAction,
  NotificationResponse,
  NotificationUrlResponseType,
} from "../notifications/types";

const NEXT_PUBLIC_ORBS_INSTANT_BASE_URL = process.env
  .NEXT_PUBLIC_ORBS_INSTANT_BASE_URL as string;

function toQuoteFromGraph(entity: SubGraphData) {
  return {
    id: Number(entity.quoteId),
    partyBsWhiteList: entity.partyBsWhiteList,
    marketId: Number(entity.symbolId),
    positionType: getPositionTypeByIndex(entity.positionType),
    orderType: entity.orderTypeOpen === 1 ? OrderType.MARKET : OrderType.LIMIT,
    openedPrice: fromWei(entity.openedPrice),
    requestedOpenPrice: fromWei(entity.requestedOpenPrice),
    quantity: fromWei(entity.quantity),
    initialCVA: fromWei(entity.initialData.cva ?? null),
    initialPartyAMM: fromWei(entity.initialData.partyAmm ?? null),
    initialLF: fromWei(entity.initialData.lf ?? null),
    CVA: fromWei(entity.cva),
    partyAMM: fromWei(entity.partyAmm),
    LF: fromWei(entity.lf),
    partyA: entity.partyA,
    partyB: entity.partyB,
    quoteStatus: getQuoteStateByIndex(entity.quoteStatus),
    avgClosedPrice: fromWei(entity.averageClosedPrice),
    quantityToClose: fromWei(entity.quantityToClose),
    statusModifyTimestamp: Number(entity.timeStamp),
    createTimestamp: Number(entity.initialData.timeStamp ?? null),
    deadline: Number(entity.deadline),
    marketPrice: fromWei(entity.marketPrice),
    closedAmount: fromWei(entity.closedAmount),
    liquidateAmount: fromWei(entity.liquidateAmount),
    liquidatePrice: fromWei(entity.liquidatePrice),
  } as Quote;
}

export const getHistory = createAsyncThunk(
  "quotes/getHistory",
  async ({
    account,
    chainId,
    client,
    skip,
    first,
    ItemsPerPage,
  }: {
    account: string;
    chainId: number;
    client: ApolloClient<NormalizedCacheObject>;
    skip: number;
    first: number;
    ItemsPerPage: number;
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
      let hasMore = false;
      const {
        data: { resultEntities },
      } = await client.query({
        query: ORDER_HISTORY_DATA,
        variables: { address: account, first, skip },
        fetchPolicy: "no-cache",
      });

      const quotes: Quote[] = resultEntities.map((entity: SubGraphData) =>
        toQuoteFromGraph(entity)
      );
      if (quotes.length === ItemsPerPage + 1) {
        hasMore = true;
      }

      return { quotes, hasMore, chainId };
    } catch (error) {
      console.error(error);
      throw new Error(`Unable to query data from Client`);
    }
  }
);

export const getInstantActions = createAsyncThunk(
  "quotes/getInstantActions",
  async ({
    baseUrl,
    account,
    appName,
  }: {
    baseUrl: string | undefined;
    account: string;
    appName: string;
  }): Promise<{
    instantCloses: InstantCloseResponseType;
    instantOpens: InstantOpenResponseType;
  }> => {
    if (!baseUrl) {
      throw new Error("baseUrl is empty");
    }

    const getInstantClosesUrl = new URL(
      `instant_close/${account}`,
      NEXT_PUBLIC_ORBS_INSTANT_BASE_URL
    ).href;
    const getInstantOpensUrl = new URL(
      `instant_open/${account}`,
      NEXT_PUBLIC_ORBS_INSTANT_BASE_URL
    ).href;

    let instantCloses: InstantCloseResponseType = [];
    let instantOpens: InstantOpenResponseType = [];

    const method = "GET";
    const headers = [
      ["Content-Type", "application/json"],
      ["App-Name", appName],
    ];
    try {
      const [instantClosesRes, instantOpenRes] = await Promise.allSettled([
        makeHttpRequest<InstantCloseResponseType>(getInstantClosesUrl, {
          method,
          headers,
        }),
        makeHttpRequest<InstantOpenResponseType>(getInstantOpensUrl, {
          method,
          headers,
        }),
      ]);

      if (
        instantClosesRes &&
        instantClosesRes.status === "fulfilled" &&
        instantClosesRes.value
      ) {
        instantCloses = await checkInstantClosesStatus(
          baseUrl,
          appName,
          account,
          instantClosesRes.value
        );
      }
      if (
        instantOpenRes &&
        instantOpenRes.status === "fulfilled" &&
        instantOpenRes.value
      ) {
        instantOpens = instantOpenRes.value;
      }

      return { instantCloses, instantOpens };
    } catch (error) {
      throw new Error(`Unable to get instant closes data from hedger`);
    }
  }
);

const getPositionState = async (
  url: string,
  appName: string,
  account: string,
  quoteId: number
) => {
  try {
    const body = JSON.stringify({
      address: `${account}`,
      quote_id: quoteId.toString(),
    });
    const { href: getNotificationsUrl } = new URL(`position-state/0/5`, url);
    const response = makeHttpRequest<NotificationUrlResponseType>(
      getNotificationsUrl,
      {
        method: "POST",
        headers: [
          ["Content-Type", "application/json"],
          ["App-Name", appName],
        ],
        body,
      }
    );

    return response; // Modify according to the actual response structure
  } catch (error) {
    console.error(`Failed to check position state for URL ${url}:`, error);
    return null;
  }
};

const checkInstantClosesStatus = async (
  baseUrl: string,
  appName: string,
  account: string,
  instantCloses: any
) => {
  // In this function, we check the position state API for each instant close status to determine whether the quote is processing or has failed.

  const positionStateChecks = instantCloses.map(async (item) => {
    const result = await getPositionState(
      baseUrl,
      appName,
      account,
      item.quote_id
    );
    return { ...item, positionState: result };
  });

  const positionsNotificationsData = await Promise.all(positionStateChecks);

  const data = positionsNotificationsData.map((state) => {
    let status = InstantCloseStatus.PROCESSING;
    const positionNotification = state.positionState?.position_state;

    if (positionNotification && positionNotification.length) {
      positionNotification.forEach((s: NotificationResponse) => {
        if (
          s.action_status === ActionStatus.FAILED &&
          (s.last_seen_action === LastSeenAction.FILL_ORDER_INSTANT_CLOSE ||
            s.last_seen_action ===
              LastSeenAction.INSTANT_REQUEST_TO_CLOSE_POSITION)
        ) {
          status = InstantCloseStatus.FAILED;
        }
      });
    }

    return {
      quantity_to_close: state.quantity_to_close,
      quote_id: state.quote_id,
      close_price: state.close_price,
      status,
    };
  });

  return data;
};
