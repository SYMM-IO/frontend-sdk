import { BN_ZERO, formatPrice, toBN } from "@symmio/frontend-sdk/utils/numbers";

export function getTargetPnl(
  targetPrice: string,
  openedPrice: string,
  quantityToClose: string,
  negativeFlag: boolean,
  leverage: string
) {
  const pnl =
    toBN(targetPrice)
      .minus(openedPrice)
      .times(quantityToClose)
      .times(leverage)
      .times(negativeFlag ? -1 : 1)
      .toString() || BN_ZERO.toString();
  const pnlPercent = toBN(pnl)
    .div(quantityToClose)
    .div(openedPrice)
    .times(100)
    .toFixed(2);

  return { pnl: pnl !== "NaN" ? formatPrice(pnl, 2) : pnl, pnlPercent };
}
