import { Address } from "viem";

export type UpnlSigType = {
  reqId: string;
  timestamp: number;
  upnl: string;
  sigs: SchnorrerSign;
} | null;

export type SchnorrerSign = {
  signature: bigint;
  owner: Address;
  nonce: Address;
};

export type PriceSig = {
  reqId: string;
  timestamp: number;
  quoteIds: string[];
  prices: string[];
  sigs: SchnorrerSign;
} | null;

export type SingleUpnlAndPriceSig = {
  reqId: Address;
  timestamp: bigint;
  upnl: bigint;
  price: bigint;
  gatewaySignature: Address;
  sigs: SchnorrerSign;
} | null;
