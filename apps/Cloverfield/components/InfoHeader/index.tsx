import React from "react";
import styled from "styled-components";

import { Z_INDEX } from "theme";

import { Info } from "components/Icons";
import { Close as CloseIcon } from "components/Icons";
import { RowCenter } from "components/Row";

const Wrapper = styled(RowCenter)`
  position: relative;
  background: ${({ theme }) => theme.primary1};
  padding: 8px 0;
  gap: 24px;
  z-index: ${Z_INDEX.sticky};
`;

const Value = styled.div`
  font-weight: 600;
  font-size: 12px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 10px;
  `}
`;

const CloseIconWrapper = styled.button`
  position: absolute;
  right: 24px;
  cursor: pointer;
  top: 8px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    right: 4px;
    top:unset;
  `}
`;

const InfoIcon = styled(Info)`
  color: ${({ theme }) => theme.white};
  margin-right: -15px;
  cursor: default !important;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-left: 6px;
  `}
`;

export function InfoHeader({
  text,
  onClose,
  hasInfoIcon,
}: {
  text: string;
  onClose: (status: boolean) => void;
  hasInfoIcon?: boolean;
}) {
  return (
    <Wrapper>
      {hasInfoIcon && <InfoIcon size={20} />}
      <Value>{text}</Value>
      <CloseIconWrapper onClick={() => onClose(false)}>
        <CloseIcon size={12} />
      </CloseIconWrapper>
    </Wrapper>
  );
}
