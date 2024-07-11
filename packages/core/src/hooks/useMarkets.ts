import { useMemo } from "react";
import { SelectSearchOption } from "react-select-search";
let useSelect = ({}) => [
  {
    search: "",
    focus: false,
    option: null,
    value: null,
    fetching: false,
    highlighted: -1,
    options: [],
    displayValue: "",
  },
  {
    tabIndex: "0",
    readOnly: false,
    value: "",
    ref: {
      current: { value: null },
    },
  },
  {
    tabIndex: "-1",
  },
];
async function loadSelect() {
  let useSelectTemp;

  if (process.env.NODE_ENV === "production") {
    // Import the production version of the module
    const useSelectRaw = await import("react-select-search/dist/cjs/index.js");
    useSelectTemp = useSelectRaw.useSelect;
  } else {
    // Import the development version of the module
    const useSelectRaw = await import("react-select-search");
    useSelectTemp = useSelectRaw.useSelect;
  }

  return useSelectTemp;
}

// Usage
loadSelect().then((useSelectTemp) => {
  useSelect = useSelectTemp;
});

import Fuse from "fuse.js";
import find from "lodash/find.js";

import { useFavorites } from "../state/user/hooks";
import { Market } from "../types/market";
import { useErrorMessages, useMarkets } from "../state/hedger/hooks";

export function useMarket(id: number | undefined): Market | undefined {
  const markets = useMarkets();

  return useMemo(() => {
    if (!id) return undefined;
    return find(markets, { id });
  }, [id, markets]);
}

function fuzzySearch(
  options: SelectSearchOption[],
  query: string
): SelectSearchOption[] {
  const config = {
    keys: ["name", "symbol"],
    threshold: 0.2,
  };

  const fuse = new Fuse(options, config);

  if (!query) {
    return options;
  }

  return fuse.search(query);
}

export function useMarketsSearch() {
  const markets = useMarkets();

  const options: SelectSearchOption[] = useMemo(() => {
    return markets.map((market: Market) => ({ ...market, value: market.name }));
  }, [markets]);

  const [snapshot, searchProps, optionProps] = useSelect({
    options,
    value: "",
    search: true,
    filterOptions: [fuzzySearch],
    allowEmpty: true,
    closeOnSelect: false,
  });

  return useMemo(
    () => ({
      markets: snapshot.options as unknown as Market[],
      snapshot,
      searchProps,
      optionProps,
    }),
    [snapshot, searchProps, optionProps]
  );
}

export function useFavoriteMarkets(): Market[] {
  const markets = useMarkets();
  const favorites = useFavorites() || [];
  return useMemo(
    () =>
      markets.filter((market: Market) => favorites.indexOf(market.id) !== -1),
    [favorites, markets]
  );
}

export function useNeutralMarkets(): Market[] {
  const markets = useMarkets();
  const favorites = useFavorites();
  return useMemo(
    () =>
      markets.filter((market: Market) => favorites?.indexOf(market.id) === -1),
    [favorites, markets]
  );
}

export function useErrorMessage(code: number | null): string | undefined {
  const messages = useErrorMessages();
  return useMemo(() => {
    if (!code) return undefined;
    return messages[code];
  }, [code, messages]);
}
