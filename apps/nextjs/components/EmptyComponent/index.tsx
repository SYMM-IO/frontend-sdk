import { useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import find from "lodash/find.js";

import { Market } from "@symmio/frontend-sdk/types/market";
import { DEFAULT_HEDGER } from "constants/chains/hedgers";

import { useMarkets } from "@symmio/frontend-sdk/state/hedger/hooks";
import {
  useActiveMarket,
  useActiveMarketPrice,
  useSetMarketId,
} from "@symmio/frontend-sdk/state/trade/hooks";

export function UpdaterRoot() {
  const market = useActiveMarket();
  const price = useActiveMarketPrice();
  useEffect(() => {
    document.title = !market
      ? "Loading..."
      : price
      ? `${price} | ${market.name}`
      : `${market.name}`;
  }, [price, market]);

  const markets = useMarkets();
  const updateMarketId = useSetMarketId();
  const marketFromURL = useValidatedSymbolFromURL(markets);
  useRedirectIfInvalidSymbol(markets);
  useEffect(() => {
    if (marketFromURL) {
      updateMarketId(marketFromURL.id);
    }
  }, [updateMarketId, marketFromURL]);

  return null;
}

function useRedirectIfInvalidSymbol(markets: Market[]) {
  const router = useRouter();
  const market = useValidatedSymbolFromURL(markets);
  const id = router.query.id;

  useEffect(() => {
    if (markets.length > 0 && !market) {
      router.push(`/trade/${DEFAULT_HEDGER?.defaultMarketId}`);
    }
  }, [router, market, id, markets]);

  return null;
}

function useValidatedSymbolFromURL(markets: Market[]): Market | null {
  const router = useRouter();

  const parsedId: number | null = useMemo(() => {
    const id = router.query?.id || undefined;
    return typeof id === "string" ? Number(id) : null;
  }, [router]);

  return useMemo(() => {
    if (!parsedId) {
      return null;
    }
    const va = find(markets, { id: parsedId });

    return va ?? null;
  }, [parsedId, markets]);
}
