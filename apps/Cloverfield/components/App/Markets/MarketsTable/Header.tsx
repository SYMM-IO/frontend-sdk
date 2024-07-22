import styled from "styled-components";

import { RowBetween } from "components/Row";

const TableStructure = styled(RowBetween)`
  font-size: 12px;
  font-weight: 500;
  text-align: left;

  & > * {
    width: 18%;

    &:nth-child(1) {
      width: 28px;
      margin-right: 12px;
    }
    &:nth-child(2) {
      width: 14%;
    }
    &:nth-child(3) {
      width: 12%;
    }

    ${({ theme }) => theme.mediaWidth.upToSmall`
      &:nth-child(1) {
        width: 14px;
        margin-right: 0;
      }
      &:nth-child(2) {
        width: 20%;
      }
      &:nth-child(4) {
        width: 16%;
      }
      &:nth-child(5) {
        display: none;
      }
      &:nth-child(6) {
        display: none;
      }
    `}
    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      &:nth-child(2) {
        width: 27%;
      }
      &:nth-child(4) {
        display: none;
      }
    `}
  }
`;

const HeaderWrap = styled(TableStructure)`
  color: ${({ theme }) => theme.text4};
  background-color: ${({ theme }) => theme.bg0};
  padding: 24px 24px 15px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.border3};

  & > * {
    &:last-child {
      width: 85px;
      text-align: right;
    }
  }
`;

export default function TableHeader({
  HEADERS,
}: {
  HEADERS: string[];
}): JSX.Element | null {
  return (
    <HeaderWrap>
      {HEADERS.map((item, key) => {
        return <div key={key}>{item}</div>;
      })}
    </HeaderWrap>
  );
}
