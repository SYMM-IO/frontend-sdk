export interface Market {
  id: number;
  name: string;
  symbol: string;
  asset: string;
  pricePrecision: number;
  quantityPrecision: number;
  isValid: boolean;
  minAcceptableQuoteValue: number;
  minAcceptablePortionLF: number;
  tradingFee: number;
  maxLeverage: number;
  maxNotionalValue: number;
  rfqAllowed?: boolean;
  maxFundingRate: string;
  hedgerFeeOpen: string;
  hedgerFeeClose: string;
  autoSlippage: number;
}

export interface MarketResponseType {
  symbol_id: number;
  name: string;
  symbol: string;
  asset: string;
  price_precision: number;
  quantity_precision: number;
  is_valid: boolean;
  min_acceptable_quote_value: number;
  min_acceptable_portion_lf: number;
  trading_fee: number;
  max_leverage: number;
  max_notional_value: number;
  hedger_fee_close: string;
  hedger_fee_open: string;
  rfq_allowed: boolean | undefined;
  max_funding_rate: string;
}

export interface MarketApiType {
  symbols: MarketResponseType[];
  count: number;
}

export interface OpenInterestResponseType {
  total_cap: number;
  used: number;
}

export interface NotionalCapResponseType {
  total_cap: number;
  used: number;
}

export interface PriceRangeResponseType {
  max_price: number;
  min_price: number;
}
