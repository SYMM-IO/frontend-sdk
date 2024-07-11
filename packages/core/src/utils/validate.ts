import { getAddress } from "viem";

export function isAddress(value: string): string | undefined {
  try {
    return getAddress(value);
  } catch {
    return undefined;
  }
}
