import { useCallback } from "react";
import styled from "styled-components";

import { RowBetween, RowStart } from "components/Row";
import { ToolTip } from "components/ToolTip";
import { Info as InfoIcon } from "components/Icons";
import ShimmerAnimation from "components/ShimmerAnimation";

const StyledInfoIcon = styled(InfoIcon)`
  color: ${({ theme }) => theme.text2};
  width: 12px;
  height: 12px;
  margin: 4px 4px 0px 4px;
  cursor: default;
`;

export const DataRow = styled(RowBetween)`
  flex-flow: row nowrap;
  padding: 0px 3px;
`;

export const Label = styled(RowStart)<{ size?: string }>`
  font-size: ${({ size }) => size ?? "12px"};
  justify-self: start;
  font-weight: 400;
  width: 50%;
  color: ${({ theme }) => theme.text3};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 12px;
  `};
`;

export const Value = styled.div<{
  color?: string;
  cursor?: string;
  size?: string;
}>`
  font-size: ${({ size }) => size ?? "12px"};
  justify-self: end;
  color: ${({ theme, color }) => color ?? theme.text0};
  white-space: nowrap;
  cursor: ${({ cursor }) => cursor ?? "default"};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 10px;
  `};
`;

export default function InfoItem({
  label,
  amount,
  ticker,
  tooltip,
  valueColor,
  onClick,
  balanceExact,
  fontSize,
  loading,
}: {
  label: string;
  amount: string;
  ticker?: string;
  tooltip?: string;
  valueColor?: string;
  onClick?: (amount: string) => void;
  balanceExact?: string;
  fontSize?: string;
  loading?: boolean;
}): JSX.Element {
  const handleClick = useCallback(() => {
    if (!balanceExact || !onClick) return;
    onClick(balanceExact.toString());
  }, [balanceExact, onClick]);

  const cursor = onClick ? "pointer" : undefined;
  return (
    <DataRow>
      <Label size={fontSize}>
        {label}
        <a data-tip data-for={label}>
          {tooltip && <StyledInfoIcon />}
          <ToolTip id={label} aria-haspopup="true">
            {tooltip}
          </ToolTip>
        </a>
        {/* {tooltip && <>:</>} */}
      </Label>
      {loading ? (
        <ShimmerAnimation width="68px" height="17px" />
      ) : (
        <Value
          onClick={handleClick}
          color={valueColor}
          cursor={cursor}
          size={fontSize}
        >
          {amount} {ticker && ` ${ticker}`}
        </Value>
      )}
    </DataRow>
  );
}
