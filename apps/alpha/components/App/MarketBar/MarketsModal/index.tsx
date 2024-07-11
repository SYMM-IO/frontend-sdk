import React from "react";
import styled from "styled-components";
import { Z_INDEX } from "theme";

import {
  useFavoriteMarkets,
  useMarketsSearch,
} from "@symmio/frontend-sdk/hooks/useMarkets";

import { Card } from "components/Card";
import { RowStart, Row } from "components/Row";
import { Close as CloseIcon } from "components/Icons";
import { Modal as ModalBody } from "components/Modal";
import Markets from "components/App/MarketBar/MarketsModal/Markets";
import { InputField } from "components/App/MarketBar/InputField";

const ModalWrapper = styled(Card)`
  padding: 0.6rem;
  border: none;

  & > * {
    &:last-child {
      overflow-y: scroll;
      overflow-x: hidden;
      width: 100%;
      min-height: 100%;
      max-height: 400px;
    }
  }
`;

const Wrapper = styled(Row)`
  height: 36px;
  border-radius: 4px;
  background: ${({ theme }) => theme.bg2};
`;

const InlineModal = styled(Card)<{ isOpen: boolean; height?: string }>`
  padding: 0px;
  width: clamp(200px, 400px, 99%);
  max-height: ${({ height }) => height ?? "554px"};
  position: absolute;
  z-index: ${Z_INDEX.modal};
  transform: translate(-1px, 29px);
  background: ${({ theme }) => theme.bg1};
  border: 2px solid ${({ theme }) => theme.bg6};
  display: ${(props) => (props.isOpen ? "flex" : "none")};

  & > * {
    &:last-child {
      overflow-y: scroll;
      overflow-x: hidden;
      width: 100%;
      min-height: 100%;
      height: 400px;
    }
  }
`;

const Modal = styled(ModalBody)`
  border: none;
`;

const UpperRow = styled(RowStart)`
  z-index: 0;
  gap: 12px;
  flex-flow: row nowrap;
  font-size: 0.8rem;
  margin-bottom: 0.6rem;
  padding: 12px 12px 0px 12px;

  & > * {
    &:first-child {
      flex: 1;
    }
  }
`;

const Close = styled.div`
  width: 32px;
  height: 32px;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  margin: 2px 2px 1px 0px;
  background: ${({ theme }) => theme.bg1};
`;

export function MarketsModal({
  isModal,
  isOpen,
  onDismiss,
}: {
  isModal?: boolean;
  isOpen: boolean;
  onDismiss: () => void;
}) {
  const { markets, searchProps } = useMarketsSearch();
  const favorites = useFavoriteMarkets();

  function getInnerContent() {
    return (
      <>
        <UpperRow>
          <Wrapper>
            <InputField searchProps={searchProps} placeholder="Search" />
            <Close onClick={onDismiss}>
              <CloseIcon size={16} onClick={onDismiss} />
            </Close>
          </Wrapper>
        </UpperRow>
        <div>
          <Markets
            markets={markets}
            favoriteMarkets={favorites}
            onDismiss={onDismiss}
          />
        </div>
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
    <InlineModal isOpen={isOpen}>{getInnerContent()}</InlineModal>
  );
}
