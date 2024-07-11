import * as toolkitRaw from "@reduxjs/toolkit/dist/redux-toolkit.cjs.production.min.js";
const { createReducer } = ((toolkitRaw as any).default ??
  toolkitRaw) as typeof toolkitRaw;
import { InputField, PositionType, OrderType } from "../../types/trade";
import {
  setTradeState,
  updateOrderType,
  updateLimitPrice,
  updateMarketId,
  updateInputField,
  updateTypedValue,
  updatePositionType,
  updateLockedPercentages,
  updateIsActiveStopLoss,
  updateStopLossPrice,
} from "./actions";
import { TradeState } from "./types";

export const initialState: TradeState = {
  marketId: undefined,
  inputField: InputField.PRICE,
  orderType: OrderType.LIMIT,
  positionType: PositionType.LONG,
  limitPrice: "",
  typedValue: "",
  cva: undefined,
  partyAmm: undefined,
  partyBmm: undefined,
  lf: undefined,
  isActiveStopLoss: false,
  stopLossPrice: "",
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setTradeState, (state, action) => {
      return action.payload;
    })
    .addCase(updateMarketId, (state, { payload }) => {
      state.marketId = payload.id;
    })
    .addCase(updateOrderType, (state, action) => {
      state.orderType = action.payload;
    })
    .addCase(updateInputField, (state, action) => {
      state.inputField = action.payload;
    })
    .addCase(updateLimitPrice, (state, action) => {
      state.limitPrice = action.payload;
    })
    .addCase(updateTypedValue, (state, action) => {
      state.typedValue = action.payload;
    })
    .addCase(updatePositionType, (state, action) => {
      state.positionType = action.payload;
    })
    .addCase(updateIsActiveStopLoss, (state, action) => {
      state.isActiveStopLoss = action.payload;
    })
    .addCase(updateStopLossPrice, (state, action) => {
      state.stopLossPrice = action.payload;
    })

    .addCase(
      updateLockedPercentages,
      (state, { payload: { cva, partyAmm, partyBmm, lf } }) => {
        state.cva = cva;
        state.partyAmm = partyAmm;
        state.partyBmm = partyBmm;
        state.lf = lf;
      }
    )
);
