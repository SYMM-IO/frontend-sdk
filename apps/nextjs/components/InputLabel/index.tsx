import React from "react";
import styled from "styled-components";

import { formatPrice, toBN } from "@symmio/frontend-sdk/utils/numbers";

import { NumericalInput } from "components/Input";
import { RowBetween, RowEnd, RowStart } from "components/Row";
import { ToolTip } from "components/ToolTip";
import { Info as InfoIcon } from "components/Icons";

export const Wrapper = styled(RowBetween)`
  width: 100%;
  font-size: 12px;
  height: 44px;
  font-weight: 400;
  white-space: nowrap;
  background: ${({ theme }) => theme.bg3};
  position: relative;
  border-radius: 4px;
  padding: 2px;
  padding-left: 12px;
`;

const DisplayLabelWrapper = styled(Wrapper)`
  padding: 2px;
`;

const NumericalWrapper = styled(RowBetween)`
  width: 100%;
  font-size: 16px;
  font-weight: 600;
  height: 100%;
  position: relative;
  margin-left: 12px;
  color: ${({ theme }) => theme.text0};
  background: ${({ theme }) => theme.bg2};
  border-radius: 4px;
  padding: 0 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 12px;
    right: 0;
  `}
`;

export const CurrencySymbol = styled.div<{ active?: any }>`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.text0};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    // font-size: 12px;
  `}
`;

const StyledInfoIcon = styled(InfoIcon)`
  color: ${({ theme }) => theme.text2};
  width: 12px;
  height: 12px;
  margin-bottom: -2px;
  cursor: default;
`;

const LabelWrap = styled(RowStart)`
  padding-left: 10px;
  font-weight: 400;
  font-size: 12px;
  width: 98px;
  gap: 4px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    white-space: normal;
  `}
`;

const DataWrap = styled(RowEnd)`
  gap: 4px;
  height: 100%;
  font-size: 16px;
  max-width: 282px;
  font-weight: 500;
  white-space: normal;
  padding-right: 10px;
  border-radius: 4px;
  color: ${({ theme }) => theme.text0};
  background: ${({ theme }) => theme.bg2};
  & > * {
    &:first-child {
      color: ${({ theme }) => theme.text5};
    }
  }
`;

export function InputLabel({
  value,
  label,
  placeholder,
  tooltip,
  symbol,
  onChange,
  disabled,
  autoFocus,
  precision,
}: {
  label: string | undefined;
  value: string;
  placeholder?: string;
  symbol?: string;
  tooltip?: string;
  onChange(values: string): void;
  disabled?: boolean;
  autoFocus?: boolean;
  precision?: number;
}) {
  return (
    <Wrapper>
      <LabelWrap>
        <div>{label}</div>
        <a data-tip data-for={label}>
          {tooltip && <StyledInfoIcon />}
          <ToolTip id={label} aria-haspopup="true">
            {tooltip}
          </ToolTip>
        </a>
      </LabelWrap>
      <NumericalWrapper>
        <NumericalInput
          value={value && value !== "NaN" ? value : ""}
          onUserInput={onChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={disabled}
          precision={precision}
        />
        <CurrencySymbol>{symbol}</CurrencySymbol>
      </NumericalWrapper>
    </Wrapper>
  );
}

export function DisplayLabel({
  value,
  label,
  tooltip,
  leverage,
  symbol,
  precision,
}: {
  value: number | string;
  label: string | undefined;
  leverage?: number;
  symbol?: string;
  tooltip?: string;
  precision?: number;
}) {
  const amount = isNaN(Number(value)) ? 0 : value;
  return (
    <DisplayLabelWrapper>
      <LabelWrap>
        <div>{label}</div>
        <a data-tip data-for={label}>
          {tooltip && <StyledInfoIcon />}
          <ToolTip id={label} aria-haspopup="true">
            {tooltip}
          </ToolTip>
        </a>
      </LabelWrap>

      <DataWrap>
        <div>{leverage && `${amount} x ${leverage} = `}</div>
        <div>
          {leverage
            ? formatPrice(toBN(amount).times(leverage), precision)
            : value}
        </div>

        <CurrencySymbol>{symbol}</CurrencySymbol>
      </DataWrap>
    </DisplayLabelWrapper>
  );
}
