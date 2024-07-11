import { useState } from "react";
import styled from "styled-components";
import InfiniteScroll from "react-infinite-scroll-component";

import { useGetTokenWithFallbackChainId } from "@symmio/frontend-sdk/utils/token";
import { useCollateralToken } from "@symmio/frontend-sdk/constants/tokens";
import { BALANCE_HISTORY_ITEMS_NUMBER } from "@symmio/frontend-sdk/constants/misc";

import { BalanceHistoryData } from "@symmio/frontend-sdk/state/user/types";
import { ConnectionStatus } from "@symmio/frontend-sdk/types/api";
import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";
import {
  useActiveAccountAddress,
  useBalanceHistory,
  useGetBalanceHistoryCallback,
  useUpnlWebSocketStatus,
} from "@symmio/frontend-sdk/state/user/hooks";

import BalanceItem from "./BalanceItem";
import { DotFlashing } from "components/Icons";
import Column from "components/Column";
import { usePositionValue } from "@symmio/frontend-sdk/hooks/usePositionOverview";
import { usePositionsQuotes } from "@symmio/frontend-sdk/state/quotes/hooks";

const ScrollableDiv = styled(Column)<{ dataLength: number }>`
  width: 100%;
  height: ${({ dataLength }) =>
    360 + (dataLength > 4 ? (dataLength - 4) * 30 : 0)}px;

  ${({ theme, dataLength }) => theme.mediaWidth.upToLarge`
      height: ${650 + (dataLength > 3 ? (dataLength - 3) * 30 : 0)}px;
  `}
  ${({ theme }) => theme.mediaWidth.upToMedium`
      height: 360px;
  `}

  overflow: scroll;
`;

export default function BalanceData() {
  const { chainId } = useActiveWagmi();
  const activeAccountAddress = useActiveAccountAddress();
  const getBalanceHistory = useGetBalanceHistoryCallback();
  const [skip, setSkip] = useState<number>(BALANCE_HISTORY_ITEMS_NUMBER);
  const COLLATERAL_TOKEN = useCollateralToken();
  const collateralCurrency = useGetTokenWithFallbackChainId(
    COLLATERAL_TOKEN,
    chainId
  );
  const { balanceHistory: data, hasMoreHistory: hasMore } = useBalanceHistory();

  const upnlWebSocketStatus = useUpnlWebSocketStatus();
  const loading = upnlWebSocketStatus === ConnectionStatus.CLOSED;
  const currentItems = loading
    ? [...Array(4)]
    : Object.values(data ?? {})
        .filter(
          (i) => i.account.toLowerCase() === activeAccountAddress?.toLowerCase()
        )
        .sort(
          (a: BalanceHistoryData, b: BalanceHistoryData) =>
            Number(b.timestamp) - Number(a.timestamp)
        );

  const { quotes: positions } = usePositionsQuotes();
  const positionsInfo = usePositionValue(positions);
  const positionsLength = positionsInfo.length;

  const loadMore = () => {
    if (hasMore) {
      setSkip((prevSkip) => prevSkip + BALANCE_HISTORY_ITEMS_NUMBER);
      getBalanceHistory(chainId, activeAccountAddress, skip);
    }
  };

  // if (error) {
  //   // Handle error
  // }

  return (
    <ScrollableDiv dataLength={positionsLength} id="scrollableDiv">
      {/*Put the scroll bar always on the bottom*/}
      <InfiniteScroll
        dataLength={currentItems.length ?? 0}
        next={loadMore}
        hasMore={hasMore ?? false}
        scrollableTarget="scrollableDiv"
        loader={
          <h4>
            <DotFlashing />
          </h4>
        }
      >
        {currentItems.map((item, index) => (
          <BalanceItem
            key={index}
            data={item || {}}
            currency={collateralCurrency?.symbol}
            loading={loading}
          />
        ))}
      </InfiniteScroll>
    </ScrollableDiv>
  );
}
