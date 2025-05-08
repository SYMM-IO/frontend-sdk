import * as toolkitRaw from "@reduxjs/toolkit/dist/redux-toolkit.cjs.production.min.js";
const { createAction } = ((toolkitRaw as any).default ??
  toolkitRaw) as typeof toolkitRaw;
import { AddedHedger, AddedHedgersData, TermsStatus } from "./types";
import { Account, AccountUpnl, UserPartyAStatDetail } from "../../types/user";
import { ConnectionStatus } from "../../types/api";

export const updateMatchesDarkMode = createAction<{ matchesDarkMode: boolean }>(
  "user/updateMatchesDarkMode"
);
export const updateUserDarkMode = createAction<{ userDarkMode: boolean }>(
  "user/updateUserDarkMode"
);
export const updateUserExpertMode = createAction<{ userExpertMode: boolean }>(
  "user/updateUserExpertMode"
);
export const updateCustomHedgerMode = createAction<{
  customHedgerMode: boolean;
}>("user/updateCustomHedgerMode");

export const updateBypassPrecisionCheckMode = createAction<{
  bypassPrecisionCheckMode: boolean;
}>("user/updateBypassPrecisionCheckMode");

export const updateUserFavorites = createAction<number[]>(
  "user/updateUserFavorites"
);
export const updateUserLeverage = createAction<number>(
  "user/updateUserLeverage"
);
export const updateUserSlippageTolerance = createAction<{
  userSlippageTolerance: "auto";
}>("user/updateUserSlippageTolerance");
export const updateAccount = createAction<Account | null>("user/updateAccount");
export const updateAccountUpnl = createAction<AccountUpnl>(
  "user/updateAccountUpnl"
);

export const updateUpnlWebSocketStatus = createAction<{
  status: ConnectionStatus;
}>("user/updateUpnlWebSocketStatus");
export const updateAccountPartyAStat = createAction<{
  address: string;
  value: UserPartyAStatDetail;
}>("user/updateAccountPartyAStat");

export const updateAcceptTerms = createAction<TermsStatus>(
  "user/updateAcceptTerms"
);

export const setFEName = createAction<string>("user/setFEName");

export const setAllHedgerData = createAction<AddedHedgersData>(
  "user/setAllHedgerData"
);

export const addHedger = createAction<{
  name: string;
  address: string;
  chainId: number;
}>("user/addHedger");

export const removeHedger = createAction<{
  address: string;
  chainId: number;
}>("user/removeHedger");

export const selectOrUnselectHedger = createAction<{
  hedger: AddedHedger;
  chainId: number;
}>("user/selectOrUnselectHedger");

export const toggleDefaultHedger = createAction("user/toggleDefaultHedger");
