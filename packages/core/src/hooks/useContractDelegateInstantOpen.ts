import { useMemo } from "react";
import useActiveWagmi from "../lib/hooks/useActiveWagmi";
import {
  useFallbackChainId,
  useMultiAccountAddress,
  usePartyBWhitelistAddress,
} from "../state/chains";
import { useActiveAccountAddress } from "../state/user/hooks";
import {
  MULTI_ACCOUNT_ABI,
  SEND_QUOTE_HASH_CONTRACT,
  SEND_QUOTE_WITH_AFFILIATE_HASH_CONTRACT,
} from "../constants";
import { useSingleContractMultipleMethods } from "../lib/hooks/multicall";

export function useContractDelegateInstantOpen(): [boolean, boolean] {
  const activeAccountAddress = useActiveAccountAddress();
  const { chainId } = useActiveWagmi();

  const MULTI_ACCOUNT_ADDRESS_CHAIN = useMultiAccountAddress();
  const MULTI_ACCOUNT_ADDRESS = useMemo(
    () => (chainId ? MULTI_ACCOUNT_ADDRESS_CHAIN[chainId] : ""),
    [MULTI_ACCOUNT_ADDRESS_CHAIN, chainId]
  );
  const PARTY_B_WHITELIST = usePartyBWhitelistAddress();
  const FALLBACK_CHAIN_ID = useFallbackChainId();
  const partyBWhiteList = useMemo(
    () => [PARTY_B_WHITELIST[chainId ?? FALLBACK_CHAIN_ID]],
    [FALLBACK_CHAIN_ID, PARTY_B_WHITELIST, chainId]
  );

  const calls =
    activeAccountAddress && chainId
      ? [
          {
            functionName: "delegatedAccesses",
            callInputs: [
              activeAccountAddress,
              partyBWhiteList[0],
              SEND_QUOTE_HASH_CONTRACT,
            ],
          },
          {
            functionName: "delegatedAccesses",
            callInputs: [
              activeAccountAddress,
              partyBWhiteList[0],
              SEND_QUOTE_WITH_AFFILIATE_HASH_CONTRACT,
            ],
          },
        ]
      : [];
  const { data: delegateResult, isSuccess: isDelegateSuccess } =
    useSingleContractMultipleMethods(
      MULTI_ACCOUNT_ADDRESS,
      MULTI_ACCOUNT_ABI,
      calls
    );

  return [
    isDelegateSuccess && delegateResult?.[0]?.result ? true : false,
    isDelegateSuccess && delegateResult?.[1]?.result ? true : false,
  ];
}
