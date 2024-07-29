import React from "react";
import styled from "styled-components";

import WhitelistUpdater from "components/App/Whitelist/updater";

import Column from "components/Column";
import Chart from "components/App/Chart";
import UserPanel from "components/App/UserPanel";
import MarketBar from "components/App/MarketBar";
import TradePanel from "components/App/TradePanel";
import FavoriteBar from "components/App/FavoriteBar";
import AccountOverview from "components/App/AccountData";
import { UpdaterRoot } from "components/EmptyComponent";
import WrapperBanner from "components/Banner";

export const Container = styled(Column)`
  background: ${({ theme }) => theme.bg};

  /* banner + 52px for account bar + 48px for cooldown bar */
`;

export const ItemsRow = styled.div<{
  gap?: string;
  padding?: string;
  margin?: string;
}>`
  display: flex;
  gap: ${({ gap }) => gap ?? "8px"};
  margin: ${({ margin }) => margin ?? "4px 0px"};
  padding: ${({ padding }) => padding ?? "0px 8px"};
  background: ${({ theme }) => theme.bg};

  & > * {
    &:nth-child(2) {
      flex: 1;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column;
  }
  `};
`;

export const LeftColumn = styled(Column)<{ gap?: string }>`
  overflow-y: scroll;
  gap: ${({ gap }) => gap ?? "8px"};
  background: ${({ theme }) => theme.bg};
  flex: 2;
  & > * {
    width: 100%;
  }
  /* flex: 1 1; */
`;

export default function ID() {
  return (
    <Container>
      <WrapperBanner />
      <UpdaterRoot />
      <WhitelistUpdater />
      <ItemsRow>
        <LeftColumn>
          <FavoriteBar />
          <MarketBar />
          <Chart />
        </LeftColumn>
        <TradePanel />
      </ItemsRow>
      <ItemsRow>
        <LeftColumn>
          <UserPanel />
        </LeftColumn>
        <AccountOverview />
      </ItemsRow>
    </Container>
  );
}
