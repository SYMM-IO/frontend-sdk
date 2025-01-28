import React from "react";
import styled, { useTheme } from "styled-components";

import { ModalHeader, Modal } from "components/Modal";

import { RowBetween, RowEnd } from "components/Row";
import CustomCheckbox from "components/CheckBox";
import {
  useCustomHedgerMode,
  useExpertMode,
  useSetCustomHedgerModeCallback,
  useSetExpertModeCallback,
} from "@symmio/frontend-sdk/state/user/hooks";

const MainModal = styled(Modal)`
  display: flex;
  max-width: 448px;
  width: 350px;
  justify-content: center;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.border1};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    max-height: unset;
  `};
`;

const Value = styled.div<{ color?: string; margin?: string }>`
  font-size: 16px;
  white-space: nowrap;
  margin: ${({ margin }) => margin};
  color: ${({ theme, color }) => color ?? theme.white};
`;

export default function SettingsModal({
  title,
  isOpen,
  toggleModal,
}: {
  title: string;
  isOpen: boolean;
  toggleModal: (action: boolean) => void;
}) {
  const { white } = useTheme();

  const setExpertMode = useSetExpertModeCallback();
  const isExpertMode = useExpertMode();
  const setCustomHedgerMode = useSetCustomHedgerModeCallback();
  const isCustomHedgerMode = useCustomHedgerMode();

  return (
    <>
      <MainModal
        isOpen={isOpen}
        onBackgroundClick={() => toggleModal(false)}
        onEscapeKeydown={() => toggleModal(false)}
      >
        <ModalHeader onClose={() => toggleModal(false)} title={title} />
        <div style={{ padding: "12px 18px" }}>
          <RowBetween marginBottom={"16px"}>
            <Value color={white}>Developer Mode</Value>
            <RowEnd width={"unset"} marginRight={"10px"}>
              <CustomCheckbox
                label={""}
                id={"Developer Mode"}
                name={"Developer Mode"}
                checked={isExpertMode}
                onChange={() => setExpertMode(!isExpertMode)}
              />
            </RowEnd>
          </RowBetween>

          <RowBetween marginBottom={"25px"}>
            <Value color={white}>Add Custom Hedgers</Value>
            <RowEnd width={"unset"} marginRight={"10px"}>
              <CustomCheckbox
                label={""}
                id={"custom hedger mode"}
                name={"custom hedger mode"}
                checked={isCustomHedgerMode}
                onChange={() => setCustomHedgerMode(!isCustomHedgerMode)}
              />
            </RowEnd>
          </RowBetween>
        </div>
      </MainModal>
    </>
  );
}
