import BigNumber from "bignumber.js";

BigNumber.config({ EXPONENTIAL_AT: 30 });

export function toBN(number: BigNumber.Value): BigNumber {
  return new BigNumber(number);
}

export const BN_ZERO: BigNumber = toBN("0");
export const BN_TEN: BigNumber = toBN("10");

export enum RoundMode {
  ROUND_UP,
  ROUND_DOWN,
}

export function removeTrailingZeros(number: BigNumber.Value): string {
  return toBN(number).toString();
}

export function formatPrice(
  number: BigNumber.Value,
  pricePrecision = 2,
  separator = false,
  roundMode = RoundMode.ROUND_DOWN
): string {
  const toFixed = toBN(number).toFixed(pricePrecision, roundMode);
  return separator ? toBN(toFixed).toFormat() : removeTrailingZeros(toFixed);
}

export const formatAmount = (
  amount: BigNumber.Value | undefined | null,
  fixed = 6,
  separator = false
): string => {
  if (amount === null || amount === undefined) return "";

  const bnAmount = toBN(amount);
  if (BN_TEN.pow(fixed - 1).lte(bnAmount)) {
    return separator
      ? toBN(amount).toFormat(0, BigNumber.ROUND_DOWN)
      : bnAmount.toFixed(0, BigNumber.ROUND_DOWN);
  }

  const rounded = bnAmount.sd(fixed, BigNumber.ROUND_DOWN);
  return separator ? toBN(rounded.toFixed()).toFormat() : rounded.toFixed();
};

export const formatCurrency = (
  amount: BigNumber.Value | undefined | null,
  fixed = 6,
  separator = false
) => {
  if (amount === undefined || amount === null || amount === "") return "-";
  const bnAmount = toBN(amount);
  if (bnAmount.isZero()) {
    return "0";
  }
  if (bnAmount.lt(0.001)) {
    return "< 0.001";
  }
  if (bnAmount.gte(1e6)) {
    return formatAmount(bnAmount.div(1e6), fixed, separator) + "m";
  }
  if (bnAmount.gte(1e3)) {
    return formatAmount(bnAmount.div(1e3), fixed, separator) + "k";
  }
  return formatAmount(bnAmount, fixed, separator);
};

export const formatDollarAmount = (
  amount: BigNumber.Value | undefined | null
) => {
  const formattedAmount = formatCurrency(amount, 4, true);
  if (formattedAmount === "< 0.001") {
    return "< $0.001";
  }
  return formattedAmount !== "-" ? `$${formattedAmount}` : "-";
};

export function toWei(
  amount: BigNumber.Value | null | bigint,
  decimals = 18
): bigint {
  return BigInt(toWeiBN(amount?.toString() || "0", decimals).toFixed(0));
}

export function toWeiBN(
  amount: BigNumber.Value | null,
  decimals = 18
): BigNumber {
  if (amount === undefined || amount === null || amount === "") return BN_ZERO;
  if (typeof amount === "string" && isNaN(Number(amount))) {
    return BN_ZERO;
  }
  return toBN(amount).times(BN_TEN.pow(decimals));
}

export function fromWei(
  amount: BigNumber.Value | null | undefined,
  decimals = 18,
  defaultOutput?: string
): string {
  if (amount === undefined || amount === null || amount === "") return "0";
  if (typeof amount === "string" && isNaN(Number(amount))) {
    return defaultOutput ?? "0";
  }

  return toBN(amount).div(BN_TEN.pow(decimals)).toString();
}
