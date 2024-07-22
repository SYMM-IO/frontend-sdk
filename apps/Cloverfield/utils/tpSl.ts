import { toBN } from "@symmio/frontend-sdk/utils/numbers";

export function checkTpSlCriteria(
  targetValue: number,
  limitValue: number,
  targetPrice: string
) {
  if (targetValue < limitValue || targetValue < 0) {
    return { error: true, message: `TP must be greater than ${limitValue}%` };
  }
  if (toBN(targetPrice).isLessThan(0)) {
    return { error: true, message: `Price must be greater than 0` };
  }

  return { error: false, message: "" };
}
