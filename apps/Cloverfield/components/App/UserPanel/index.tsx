import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import { Quote } from "@symmio/frontend-sdk/types/quote";

import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";
import { useActiveAccountAddress } from "@symmio/frontend-sdk/state/user/hooks";
import {
  useGetOpenInstantOrdersCallback,
  useGetOrderHistoryCallback,
  useHistoryQuotes,
  useInstantOpensData,
  usePendingsQuotes,
  usePositionsQuotes,
  useQuoteDetail,
  useSetQuoteDetailCallback,
} from "@symmio/frontend-sdk/state/quotes/hooks";
import { sortQuotesByModifyTimestamp } from "@symmio/frontend-sdk/hooks/useQuotes";
import { InstantOpenItem } from "@symmio/frontend-sdk/state/quotes/types";

import { Card } from "components/Card";
import History from "./History";
import Position from "./Position";
import OrdersTab, { StateTabs } from "./OrdersTab";
import { ItemsPerPage } from "./PaginateTable";
import ArrowRightTriangle from "components/Icons/ArrowRightTriangle";
import { RowCenter } from "components/Row";
import { IconWrapper } from "components/Icons";
import InstantOpenOrders from "./InstantOpenOrders";

const Wrapper = styled(Card)`
  padding: 0;
  height: 100%;
  position: relative;
`;

const PaginationItems = styled(RowCenter)`
  position: absolute;
  bottom: 0px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
`;

const ArrowWrapper = styled.button<{ left?: boolean; active?: boolean }>`
  transform: rotate(${({ left }) => (left ? "180deg" : "0")});
  opacity: ${({ active }) => (active ? "1" : "0.5")};
  &:hover {
    cursor: ${({ active }) => (active ? "pointer" : "default")};
  }
`;

export default function UserPanel(): JSX.Element | null {
  const account = useActiveAccountAddress();
  const { chainId } = useActiveWagmi();

  const [selectedTab, setSelectedTab] = useState(StateTabs.POSITIONS);
  const [page, setPage] = useState(1);
  const quoteDetail = useQuoteDetail();
  const setQuoteDetail = useSetQuoteDetailCallback();
  const { quotes: closed, hasMoreHistory } = useHistoryQuotes();
  const { quotes: positions } = usePositionsQuotes();
  const { quotes: pendings } = usePendingsQuotes();
  const instantOpenData = useInstantOpensData();
  const getHistory = useGetOrderHistoryCallback();
  const getOpenInstantOrders = useGetOpenInstantOrdersCallback();

  useEffect(() => {
    getOpenInstantOrders();
  }, [getOpenInstantOrders, positions.length]);

  function getHistoryQuotes() {
    const skip = page * ItemsPerPage;
    const first = ItemsPerPage + 1;
    if (skip + first < closed.length) return;
    if (account && chainId && hasMoreHistory)
      getHistory(account, chainId, first, skip, ItemsPerPage);
  }

  const positionQuotes: Quote[] = useMemo(() => {
    return [...pendings, ...positions].sort(sortQuotesByModifyTimestamp);
  }, [pendings, positions]);

  const instantOpenQuotes: InstantOpenItem[] = useMemo(() => {
    return Object.values(instantOpenData).sort(sortQuotesByModifyTimestamp);
  }, [instantOpenData]);

  const currentOrders = useMemo(() => {
    switch (selectedTab) {
      case StateTabs.POSITIONS:
        return positionQuotes;
      case StateTabs.INSTANT_OPEN_ORDERS:
        return instantOpenQuotes;
      default:
        return closed;
    }
  }, [selectedTab, positionQuotes, instantOpenQuotes, closed]);

  const paginatedItems = useMemo(() => {
    return currentOrders.slice((page - 1) * ItemsPerPage, page * ItemsPerPage);
  }, [currentOrders, page]);

  const Rows = useMemo(() => {
    switch (selectedTab) {
      case StateTabs.POSITIONS:
        return <Position quotes={paginatedItems as Quote[]} />;
      case StateTabs.INSTANT_OPEN_ORDERS:
        return (
          <InstantOpenOrders quotes={paginatedItems as InstantOpenItem[]} />
        );
      default:
        return <History quotes={paginatedItems as Quote[]} />;
    }
  }, [selectedTab, paginatedItems]);

  // This use effect manage pagination
  useEffect(() => {
    if (currentOrders.length === (page - 1) * ItemsPerPage && page > 1) {
      setPage((page) => page - 1);
    }
  }, [currentOrders.length]);

  useEffect(() => {
    setPage(1);
    setQuoteDetail(null);
  }, [selectedTab, setQuoteDetail, account, chainId]);

  useEffect(() => {
    const isQuoteInPositions = positionQuotes.some(
      (quote) => quote.id === quoteDetail?.id
    );

    if (!isQuoteInPositions && selectedTab === StateTabs.POSITIONS) {
      setQuoteDetail(null);
    }
  }, [positionQuotes, quoteDetail, selectedTab, setQuoteDetail]);

  const onClickPage = (value: number) => {
    if (value > page) {
      if (currentOrders.length > page * ItemsPerPage) {
        setPage(value);
        getHistoryQuotes();
      }
    } else {
      if (value >= 1) setPage(value);
    }
  };

  const activeNext = (() => {
    const itemsLengthCondition = page * ItemsPerPage < currentOrders.length;
    if (selectedTab === StateTabs.POSITIONS) return itemsLengthCondition;
    return hasMoreHistory || itemsLengthCondition;
  })();

  return (
    <Wrapper>
      <OrdersTab
        activeTab={selectedTab}
        setActiveTab={(s: StateTabs) => setSelectedTab(s)}
      />
      {Rows}
      {paginatedItems.length > 0 && (
        <Pagination
          page={page}
          setPage={onClickPage}
          activeNext={activeNext}
          activePrevious={page !== 1}
        />
      )}
    </Wrapper>
  );
}

function Pagination({
  page,
  setPage,
  activePrevious,
  activeNext,
}: {
  page: number;
  setPage: (page: number) => void;
  activePrevious: boolean;
  activeNext: boolean;
}) {
  return (
    <PaginationItems>
      <div style={{ display: "flex", gap: "40px", alignItems: "center" }}>
        <ArrowWrapper
          active={activePrevious}
          left={true}
          onClick={() => setPage(page - 1)}
        >
          <IconWrapper size={"48px"}>
            <ArrowRightTriangle width={10} height={18} />
          </IconWrapper>
        </ArrowWrapper>
        {page}
        <ArrowWrapper
          active={activeNext}
          left={false}
          onClick={() => setPage(page + 1)}
        >
          <IconWrapper size={"48px"}>
            <ArrowRightTriangle width={10} height={18} />
          </IconWrapper>
        </ArrowWrapper>
      </div>
    </PaginationItems>
  );
}
