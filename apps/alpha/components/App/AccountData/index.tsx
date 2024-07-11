import React, { useEffect, useState } from "react";
import styled from "styled-components";

import {
  useQuoteDetail,
  useSetQuoteDetailCallback,
} from "@symmio/frontend-sdk/state/quotes/hooks";

import { useIsMobile } from "lib/hooks/useWindowSize";

import { Tab } from "components/Tab";
import AccountOverview from "components/App/AccountData/AccountOverview";
import PositionDetails from "components/App/AccountData/PositionDetails";

const Wrapper = styled.div`
  width: 100%;
  max-width: 480px;
  min-height: 379px;
  display: flex;
  flex-flow: column nowrap;
  border-radius: 2px;
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

export enum PanelType {
  POSITION_OVERVIEW = "Position Details",
  ACCOUNT_OVERVIEW = "Account Overview",
}

export default function Overviews() {
  const [panelType, setPanelType] = useState<PanelType>(
    PanelType.ACCOUNT_OVERVIEW
  );
  const quoteDetail = useQuoteDetail();
  const setQuoteDetail = useSetQuoteDetailCallback();
  const mobileVersion = useIsMobile();

  useEffect(() => {
    if (quoteDetail) setPanelType(PanelType.POSITION_OVERVIEW);
  }, [quoteDetail]);
  useEffect(() => {
    if (mobileVersion) setPanelType(PanelType.ACCOUNT_OVERVIEW);
  }, [mobileVersion]);
  return (
    <Wrapper>
      {!mobileVersion && (
        <Tab
          tabOptions={[PanelType.ACCOUNT_OVERVIEW, PanelType.POSITION_OVERVIEW]}
          activeOption={panelType}
          onChange={(option: string) => {
            setPanelType(option as PanelType);
            if (option === PanelType.ACCOUNT_OVERVIEW) setQuoteDetail(null);
          }}
        />
      )}
      {panelType === PanelType.ACCOUNT_OVERVIEW ? (
        <AccountOverview mobileVersion={mobileVersion} />
      ) : (
        <PositionDetails quote={quoteDetail} />
      )}
    </Wrapper>
  );
}
