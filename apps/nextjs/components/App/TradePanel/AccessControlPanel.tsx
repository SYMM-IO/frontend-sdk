import React from "react";
import styled, { useTheme } from "styled-components";

import { useActiveMarket } from "@symmio/frontend-sdk/state/trade/hooks";

import { ColumnCenter } from "components/Column";
import { RowCenter } from "components/Row";
import { MainButton } from "components/Button";
import BigExclamationMark from "components/Icons/BigExclamationMark";

const ErrorWrapper = styled(ColumnCenter)<{
  blacklisted?: boolean;
  position?: string;
}>`
  justify-content: center;
  position: ${({ position }) => position ?? "absolute"};
  z-index: 1;
  height: 100%;
  width: 100%;
  padding: 12px;
  background: ${({ blacklisted, theme }) =>
    blacklisted
      ? "linear-gradient(180deg, rgba(71, 42, 42, 0.83) 0%, #21242C 100%)"
      : theme.gradError};
`;

const ErrorIconWrapper = styled(RowCenter)<{ blacklisted?: boolean }>`
  padding-bottom: ${({ blacklisted }) => (blacklisted ? "24px" : "16px")};
`;

const ErrorTitle = styled.h3<{ color: string }>`
  padding-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: ${({ color }) => color};
`;

const ErrorText = styled.p<{ color: string; blacklisted?: boolean }>`
  padding: 0 16px;
  color: ${({ color }) => color};
  text-align: center;
  font-size: 12px;
  line-height: ${({ blacklisted }) => (blacklisted ? "26px" : "22px")};
`;

const ContactButton = styled(MainButton)`
  position: absolute;
  bottom: 12px;
  width: calc(100% - 12px);
`;

export function Suspend() {
  const theme = useTheme();

  return (
    <ErrorWrapper>
      <ErrorIconWrapper>
        <BigExclamationMark />
      </ErrorIconWrapper>
      <ErrorTitle color={theme.error}>You are Suspended!</ErrorTitle>
      <ErrorText color={theme.error1}>
        You are not allowed to open a position or withdraw your allocations. in
        order to change that, contact us in Discord.
      </ErrorText>
      <ContactButton>Contact us on Discord</ContactButton>
    </ErrorWrapper>
  );
}

export function BlackList() {
  const theme = useTheme();
  const market = useActiveMarket();
  const marketName = market ? `${market.symbol} / ${market.asset}` : "Unknown";

  return (
    <ErrorWrapper blacklisted>
      <ErrorIconWrapper blacklisted>
        <BigExclamationMark bgColor={theme.bgWarning} color={theme.warning} />
      </ErrorIconWrapper>
      <ErrorTitle color={theme.warning}>
        {marketName} is Blacklisted by Hedger
      </ErrorTitle>
      <ErrorText color={theme.yellow2} blacklisted>
        Users can not open a new position on {marketName} market. but still you
        can close your current positions.
      </ErrorText>
    </ErrorWrapper>
  );
}
