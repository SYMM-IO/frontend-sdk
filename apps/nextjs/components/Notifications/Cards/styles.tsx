import styled from "styled-components";

import { RowStart } from "components/Row";

export const LiquidationText = styled(RowStart)`
  font-size: 12px;
  font-weight: 400;

  & > * {
    &:first-child {
      color: ${({ theme }) => theme.text0};
    }
    &:last-child {
      color: ${({ theme }) => theme.red1};
    }
  }
`;

export const PartiallyFillTitle = styled(RowStart)`
  font-size: 12px;
  font-weight: 400;
  white-space: nowrap;

  & > * {
    &:first-child {
      color: ${({ theme }) => theme.text0};
    }
    &:last-child {
      margin-left: 4px;
      color: ${({ theme }) => theme.text1};
    }
  }
`;

export const PartiallyFillText = styled(RowStart)`
  width: unset;
  font-size: 12px;
  font-weight: 400;

  & > * {
    &:first-child {
      color: ${({ theme }) => theme.primaryBlue};
    }
    &:last-child {
      color: ${({ theme }) => theme.text1};
    }
  }
`;
