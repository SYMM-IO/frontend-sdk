import { PriceResponse } from "../state/hedger/types";
import { Market } from "./market";

export interface OpenInterest {
  total: number;
  used: number;
}

export type Hedger = {
  id: string;
  apiUrl: string;
  baseUrl: string;
  tpslUrl: string;
  webSocketUrl: string;
  webSocketUpnlUrl: string;
  webSocketNotificationUrl: string;
  defaultMarketId: number;
  markets: Market[];
  webSocketFundingRateUrl: string;
  openInterest: OpenInterest;
  fetchData: boolean;
  clientName?: string;
};

export interface HedgerInfoMap {
  [chainId: number]: Hedger[];
}

export type HedgerWebsocketType = {
  stream: string;
  data: PriceResponse[];
} | null;
