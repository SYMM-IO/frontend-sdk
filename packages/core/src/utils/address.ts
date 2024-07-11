import { isAddress } from "./validate";

export interface AddressMap {
  [chainId: number]: string;
}
export interface DecimalMap {
  [chainId: number]: number;
}

export interface SymbolMap {
  [chainId: number]: string;
}

export function truncateAddress(address: string, size = 4) {
  const parsed = isAddress(address);
  if (!parsed) {
    console.error(`Invalid 'address' parameter '${address}'.`);
    return null;
  }
  return `${parsed.substring(0, size + 2)}...${parsed.substring(
    address.length - size
  )}`;
}
