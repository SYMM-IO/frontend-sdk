import { useMemo } from "react";
import styled, { useTheme } from "styled-components";

import { ErrorState } from "@symmio/frontend-sdk/types/trade";

import { PrimaryButton } from ".";
import { ExclamationMark } from "components/Icons";
import { ToolTipLeft } from "components/ToolTip";
import { MAX_PENDINGS_POSITIONS_NUMBER } from "@symmio/frontend-sdk/constants/misc";

const LiquidationButton = styled(PrimaryButton).attrs({
  height: "48px",
})`
  cursor: default;
  font-weight: 700;
  border-radius: 8px;
  color: ${({ theme }) => theme.red1};
  background: ${({ theme }) => theme.bgLoose};
  &:focus,
  &:hover {
    background: ${({ theme }) => theme.bgLoose};
  }
`;

const IconWrap = styled.div`
  position: absolute;
  right: 10px;
`;

export default function ErrorButton({
  customText,
  state,
  disabled,
  tooltip,
  exclamationMark,
  liquidationButton,
}: {
  customText?: string;
  state: ErrorState;
  disabled?: boolean;
  tooltip?: string;
  exclamationMark?: boolean;
  liquidationButton?: boolean;
}) {
  const theme = useTheme();
  const text = useMemo(() => {
    if (customText) return customText;
    if (state === ErrorState.INSUFFICIENT_BALANCE)
      return "Insufficient Balance";
    else if (state === ErrorState.LESS_THAN_MIN_ACCEPTABLE_QUOTE_VALUE)
      return "Amount is too low";
    else if (state === ErrorState.OUT_OF_RANGE_PRICE)
      return "Price is out of range";
    else if (state === ErrorState.REMAINING_AMOUNT_UNDER_10)
      return "Amount is too high";
    else if (state === ErrorState.PARTIAL_CLOSE_WITH_SLIPPAGE)
      return "Liquidation after close!";
    else if (state === ErrorState.INVALID_PRICE) return "Price is out of range";
    else if (state === ErrorState.INVALID_QUANTITY) return "Invalid quantity";
    else if (state === ErrorState.CAP_REACHED) return "Cap reached";
    else if (state === ErrorState.HIGHER_THAN_MAX_NOTIONAL_VALUE)
      return "Higher than max notional value";
    else if (state === ErrorState.MAX_PENDING_POSITIONS_REACHED)
      return `Max pending positions reached (${MAX_PENDINGS_POSITIONS_NUMBER})`;
    else return "unhandled";
  }, [customText, state]);

  return liquidationButton ? (
    <LiquidationButton>
      {text}
      <IconWrap>
        <a data-tip data-for={"PARTIAL_CLOSE_WITH_SLIPPAGE"}>
          <ExclamationMark bg={theme.bgLoose} color={theme.red1} />
          <ToolTipLeft id={"PARTIAL_CLOSE_WITH_SLIPPAGE"} aria-haspopup="true">
            You cannot close this amount via market order, as it may result in
            direct
            <div>
              account liquidation. Please choose a lower amount or use a Limit
              Order
            </div>
          </ToolTipLeft>
        </a>
      </IconWrap>
    </LiquidationButton>
  ) : (
    <PrimaryButton disabled={disabled}>
      {text}
      <IconWrap>
        {tooltip && (
          <a data-tip data-for={state}>
            <ExclamationMark />
            <ToolTipLeft id={`${state}`} aria-haspopup="true">
              {text}
            </ToolTipLeft>
          </a>
        )}
        {!tooltip && exclamationMark && <ExclamationMark />}
      </IconWrap>
    </PrimaryButton>
  );
}
