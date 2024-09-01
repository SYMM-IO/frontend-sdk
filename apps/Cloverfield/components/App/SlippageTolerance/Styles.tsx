import styled from "styled-components";

import { OptionButton } from "components/Button";

export const DefaultOptionButton = styled(OptionButton)`
  display: inline-flex;
  width: 57px;
  height: 27px;
  padding: 5px 14px;
  margin: 1px;
  white-space: nowrap;
  margin-right: 10px;
  border-radius: 4px;

  /* active */
  background: ${({ theme, active }) => (active ? theme.bg0 : theme.bg2)};
  border: 1px solid
    ${({ theme, active }) => (active ? theme.primary2 : theme.text3)};
  ${({ theme }) => theme.mediaWidth.upToSmall`
      margin-right: 5px;
      white-space: normal;
  `}
`;

export const CustomOption = styled(DefaultOptionButton)`
  justify-content: flex-end;
  width: 85px;
  margin-right: 0px;
  border-radius: 4px;
`;

export const AmountsWrapper = styled.div<{ hasCustom?: boolean }>`
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  margin-top: 10px;
`;

export const AmountsInnerWrapper = styled.div<{ hasCustom?: boolean }>`
  ${({ hasCustom, theme }) =>
    !hasCustom &&
    theme.mediaWidth.upToSmall`
      width: 100%;
      display: flex;
      flex-wrap: nowrap;
      justify-content: space-between;
  `}
`;

export const QuestionMarkWrap = styled.div`
  margin-left: 6px;
  display: inline;
  background: transparent;
`;

export const Title = styled.div`
  /* margin-left: 8px; */
  font-size: 0.9rem;
  font-weight: 400;
  color: ${({ theme }) => theme.text3};
  display: flex;
  direction: row;
  justify-content: space-between;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 12px;
  `}
`;
