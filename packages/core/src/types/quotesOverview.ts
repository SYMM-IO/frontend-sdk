export interface ISingleQuoteInfo {
  marketId: number;
  marketName: string;
  value: number;
  positionQuantity: number;
  positionType: string;
}

export type IQuotesInfo = ISingleQuoteInfo[];
