import React from "react";
import styled from "styled-components";
import { Z_INDEX } from "theme";

import { Card } from "components/Card";
import { Modal } from "components/Modal";
import { usePartyBWhitelistAddress } from "@symmio/frontend-sdk/state/chains";
import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";
import HedgerInfo from "./HedgerInfo";
import CreateHedger from "./CreateHedger";
import {
  useGetAddedHedgers,
  useGetDefaultHedgerStatus,
  useRemoveHedgerCallback,
  useSelectOrUnselectHedgerCallback,
  useToggleDefaultHedgerCallback,
} from "@symmio/frontend-sdk/state/user/hooks";
import { AddedHedger } from "@symmio/frontend-sdk/state/user/types";

const ModalWrapper = styled(Card)`
  padding: 0.6rem;
  border: none;
  overflow: scroll;
  background: ${({ theme }) => theme.bg3};

  & > * {
    &:last-child {
      overflow-y: scroll;
      overflow-x: hidden;
      width: 100%;
      min-height: 100%;
      max-height: 450px;
    }
  }
`;

const InlineModal = styled(Card)<{
  isOpen: boolean;
  height?: string;
}>`
  padding: 10px;
  width: 404px;
  overflow: scroll;
  max-height: ${({ height }) => height ?? "554px"};
  display: ${(props) => (props.isOpen ? "flex" : "none")};
  position: absolute;
  z-index: ${Z_INDEX.modal};
  transform: translate(-285px, 10px);
  background: ${({ theme }) => theme.bg3};
  border: 2px solid ${({ theme }) => theme.bg6};

  & > * {
    &:last-child {
      overflow-y: scroll;
      overflow-x: hidden;
      width: 100%;
    }
  }
`;

const Title = styled.div`
  height: 40px;
  font-size: 16px;
  font-weight: 400;
  margin-top: 8px;
  height: 40px;
  color: ${({ theme }) => theme.text0};
`;

export default function HedgersModal({
  isModal,
  isOpen,
  onDismiss,
}: {
  isModal?: boolean;
  isOpen: boolean;
  onDismiss: () => void;
}) {
  const { chainId } = useActiveWagmi();
  const defaultHedger = usePartyBWhitelistAddress();
  const addedHedgers = useGetAddedHedgers();
  const removeHedger = useRemoveHedgerCallback();
  const isDefaultHedgerSelected = useGetDefaultHedgerStatus();
  const toggleDefaultHedger = useToggleDefaultHedgerCallback();
  const selectOrUnselectHedger = useSelectOrUnselectHedgerCallback();

  function getInnerContent() {
    return (
      <>
        <Title>Hedgers</Title>
        <div style={{ overflow: "scroll" }}>
          {chainId && (
            <HedgerInfo
              data={{ address: defaultHedger[chainId], name: "Default" }}
              active={isDefaultHedgerSelected}
              onClick={toggleDefaultHedger}
            />
          )}
          {chainId &&
            addedHedgers[chainId]?.length > 0 &&
            addedHedgers[chainId].map((h: AddedHedger, i: number) => (
              <HedgerInfo
                data={{ address: h.address, name: h.name }}
                active={h.isSelected}
                onClick={() => selectOrUnselectHedger(h)}
                onRemoveClick={() => removeHedger(h.address)}
                key={i}
              />
            ))}
        </div>
        <CreateHedger />
      </>
    );
  }

  return isModal ? (
    <Modal
      isOpen={isOpen}
      onBackgroundClick={onDismiss}
      onEscapeKeydown={onDismiss}
    >
      <ModalWrapper>{getInnerContent()}</ModalWrapper>
    </Modal>
  ) : (
    <InlineModal isOpen={isOpen} height={true ? "580px" : undefined}>
      {getInnerContent()}
    </InlineModal>
  );
}
