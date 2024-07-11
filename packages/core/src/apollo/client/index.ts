import { ApolloClient, InMemoryCache } from "@apollo/client/core/index.js";
import { HttpLink } from "@apollo/client/link/http/HttpLink.js";

export function createApolloClient(uri: string) {
  return new ApolloClient({
    link: new HttpLink({
      uri,
    }),
    ssrMode: typeof window === "undefined",
    connectToDevTools:
      typeof window !== "undefined" && process.env.NODE_ENV === "development",
    cache: new InMemoryCache(),
  });
}
