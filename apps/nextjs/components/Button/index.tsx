import styled from "styled-components";
import { RowCenter } from "components/Row";
import { lighten } from "polished";

export const BaseButton = styled(RowCenter)<{
  active?: boolean;
  disabled?: boolean;
}>`
  padding: 1rem;
  height: 100%;
  font-weight: 600;
  border-radius: 4px;
  outline: none;
  text-decoration: none;
  cursor: pointer;
  position: relative;
  z-index: 1;
  &:disabled {
    opacity: 50%;
    cursor: auto;
    pointer-events: none;
  }
  will-change: transform;
  transition: transform 450ms ease;
  transform: perspective(1px) translateZ(0);
  > * {
    user-select: none;
  }
  > a {
    text-decoration: none;
  }
`;

export const NavButton = styled(BaseButton)<{ width?: number | string }>`
  height: 40px;
  width: ${({ width }) => (width ? width : "40px")};
  font-size: 14px;
  padding: 0 10px;
  background: ${({ theme }) => theme.bg4};
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;

  ${({ theme, width }) => theme.mediaWidth.upToMedium`
    height: 32px;
    width: ${width ? width : "32px"};
    
  `};
`;

export const PrimaryButton = styled(BaseButton)<{ height?: string | number }>`
  z-index: 0;
  width: 100%;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  height: ${({ height }) => (height ? height : "45px")};
  background: ${({ theme }) => theme.gradLight};
  color: ${({ theme }) => theme.bg};

  &:focus,
  &:hover {
    background: ${({ theme }) => theme.hoverGrad};
  }
  ${({ disabled }) =>
    disabled &&
    `

      cursor: default;
      opacity:0.5;

  `}
`;

export const MainButton = styled(PrimaryButton)`
  height: 48px;
  border-radius: 8px;
`;

export const SecondaryButton = styled(PrimaryButton)`
  background: ${({ theme }) => theme.bg1};
  border: 1px solid ${({ theme }) => theme.bg7};
  border-radius: 8px;
  font-weight: 500;
  font-size: 12px;

  &:focus {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.bg1};
  }
  &:hover {
    background: ${({ theme }) => lighten(0.1, theme.bg1)};
  }
`;

export const ButtonEmpty = styled(BaseButton)`
  background-color: transparent;
  color: ${({ theme }) => theme.red1};
  display: flex;
  justify-content: center;
  align-items: center;

  &:focus {
    text-decoration: underline;
  }
  &:hover {
    text-decoration: none;
  }
  &:active {
    text-decoration: none;
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`;

export const TableButton = styled(PrimaryButton)<{ width?: string | number }>`
  width: ${({ width }) => (width ? width : "132px")};
  height: 40px;
  padding: 0;
  border-radius: 8px;
  white-space: nowrap;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    & > * {
      margin: -4px;
    }
  `}
`;

export const WhiteButton = styled(TableButton)`
  background: ${({ theme }) => theme.bg1};
  border: 2px solid ${({ theme }) => theme.text0};
  color: ${({ theme }) => theme.text0};

  &:focus,
  &:hover {
    background: ${({ theme }) => theme.bg3};
  }
`;
export const BlueButton = styled(TableButton)`
  background: ${({ theme }) => theme.bg0};
  border: 2px solid ${({ theme }) => theme.primary0};
  color: ${({ theme }) => theme.primary0};

  &:focus,
  &:hover {
    background: ${({ theme }) => theme.bg2};
  }

  ${({ theme, disabled }) =>
    disabled &&
    `
    opacity:0.5;
    &:focus,
    &:hover {
      background: ${theme.bg0};
    }
  `}
`;

export const MaxButton = styled.div`
  font-size: 12px;
  background: ${({ theme }) => theme.primaryBlue};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 500;
  padding-left: 6px;
  &:hover {
    cursor: pointer;
    filter: brightness(0.9);
  }
`;

export const OptionButton = styled(BaseButton)<{ active?: boolean }>`
  height: 36px;
  width: 62px;
  font-size: 13px;
  padding: 0;
  border-radius: 6px;
  color: ${({ theme }) => theme.text1};
  border: 1.5px solid
    ${({ theme, active }) => (active ? theme.border2 : theme.border1)};
  background: ${({ theme, active }) => (active ? theme.bg3 : "transparent")};
  position: relative;
  z-index: 1;
  transition: all 0.1s;
  cursor: ${({ active }) => active && "pointer"};

  ${({ theme }) => theme.mediaWidth.upToMedium`
      margin-right: 3px;
  `}

  &:hover {
    border: 1.5px solid
      ${({ theme, active }) => (active ? theme.border3 : theme.text1)};
  }
`;

export const EnterButton = styled(BaseButton)<{
  active?: boolean;
  calculationLoading?: boolean;
}>`
  width: 100px;
  height: 26px;
  padding: 8px 16px;
  border-radius: 5px;
  margin-bottom: 6px;
  background: transparent;
  background-color: ${({ theme }) => theme.primaryDarkBg};
  opacity: ${({ calculationLoading }) => (calculationLoading ? 0.4 : 1)};
  &:focus {
    text-decoration: underline;
  }
  &:hover {
    text-decoration: none;
  }
  &:active {
    text-decoration: none;
  }
`;

export const PositionActionButton = styled(SecondaryButton)<{
  expired?: boolean;
  liquidatePending?: boolean;
}>`
  width: 100px;
  height: 30px;
  padding: 7px 0;
  margin-left: auto;

  color: ${({ theme }) => theme.text0};
  background: ${({ theme }) => theme.bg3};

  &:hover {
    background: ${({ theme }) => lighten(0.05, theme.bg3)};
  }

  ${({ expired, theme }) =>
    expired &&
    `
    color: ${theme.warning};
    background: ${theme.bgWarning};
    border-color: ${theme.warning};

    &:hover {
    background: ${lighten(0.05, theme.bgWarning)};
  }`}

  ${({ liquidatePending, theme }) =>
    liquidatePending &&
    `
    color: ${theme.red1};
    background: ${theme.red5};
    border-color: ${theme.red1};

    &:hover {
    background: ${lighten(0.05, theme.red5)};
  }`}

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 5px;
  `};
`;
