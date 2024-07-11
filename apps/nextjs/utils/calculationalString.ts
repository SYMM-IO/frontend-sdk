import { formatPrice } from "@symmio/frontend-sdk/utils/numbers";

const calculationSeparatePattern = RegExp(
  `([$%]?\\d+(?:\\.\\d+)?)(?:\\s*([-+])\\s*([$%]?\\d+(?:\\.\\d+)?))?`
);
export const calculationPattern = RegExp(`[%$+-]`);

function calculateSection(value: string, balance: string, basePrice: string) {
  let result: number;
  if (value[0] === "$") {
    result = parseFloat(value.slice(1));
    const tempBasePrice = parseFloat(basePrice);
    if (tempBasePrice > 0) {
      result = result / tempBasePrice;
    } else {
      result = 0;
    }
  } else if (value[0] === "%") {
    const maxBalance = parseFloat(balance);
    const fraction = parseFloat(value.slice(1)) / 100;
    result = maxBalance * fraction;
  } else {
    result = parseFloat(value);
  }
  return result;
}

function calculateOverall(
  firstPart: string,
  operator: string,
  secondPart: string,
  balance: string,
  pricePrecision: number | undefined,
  basePrice: string
): string {
  let tempPricePrecision = 0;
  if (pricePrecision) {
    tempPricePrecision = pricePrecision;
  }
  const firstPartResult = calculateSection(firstPart, balance, basePrice);
  if (operator) {
    let result: number;
    const secondPartResult = calculateSection(secondPart, balance, basePrice);
    if (operator === "+") {
      result = firstPartResult + secondPartResult;
    } else if (operator === "-" && firstPartResult > secondPartResult) {
      result = firstPartResult - secondPartResult;
    } else {
      result = 0;
    }
    return formatPrice(result, tempPricePrecision);
  } else {
    return formatPrice(firstPartResult, tempPricePrecision);
  }
}

export function calculateString(
  input: string,
  balance: string,
  pricePrecision: number | undefined,
  basePrice: string
): string {
  const matchString = input.match(calculationSeparatePattern);
  let result = "";
  if (matchString) {
    result = calculateOverall(
      matchString[1],
      matchString[2],
      matchString[3],
      balance,
      pricePrecision,
      basePrice
    );
  }
  return result;
}
