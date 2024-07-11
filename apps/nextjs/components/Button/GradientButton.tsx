import styled from "styled-components";

import { BaseButton } from "components/Button";
import { useCallback } from "react";

export const GradientButtonWrapper = styled(BaseButton)`
  padding: 1px;
  height: 40px;
  border-radius: 4px;
  background: ${({ theme }) => theme.gradLight};

  ${({ disabled }) =>
    disabled &&
    `
      cursor: default;
      opacity: 50%;

  `}
`;

export const GradientColorButton = styled(BaseButton)`
  height: 100%;
  border-radius: 4px;
  background: ${({ theme }) => theme.bg1};

  &:focus,
  &:hover,
  &:active {
    background: ${({ theme }) => theme.black2};
  }

  ${({ disabled }) =>
    disabled &&
    `
      cursor: default;

  `}
`;

export const GradientButtonLabel = styled.span`
  font-weight: 600;
  font-size: 12px;
  line-height: 14px;
  background: ${({ theme }) => theme.gradLight};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

export default function GradientButton({
  label,
  onClick,
  children,
  disabled,
}: {
  label: string;
  onClick?: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
}): JSX.Element {
  const handleClick = useCallback(() => {
    if (!disabled && onClick) onClick();
  }, [disabled, onClick]);

  return (
    <GradientButtonWrapper disabled={disabled}>
      <GradientColorButton onClick={handleClick} disabled={disabled}>
        <GradientButtonLabel>{label}</GradientButtonLabel>
        <div>{children}</div>
      </GradientColorButton>
    </GradientButtonWrapper>
  );
}
