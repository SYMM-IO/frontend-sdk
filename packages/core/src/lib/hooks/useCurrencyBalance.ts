import { useMemo } from "react";
import JSBI from "jsbi";
import { Currency, CurrencyAmount, Token } from "@uniswap/sdk-core";

import {
  useMultipleContractSingleData,
  useSingleContractMultipleData,
} from "./multicall";

import { isAddress } from "../../utils/validate";
import { erc20Abi } from "viem";

import useWagmi from "./useWagmi";
import { getSingleWagmiResult } from "../../utils/multicall";
import { nativeOnChain } from "../../utils/token";
import { useMultiCallAddress } from "../../state/chains";
import { MULTICALL3_ABI } from "../../constants";

/**
 * Returns a map of the given addresses to their eventually consistent ETH balances.
 */
export function useNativeCurrencyBalances(
  uncheckedAddresses?: (string | undefined)[]
): {
  [address: string]: CurrencyAmount<Currency> | undefined;
} {
  const { chainId } = useWagmi();

  const MULTICALL3_ADDRESS = useMultiCallAddress();

  const validAddressInputs: [string][] = useMemo(
    () =>
      uncheckedAddresses
        ? uncheckedAddresses
            .filter((a): a is string => a !== undefined)
            .map(isAddress)
            .filter((a): a is string => a !== undefined)
            .sort()
            .map((addr) => [addr])
        : [],
    [uncheckedAddresses]
  );

  const { data: results } = useSingleContractMultipleData(
    chainId ? MULTICALL3_ADDRESS[chainId] : "",
    MULTICALL3_ABI,
    "getEthBalance",
    validAddressInputs
  );

  return useMemo(
    () =>
      validAddressInputs.reduce<{
        [address: string]: CurrencyAmount<Currency>;
      }>((memo, [address], i) => {
        const value = getSingleWagmiResult(results, i);
        if (value && chainId)
          memo[address] = CurrencyAmount.fromRawAmount(
            nativeOnChain(chainId),
            JSBI.BigInt(value.toString())
          );
        return memo;
      }, {}),
    [validAddressInputs, chainId, results]
  );
}

/**
 * Returns a map of token addresses to their eventually consistent token balances for a single account.
 */
export function useTokenBalancesWithLoadingIndicator(
  address?: string,
  tokens?: (Token | undefined)[]
): [{ [tokenAddress: string]: CurrencyAmount<Token> | undefined }, boolean] {
  const { chainId } = useWagmi(); // we cannot fetch balances cross-chain
  const validatedTokens: Token[] = useMemo(
    () =>
      tokens?.filter(
        (t?: Token): t is Token =>
          !!(t?.address && isAddress(t.address) && t?.chainId === chainId)
      ) ?? [],
    [chainId, tokens]
  );
  const validatedTokenAddresses = useMemo(
    () => validatedTokens.map((vt) => vt.address),
    [validatedTokens]
  );

  const { data: balances, isLoading: anyLoading } =
    useMultipleContractSingleData(
      validatedTokenAddresses,
      erc20Abi,
      "balanceOf",
      useMemo(() => (address ? [address] : []), [address])
    );

  return useMemo(
    () => [
      address && validatedTokens.length > 0
        ? validatedTokens.reduce<{
            [tokenAddress: string]: CurrencyAmount<Token> | undefined;
          }>((memo, token, i) => {
            const value = getSingleWagmiResult(balances, i);
            const amount = value ? JSBI.BigInt(value.toString()) : undefined;
            if (amount) {
              memo[token.address] = CurrencyAmount.fromRawAmount(token, amount);
            }
            return memo;
          }, {})
        : {},
      anyLoading,
    ],
    [address, validatedTokens, anyLoading, balances]
  );
}

export function useTokenBalances(
  address?: string,
  tokens?: (Token | undefined)[]
): { [tokenAddress: string]: CurrencyAmount<Token> | undefined } {
  return useTokenBalancesWithLoadingIndicator(address, tokens)[0];
}

// get the balance for a single token/account combo
export function useTokenBalance(
  account?: string,
  token?: Token
): CurrencyAmount<Token> | undefined {
  const tokenBalances = useTokenBalances(account, [token]);
  if (!token) return undefined;
  return tokenBalances[token.address];
}

export function useCurrencyBalances(
  account?: string,
  currencies?: (Currency | undefined)[]
): (CurrencyAmount<Currency> | undefined)[] {
  const tokens = useMemo(
    () =>
      currencies?.filter(
        (currency): currency is Token => currency?.isToken ?? false
      ) ?? [],
    [currencies]
  );

  const tokenBalances = useTokenBalances(account, tokens);
  const containsETH: boolean = useMemo(
    () => currencies?.some((currency) => currency?.isNative) ?? false,
    [currencies]
  );
  const ethBalance = useNativeCurrencyBalances(
    useMemo(() => (containsETH ? [account] : []), [containsETH, account])
  );

  return useMemo(
    () =>
      currencies?.map((currency) => {
        if (!account || !currency) return undefined;
        if (currency.isToken) return tokenBalances[currency.address];
        if (currency.isNative) return ethBalance[account];
        return undefined;
      }) ?? [],
    [account, currencies, ethBalance, tokenBalances]
  );
}

export function useCurrencyBalance(
  account?: string,
  currency?: Currency
): CurrencyAmount<Currency> | undefined {
  return useCurrencyBalances(account, [currency])[0];
}
