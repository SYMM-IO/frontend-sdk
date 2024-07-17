import { createApolloClient } from "./index";
import useActiveWagmi from "../../lib/hooks/useActiveWagmi";
import { useFundingRateSubgraphAddress } from "../../state/chains";

// FUNDING RATE SUBGRAPH
const apolloClients = {};

export function useFundingRateApolloClient() {
  const { chainId } = useActiveWagmi();
  const uri = useFundingRateSubgraphAddress();

  if (!chainId || !uri) {
    return;
  }

  // Check if there's already a client for this chainId
  if (!apolloClients[chainId]) {
    // No client exists, create a new one
    apolloClients[chainId] = createApolloClient(uri);
  }

  // Return the existing or new client
  return apolloClients[chainId];
}
