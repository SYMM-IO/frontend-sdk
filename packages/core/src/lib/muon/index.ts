import { DeallocateClient } from "./client/deallocate";
import { QuotesClient } from "./client/quotes";

import { WEB_SETTING } from "../../config";

export const SendQuoteClient = QuotesClient.createInstance(
  WEB_SETTING.muonEnabled
);
export const DeallocateCollateralClient = DeallocateClient.createInstance(
  WEB_SETTING.muonEnabled
);
