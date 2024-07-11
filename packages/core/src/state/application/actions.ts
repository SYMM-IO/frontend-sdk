import * as toolkitRaw from "@reduxjs/toolkit/dist/redux-toolkit.cjs.production.min.js";
const { createAction } = ((toolkitRaw as any).default ??
  toolkitRaw) as typeof toolkitRaw;
import { ApplicationModal, PopupContent } from "./reducer";

export const setChainConnectivityWarning = createAction<{
  chainConnectivityWarning: boolean;
}>("application/setChainConnectivityWarning");
export const setOpenModal = createAction<ApplicationModal | null>(
  "application/setOpenModal"
);
export const addPopup = createAction<{
  key?: string;
  removeAfterMs?: number | null;
  content: PopupContent;
}>("application/addPopup");
export const removePopup = createAction<{ key: string }>(
  "application/removePopup"
);

export const setInjectedAddress = createAction<{ address: string }>(
  "application/setInjectedAddress"
);
