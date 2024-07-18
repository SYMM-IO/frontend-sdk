import { OrderType, PositionType, InputField } from "../../types/trade";

export interface TradeState {
  marketId: number | undefined;
  inputField: InputField;
  orderType: OrderType;
  positionType: PositionType;
  limitPrice: string;
  typedValue: string;
  cva: string | undefined;
  partyAmm: string | undefined;
  partyBmm: string | undefined;
  lf: string | undefined;
}

export interface GetLockedParamUrlResponse {
  cva: string;
  partyAmm: string;
  partyBmm: string;
  lf: string;
}
