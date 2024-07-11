import styled from "styled-components";

import Column, { ColumnCenter } from "components/Column";
import {
  RowBetween,
  RowCenter,
  RowEnd,
  RowStart,
  Row as RowComponent,
} from "components/Row";
import { PnlValue } from "components/App/UserPanel/Common";
import { NextIcon } from "components/Icons";

import { ChevronDown } from "components/Icons";

export const Wrapper = styled(Column)`
  width: 100%;
  overflow-y: auto;
  border-radius: 0px 0px 4px 4px;
  background: ${({ theme }) => theme.bg0};

  &::-webkit-scrollbar {
    width: 8px;
    display: block;
  }

  /* Track */
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.primaryDarkBg};
  }

  /* Handle */
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.primaryBlue};
  }

  /* Handle on hover */
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.primaryDisable};
  }
`;

export const TopWrap = styled(RowComponent)<{
  mobileVersion?: boolean;
  expand?: boolean;
}>`
  height: 50px;
  padding: 13px 12px 10px;
  cursor: ${({ mobileVersion }) => (mobileVersion ? "pointer" : "unset")};
  ${({ theme, expand }) => theme.mediaWidth.upToMedium`
    height: unset;
    background: ${expand ? theme.bg3 : theme.bg2};
  `};
`;

export const DataWrap = styled.div`
  display: flex;
  padding: 4px 12px;
  flex-flow: column nowrap;
  position: relative;
  background: ${({ theme }) => theme.bg2};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    background: ${theme.bg1};
  `};
`;

export const Chevron = styled(ChevronDown)<{ open: boolean }>`
  transform: rotateX(${({ open }) => (open ? "180deg" : "0deg")});
  margin-right: 4px;
  margin-bottom: 12px;
  margin-top: auto;
`;

export const EmptyRow = styled(ColumnCenter)`
  font-weight: 400;
  font-size: 12px;
  padding: 56px 0px;
  color: ${({ theme }) => theme.text2};
  background: ${({ theme }) => theme.bg0};
`;

export const FlexColumn = styled(Column)<{ flex: number; alignItems: string }>`
  align-self: stretch;
  justify-content: space-between;
  align-items: ${({ alignItems }) => alignItems};
  flex: ${({ flex }) => flex};
`;

export const ContentWrapper = styled(DataWrap)`
  margin-top: 1px;
  margin-bottom: 35px;
  background: ${({ theme }) => theme.bg0};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    background: ${theme.bg3};
    margin-bottom: unset;
  `};
`;

export const Row = styled(RowBetween)`
  flex-flow: row nowrap;
  margin: 8px 0px;
  gap: 8px;
`;

export const RowPnl = styled(RowStart)`
  flex-flow: row nowrap;
  margin: 8px 0px;
  gap: 8px;
`;

export const PositionInfoBox = styled(RowBetween)`
  height: 40px;
  font-weight: 500;
  font-size: 12px;
  border-radius: 6px;
`;

export const MarketName = styled(RowStart)<{ expired?: boolean }>`
  font-weight: 500;
  font-size: 16px;
  width: unset;
  color: ${({ theme, expired }) => (expired ? theme.warning : theme.text0)};
  & > * {
    &:last-child {
      color: ${({ theme }) => theme.text1};
    }
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 12px;
  `};
`;

export const Leverage = styled(RowCenter)`
  width: 28px;
  height: 20px;
  font-weight: 600;
  font-size: 10px;
  border-radius: 2px;
  margin-left: 10px;
  color: ${({ theme }) => theme.primaryBlue};
  background: ${({ theme }) => theme.bg4};
`;

export const QuoteData = styled(Row)`
  width: 63px;
  height: 20px;
  gap: 5px;
  font-weight: 500;
  font-size: 10px;
  padding: 0px 4px;
  border-radius: 2px;
  margin-left: 8px;
  color: ${({ theme }) => theme.text0};
  background: ${({ theme }) => theme.bg4};
`;

export const Label = styled.div`
  font-weight: 400;
  font-size: 14px;
  justify-self: start;
  color: ${({ theme }) => theme.text3};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 12px;
  `};
`;

export const Value = styled(RowEnd)`
  width: unset;
  gap: 4px;
  font-weight: 500;
  font-size: 14px;
  justify-self: end;

  & > * {
    &:nth-child(2) {
      font-weight: 400;
      color: ${({ theme }) => theme.text2};
    }
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 12px;
  `};
`;

export const PositionPnl = styled(PnlValue)`
  font-weight: 500;
  font-size: 14px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 12px;
  `};
`;

// const ArrowWrap = styled.div`
//   width: 36px;
//   height: 20px;
//   cursor: pointer;
//   border-radius: 2px;
//   padding: 0px 12px;
//   background: ${({ theme }) => theme.bg5};
// `

export const PreviousIcon = styled(NextIcon)`
  rotate: 180deg;
`;
