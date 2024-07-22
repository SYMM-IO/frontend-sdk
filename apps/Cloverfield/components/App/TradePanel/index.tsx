import React from "react";
import styled from "styled-components";

import { ApplicationModal } from "@symmio/frontend-sdk/state/application/reducer";
import { useModalOpen } from "@symmio/frontend-sdk/state/application/hooks";
import { WEB_SETTING } from "@symmio/frontend-sdk/config";

import Column from "components/Column";

import TradeOverview from "components/App/TradePanel/TradeOverview";
import PositionTypeTab from "components/App/TradePanel/PositionTypeTab";

import { OpenPositionModal } from "components/ReviewModal/OpenPosition";
import AmountsPanel from "./AmountsPanel";
import OrderTypeTab from "./OrderTypeTab";
import MinPositionInfo from "./MinPositionInfo";
import TradeActionButtons from "./TradeActionButton";
import { BlackList, Suspend } from "./AccessControlPanel";
import { TpSlChecker } from "../TPSL/TpSlChecker";

const Wrapper = styled.div<{ showTpSl?: boolean }>`
  position: relative;

  width: 100%;
  max-width: 480px;
  border-radius: 4px;
  height: ${({ showTpSl }) => (showTpSl ? "735px" : "635px")};
  overflow: scroll;
  background: ${({ theme }) => theme.bg0};
  & > * {
    &:first-child {
      border-radius: 0px;
      & > * {
        &:first-child {
          border-bottom-left-radius: 0;
        }
        &:last-child {
          border-bottom-right-radius: 0;
        }
      }
    }
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
  max-width: unset;
`};
`;

const Container = styled(Column)`
  padding: 12px;
  gap: 20px;
  border-radius: 4px;
  /* overflow-x: hidden; // for some reason this panel can overflow horizontally */
  & > * {
    &:first-child {
      margin-top: 8px;
    }
  }
`;

const TabWrapper = styled.div`
  & > * {
    &:first-child {
      border-radius: 0px;
      & > * {
        &:first-child {
          border-bottom-left-radius: 0;
        }
        &:last-child {
          border-bottom-right-radius: 0;
        }
      }
    }
  }
`;

export default function TradePanel() {
  const showTpSl = WEB_SETTING.showTpSl;
  const showTradeInfoModal = useModalOpen(ApplicationModal.OPEN_POSITION);

  // TODO: add this two variables in trade action buttons
  const isSuspended = false;
  const isBlacklisted = false;

  return (
    <Wrapper showTpSl={showTpSl}>
      <React.Fragment>
        {isBlacklisted && <BlackList />}
        {isSuspended && <Suspend />}
        <TabWrapper>
          <OrderTypeTab />
        </TabWrapper>
        <Container>
          <PositionTypeTab />
          <AmountsPanel />
          <MinPositionInfo />

          <TradeActionButtons />
          <TradeOverview />
        </Container>
        {showTradeInfoModal && <OpenPositionModal />}
      </React.Fragment>
      <TpSlChecker />
    </Wrapper>
  );
}
