import { useEffect, useState } from "react";
import { createApolloClient } from "./index";
import useActiveWagmi from "../../lib/hooks/useActiveWagmi";
import { useGetUniqueElementInChains } from "../../state/chains";
import { SupportedChainId } from "../../constants";

export function useFundingRateApolloClient(defaultChainId?: SupportedChainId) {
  const { chainId } = useActiveWagmi();
  const fundingRateSubgraphAddresses = useGetUniqueElementInChains(
    "FUNDING_RATE_SUBGRAPH_ADDRESS"
  );
  const [apolloClients, setApolloClients] = useState<{
    [key: string]: ReturnType<typeof createApolloClient>;
  }>({});

  useEffect(() => {
    const clients: { [key: string]: ReturnType<typeof createApolloClient> } =
      {};

    fundingRateSubgraphAddresses.forEach(({ chainId, url }) => {
      if (!clients[chainId]) {
        clients[chainId] = createApolloClient(url);
      }
    });

    setApolloClients(clients);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(fundingRateSubgraphAddresses)]);

  const currentChainId = chainId || defaultChainId;

  return currentChainId ? apolloClients[currentChainId] : undefined;
}
