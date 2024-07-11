import { useEffect, useState } from "react";
import styled from "styled-components";

import { useAllMarketsData } from "@symmio/frontend-sdk/hooks/useAllMarketsData";
import { Market } from "@symmio/frontend-sdk/types/market";
import { ApiState } from "@symmio/frontend-sdk/types/api";

import MarketRow from "./Row";
import Footer from "./Footer";
import Column from "components/Column";
import { Loader } from "components/Icons";
import { RowBetween } from "components/Row";

const FooterWrapper = styled(RowBetween)`
  height: 56px;
  background: ${({ theme }) => theme.bg0};
  border-radius: 0 0 4px 4px;
`;

const LoaderWrapper = styled.div`
  margin: 16px auto;
`;

export default function TableBody({
  markets,
  searchValue,
}: {
  markets: Market[];
  searchValue: string;
}): JSX.Element | null {
  const [page, setPage] = useState<number>(1);
  const [marketsPerPage, setMarketsPerPage] = useState<number>(20);
  const [visibleMarkets, setVisibleMarkets] = useState<Market[]>(
    markets.slice(
      (page - 1) * marketsPerPage,
      Math.min(page * marketsPerPage, markets.length)
    )
  );
  const { marketsInfo, infoStatus } = useAllMarketsData();

  const pageCount = Math.ceil(markets.length / marketsPerPage);

  const onPageChange = (newCalculatedPage: number) => {
    let newPage;
    if (newCalculatedPage > pageCount) newPage = pageCount;
    else if (newCalculatedPage < 1) newPage = 1;
    else newPage = newCalculatedPage;
    setPage(newPage);
  };

  const onMarketsPerPageChange = (
    currentPage: number,
    prevRowsPerPageValue: number,
    newRowsPerPageValue: number
  ) => {
    const rowsPerPageRatio = prevRowsPerPageValue / newRowsPerPageValue;
    const newCalculatedPage =
      Math.floor((currentPage - 1) * rowsPerPageRatio) + 1;

    setMarketsPerPage(newRowsPerPageValue);
    onPageChange(newCalculatedPage);
  };

  useEffect(() => {
    setVisibleMarkets(
      markets.slice(
        (page - 1) * marketsPerPage,
        Math.min(page * marketsPerPage, markets.length)
      )
    );
  }, [markets, page, marketsPerPage]);

  useEffect(() => {
    setPage(1);
  }, [searchValue]);

  return (
    <Column>
      {infoStatus === ApiState.LOADING ? (
        <LoaderWrapper>
          <Loader />
        </LoaderWrapper>
      ) : infoStatus === ApiState.OK ? (
        visibleMarkets.map((market) => (
          <MarketRow
            key={market.id}
            market={market}
            marketInfo={marketsInfo[market.name]}
          />
        ))
      ) : (
        <h1>error</h1>
      )}
      <FooterWrapper>
        <Footer
          pageCount={pageCount}
          currentPage={page}
          onPageChange={onPageChange}
          rowsPerPage={marketsPerPage}
          onRowsPerPageChange={onMarketsPerPageChange}
        />
      </FooterWrapper>
    </Column>
  );
}
