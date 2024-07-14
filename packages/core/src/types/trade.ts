export enum ErrorState {
  VALID,
  INSUFFICIENT_BALANCE,
  INVALID_PRICE,
  INVALID_QUANTITY,
  OUT_OF_RANGE_PRICE,
  CAP_REACHED,
  REMAINING_AMOUNT_UNDER_10,
  PARTIAL_CLOSE_WITH_SLIPPAGE,
  MAX_PENDING_POSITIONS_REACHED,
  LESS_THAN_MIN_ACCEPTABLE_QUOTE_VALUE,
  HIGHER_THAN_MAX_NOTIONAL_VALUE,
}

export enum CloseQuote {
  CANCEL_CLOSE_REQUEST,
  CANCEL_QUOTE,
  CLOSE_POSITION,
  FORCE_CANCEL,
  FORCE_CANCEL_CLOSE,
}

export const CloseQuoteMessages: { [closeQuoteType: number]: string } = {
  [CloseQuote.CANCEL_CLOSE_REQUEST]: "Cancel Close Position",
  [CloseQuote.CANCEL_QUOTE]: "Cancel Order",
  [CloseQuote.CLOSE_POSITION]: "Close Position",
  [CloseQuote.FORCE_CANCEL]: "Force Cancel Order",
  [CloseQuote.FORCE_CANCEL_CLOSE]: "Force Cancel Close Order",
};

export enum CloseGuides {
  ZERO,
  ONE,
  TWO,
  THREE,
}

export enum InputField {
  PRICE,
  QUANTITY,
}

export enum PositionType {
  LONG = "LONG",
  SHORT = "SHORT",
}

export enum OrderType {
  MARKET = "Market",
  LIMIT = "Limit",
}

export enum TradeState {
  OPEN = "OPEN",
  CLOSE = "CLOSE",
}
