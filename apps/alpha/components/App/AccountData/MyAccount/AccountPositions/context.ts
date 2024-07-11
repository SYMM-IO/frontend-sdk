import { IQuotesInfo } from "@symmio/frontend-sdk/types/quotesOverview";
import { createContext } from "react";

export const AccountPositionsContext = createContext<{
  marketQuotesInfo: IQuotesInfo;
  colors: string[];
}>({
  marketQuotesInfo: [],
  colors: [],
});
