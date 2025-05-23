import { SupportedChainId } from "@symmio/frontend-sdk/constants/chains";
import { Hedger, OpenInterest } from "@symmio/frontend-sdk/types/hedger";

export const DEFAULT_HEDGER = {
  apiUrl: "https://fapi.binance.com/",
  webSocketUrl: "wss://fstream.binance.com/stream",
  baseUrl: "https://polygon-hedger-test.rasa.capital",
  tpslUrl: "",
  webSocketFundingRateUrl:
    "wss://polygon-hedger-test.rasa.capital/ws/funding-rate-ws",
  webSocketUpnlUrl: "",
  webSocketNotificationUrl: "",
  defaultMarketId: 1,
  markets: [],
  openInterest: { total: 0, used: 0 },
  id: "Cloverfield",
  fetchData: false,
} as Hedger;

export const HedgerInfo = {
  [SupportedChainId.FANTOM]: [
    {
      apiUrl: "https://fapi.binance.com/",
      webSocketUrl: "wss://fstream.binance.com/stream",
      baseUrl: `https://${process.env.NEXT_PUBLIC_FANTOM_HEDGER_URL}`,
      tpslUrl: "",
      webSocketUpnlUrl: `wss://${process.env.NEXT_PUBLIC_FANTOM_HEDGER_URL}/ws/upnl-ws`,
      webSocketNotificationUrl: `wss://${process.env.NEXT_PUBLIC_FANTOM_HEDGER_URL}/ws/position-state-ws3`,
      webSocketFundingRateUrl: `wss://${process.env.NEXT_PUBLIC_FANTOM_HEDGER_URL}/ws/funding-rate-ws`,
      defaultMarketId: 1,
      markets: [],
      openInterest: { total: 0, used: 0 } as OpenInterest,
      id: "symmio",
      fetchData: true,
      clientName: "THENA",
    },
  ],
  [SupportedChainId.BSC]: [
    {
      apiUrl: "https://fapi.binance.com/",
      webSocketUrl: "wss://fstream.binance.com/stream",
      baseUrl: `https://${process.env.NEXT_PUBLIC_BSC_HEDGER_URL}`,
      tpslUrl: "",
      webSocketUpnlUrl: `wss://${process.env.NEXT_PUBLIC_BSC_HEDGER_URL}/ws/upnl-ws`,
      webSocketNotificationUrl: `wss://${process.env.NEXT_PUBLIC_BSC_HEDGER_URL}/ws/position-state-ws3`,
      webSocketFundingRateUrl: `wss://${process.env.NEXT_PUBLIC_BSC_HEDGER_URL}/ws/funding-rate-ws`,
      defaultMarketId: 1,
      markets: [],
      openInterest: { total: 0, used: 0 } as OpenInterest,
      id: "alpha-hedger2",
      fetchData: true,
      clientName: "THENA",
    },
  ],

  [SupportedChainId.POLYGON]: [
    {
      apiUrl: "https://fapi.binance.com/",
      webSocketUrl: "wss://fstream.binance.com/stream",
      baseUrl: `https://${process.env.NEXT_PUBLIC_POLYGON_HEDGER_URL}`,
      tpslUrl: "",
      webSocketUpnlUrl: `wss://${process.env.NEXT_PUBLIC_POLYGON_HEDGER_URL}/ws/upnl-ws`,
      webSocketNotificationUrl: `wss://${process.env.NEXT_PUBLIC_POLYGON_HEDGER_URL}/ws/position-state-ws3`,
      webSocketFundingRateUrl: `wss://${process.env.NEXT_PUBLIC_POLYGON_HEDGER_URL}/ws/funding-rate-ws`,
      defaultMarketId: 1,
      markets: [],
      openInterest: { total: 0, used: 0 } as OpenInterest,
      id: "alpha-hedger2",
      fetchData: true,
      clientName: "CLOVERFIELD_TEST",
    },
  ],
  [SupportedChainId.MANTLE]: [
    {
      apiUrl: "https://fapi.binance.com/",
      webSocketUrl: "wss://fstream.binance.com/stream",
      baseUrl: `https://${process.env.NEXT_PUBLIC_MANTLE_HEDGER_URL}`,
      tpslUrl: "",
      webSocketUpnlUrl: `wss://${process.env.NEXT_PUBLIC_MANTLE_HEDGER_URL}/ws/upnl-ws`,
      webSocketNotificationUrl: `wss://${process.env.NEXT_PUBLIC_MANTLE_HEDGER_URL}/ws/position-state-ws3`,
      webSocketFundingRateUrl: `wss://${process.env.NEXT_PUBLIC_MANTLE_HEDGER_URL}/ws/funding-rate-ws`,
      defaultMarketId: 1,
      markets: [],
      openInterest: { total: 0, used: 0 } as OpenInterest,
      id: "mantle-hedger",
      fetchData: true,
      clientName: "MANTLE",
    },
  ],
  [SupportedChainId.BASE]: [
    {
      apiUrl: "https://fapi.binance.com/",
      webSocketUrl: "wss://fstream.binance.com/stream",
      baseUrl: `https://${process.env.NEXT_PUBLIC_BASE_HEDGER_URL}`,
      tpslUrl: "https://base-hedger82.rasa.capital/",
      webSocketUpnlUrl: `wss://${process.env.NEXT_PUBLIC_BASE_HEDGER_URL}/ws/upnl-ws`,
      webSocketNotificationUrl: `wss://${process.env.NEXT_PUBLIC_BASE_HEDGER_URL}/ws/position-state-ws3`,
      webSocketFundingRateUrl: `wss://${process.env.NEXT_PUBLIC_BASE_HEDGER_URL}/ws/funding-rate-ws`,
      defaultMarketId: 1,
      markets: [],
      openInterest: { total: 0, used: 0 } as OpenInterest,
      id: "mantle-hedger",
      fetchData: true,
      clientName: "BASE",
    },
  ],
  [SupportedChainId.BLAST]: [
    {
      apiUrl: "https://fapi.binance.com/",
      webSocketUrl: "wss://fstream.binance.com/stream",
      baseUrl: `https://${process.env.NEXT_PUBLIC_BLAST_HEDGER_URL}`,
      tpslUrl: "",
      webSocketUpnlUrl: `wss://${process.env.NEXT_PUBLIC_BLAST_HEDGER_URL}/ws/upnl-ws`,
      webSocketNotificationUrl: `wss://${process.env.NEXT_PUBLIC_BLAST_HEDGER_URL}/ws/position-state-ws3`,
      webSocketFundingRateUrl: `wss://${process.env.NEXT_PUBLIC_BLAST_HEDGER_URL}/ws/funding-rate-ws`,
      defaultMarketId: 1,
      markets: [],
      openInterest: { total: 0, used: 0 } as OpenInterest,
      id: "blast-hedger",
      fetchData: true,
      clientName: "BLAST",
    },
  ],
  [SupportedChainId.ARBITRUM]: [
    {
      apiUrl: "https://fapi.binance.com/",
      webSocketUrl: "wss://fstream.binance.com/stream",
      baseUrl: `https://${process.env.NEXT_PUBLIC_ARBITRUM_HEDGER_URL}`,
      tpslUrl: "",
      webSocketUpnlUrl: `wss://${process.env.NEXT_PUBLIC_ARBITRUM_HEDGER_URL}/ws/upnl-ws`,
      webSocketNotificationUrl: `wss://${process.env.NEXT_PUBLIC_ARBITRUM_HEDGER_URL}/ws/position-state-ws3`,
      webSocketFundingRateUrl: `wss://${process.env.NEXT_PUBLIC_ARBITRUM_HEDGER_URL}/ws/funding-rate-ws`,
      defaultMarketId: 1,
      markets: [],
      openInterest: { total: 0, used: 0 } as OpenInterest,
      id: "arbitrum-hedger",
      fetchData: true,
      clientName: "ARBITRUM",
    },
  ],
  [SupportedChainId.IOTA]: [
    {
      apiUrl: "https://fapi.binance.com/",
      webSocketUrl: "wss://fstream.binance.com/stream",
      baseUrl: `https://${process.env.NEXT_PUBLIC_IOTA_HEDGER_URL}`,
      tpslUrl: "",
      webSocketUpnlUrl: `wss://${process.env.NEXT_PUBLIC_IOTA_HEDGER_URL}/ws/upnl-ws`,
      webSocketNotificationUrl: `wss://${process.env.NEXT_PUBLIC_IOTA_HEDGER_URL}/ws/position-state-ws3`,
      webSocketFundingRateUrl: `wss://${process.env.NEXT_PUBLIC_IOTA_HEDGER_URL}/ws/funding-rate-ws`,
      defaultMarketId: 1,
      markets: [],
      openInterest: { total: 0, used: 0 } as OpenInterest,
      id: "iota-hedger",
      fetchData: true,
      clientName: "IOTA",
    },
  ],
  [SupportedChainId.NOT_SET]: [DEFAULT_HEDGER],
};
