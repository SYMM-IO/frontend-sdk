import styled from "styled-components";

import { Row, RowStart } from "components/Row";

export const Full = styled(Row)`
  height: 4px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
  background: ${({ theme }) => theme.bg7};
`;

export const Child = styled.div<{ color?: string; width?: string }>`
  height: 100%;
  background: ${({ color }) => (color ? color : "none")};
  width: ${({ width }) => (width ? `${width}%` : "none")};
`;

export const ColoredBox = styled.div<{ color?: string }>`
  width: 8px;
  height: 8px;
  margin-right: 8px;
  border-radius: 2px;
  background: ${({ color }) => (color ? color : "none")};
`;

export const Label = styled(RowStart)<{ color?: string }>`
  font-style: normal;
  font-weight: 400;
  font-size: 10px;
  width: unset;
  white-space: nowrap;

  & > * {
    &:first-child {
      color: ${({ theme }) => theme.text1};
    }
    &:nth-child(2) {
      margin-left: 4px;
      color: ${({ theme, color }) => color ?? theme.text1};
    }
  }
`;

export const Amount = styled.div<{ color?: string; active?: boolean }>`
  font-style: normal;
  font-weight: 400;
  font-size: 10px;
  color: ${({ theme, color }) => (color ? color : theme.text0)};
  ${({ active }) =>
    active &&
    `
    cursor: pointer;
    text-decoration: underline;
  `}

  span {
    text-decoration: underline;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    text-align: right;
  `};
`;
