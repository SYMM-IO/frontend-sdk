import React from "react";
import styled from "styled-components";

import Box from "components/Box";

export const InputWrapper = styled(Box)`
  padding: 0 20px;
  border-radius: 4px;
`;

export const InputField = styled.input<{
  [x: string]: any;
  calculationMode: boolean;
  calculationLoading: boolean;
}>`
  width: 100%;
  height: 32px;
  flex: 1;
  border: none;

  background: ${({ theme, calculationMode }) =>
    calculationMode ? theme.blue2 : "transparent"};
  -webkit-background-clip: text;
  -webkit-text-fill-color: ${({ calculationMode }) =>
    calculationMode ? "transparent" : "unset"};
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.text0};
  text-align: left;

  @keyframes blink {
    25% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
    100% {
      opacity: 1;
    }
  }
  animation: ${({ calculationMode, calculationLoading }) =>
    calculationMode && calculationLoading
      ? "blink 1s linear infinite"
      : "none"};

  &:active {
    color: ${({ theme }) => theme.text0};
  }

  &:focus,
  &:hover {
    outline: none;
  }
`;

function escapeRegExp(string: string, calculational: boolean): string {
  const regexResult = calculational
    ? /[*?^{}()|[\]\\]/g
    : /[.*+?^${}()|[\]\\]/g;
  return string.replace(regexResult, "\\$&"); // $& means the whole matched string
}

export function makeRegex(precision: number, calculational: boolean): RegExp {
  let string = calculational ? "([$%]?([0-9]+" : "([0-9]*";

  if (precision > 0) {
    let precisionString = "(\\.?";
    for (let index = 0; index < precision; index++) {
      precisionString += "[0-9]?";
    }
    precisionString += ")?";
    if (calculational) {
      string +=
        precisionString +
        "(?:\\s*([-+])\\s*([$%]?([0-9]+" +
        precisionString +
        ")?)?)?)?)?";
    } else {
      string += precisionString + ")";
    }

    return new RegExp(string, "g");
  } else {
    if (calculational) {
      string += "(?:\\s*([-+])\\s*([$%]?([0-9]+)?)?)?)?)?";
    } else {
      string += ")";
    }
    return RegExp(string, "g");
  }
}

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`); // match escaped "." characters via in a non-capturing group
const calculationalInputRegex = RegExp(
  "^([$%]?\\d*(\\.?\\d*)?)(?:\\s*([-+])\\s*([$%]?\\d*(\\.?\\d*)?)?)?$"
);
export const NumericalInput = ({
  value,
  onUserInput,
  placeholder = "0.0",
  precision,
  calculational = false,
  calculationMode = false,
  calculationLoading = false,
  onEnterPress,
  ...rest
}: {
  value: string | number;
  onUserInput: (input: string) => void;
  precision?: number;
  placeholder?: string;
  calculational?: boolean;
  calculationMode?: boolean;
  calculationLoading?: boolean;
  onEnterPress?: () => void;
} & Omit<React.HTMLProps<HTMLInputElement>, "ref" | "onChange" | "as">) => {
  function onKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event?.key === "Enter" && calculationMode && onEnterPress) {
      onEnterPress();
    }
  }

  const enforcer = (nextUserInput: string) => {
    const targetRegex = calculational ? calculationalInputRegex : inputRegex;
    if (
      nextUserInput !== "" &&
      targetRegex.test(escapeRegExp(nextUserInput, calculational))
    ) {
      const regex =
        precision !== undefined ? makeRegex(precision, calculational) : "";
      if (regex) {
        const result = nextUserInput.match(regex);
        if (result) onUserInput(result[0]);
      } else onUserInput(nextUserInput);
    } else if (nextUserInput === "") {
      onUserInput(nextUserInput);
    }
  };

  const patternResult = calculational
    ? "^([$%]?\\d*\\.?\\d+)(?:\\s*([-+])\\s*([$%]?\\d*\\.?\\d+)?)?$"
    : "^[0-9]*[.,]?[0-9]*$";
  return (
    <InputField
      {...rest}
      value={value}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        // replace commas with periods
        enforcer(event.target.value.replace(/,/g, "."));
      }}
      // universal input options
      inputMode="decimal"
      title="Amount"
      autoComplete="off"
      autoCorrect="off"
      // text-specific options
      type="text"
      pattern={patternResult}
      placeholder={placeholder || "0.00"}
      min={0}
      minLength={1}
      maxLength={79}
      calculationMode={calculationMode}
      calculationLoading={calculationLoading}
      spellCheck="false"
      onKeyPress={onKeyPress}
    />
  );
};
