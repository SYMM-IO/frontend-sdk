import React from "react";
import styled, { useTheme } from "styled-components";
import StyledModal from "styled-react-modal";
import { Z_INDEX } from "theme";
import { Text } from "rebass";

import { PositionType } from "@symmio/frontend-sdk/types/trade";

import { Close as CloseIcon, LongArrow, ShortArrow } from "components/Icons";
import { ChevronDown } from "components/Icons";
import { RowBetween } from "components/Row";

const BaseModal = StyledModal.styled`
  display: flex;
  flex-flow: column nowrap;
  background: ${({ theme }: { theme: any }) => theme.bg0};
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border-radius: 4px;
  z-index: ${Z_INDEX.modal};
  overflow: hidden;
`;

export const MobileModal = styled(BaseModal)`
  width: 100vw;
  height: 100vh;
  border-radius: 0px;
`;

export const Modal = styled(BaseModal)<{
  width?: string;
}>`
  background: ${({ theme }) => theme.bg1};
  width: ${({ width }: { width?: string }) => width ?? "404px"};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    max-height: 350px;
    width: 350px;
    overflow: scroll;
  `};
`;

export const ModalBackground = styled.div`
  display: flex;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: ${Z_INDEX.modalBackdrop};
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(3px);
`;

const HeaderWrapper = styled(RowBetween)`
  color: ${({ theme }) => theme.text0};
  padding: 12px 12px 0 12px;
  padding-bottom: 0;
  background-color: ${({ theme }) => theme.bg1};
  margin-bottom: 20px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 10px;
    padding-bottom: 0;
    font-size:12px;
  `};
`;

const Close = styled.div`
  width: 24px;
  height: 24px;
  padding: 3px 6px;
  cursor: pointer;
  border-radius: 4px;
  margin: 2px 2px 1px 0px;
  background: ${({ theme }) => theme.bg6};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 6px;
  `};
`;

const ChevronLeft = styled(ChevronDown)<{
  open: boolean;
}>`
  transform: rotate(90deg);
`;

export const ModalHeader = ({
  title,
  positionType,
  onClose,
  onBack,
  hideClose,
}: {
  title?: string;
  positionType?: PositionType;
  onClose: () => void;
  onBack?: () => void;
  hideClose?: boolean;
}) => {
  const theme = useTheme();
  return (
    <HeaderWrapper>
      {onBack && <ChevronLeft onClick={onBack} />}
      {title && (
        <Text fontWeight={500} fontSize={16}>
          {title}
          {!positionType ? null : positionType === PositionType.LONG ? (
            <LongArrow
              width={15}
              height={12}
              color={theme.green1}
              style={{ marginLeft: "10px" }}
            />
          ) : (
            <ShortArrow
              width={15}
              height={12}
              color={theme.red1}
              style={{ marginLeft: "10px" }}
            />
          )}
        </Text>
      )}
      {!hideClose && (
        <Close onClick={onClose}>
          <CloseIcon size={12} />
        </Close>
      )}
    </HeaderWrapper>
  );
};
