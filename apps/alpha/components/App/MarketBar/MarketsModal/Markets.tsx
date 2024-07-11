import React, { useState } from "react";
import styled from "styled-components";

import { Market } from "@symmio/frontend-sdk/types/market";

import { useNeutralMarkets } from "@symmio/frontend-sdk/hooks/useMarkets";

import { EmptySearch } from "components/Icons";
import MarketRow from "./MarketRow";

const EmptyRow = styled.div`
  text-align: center;
  margin: 110px auto;
  font-size: 14px;
`;

const Title = styled.div`
  font-weight: 500;
  font-size: 12px;
  margin: 12px 0px 4px 14px;
  color: ${({ theme }) => theme.text2};
`;

export default function Markets({
  markets,
  favoriteMarkets,
  onDismiss,
}: {
  markets: Market[];
  favoriteMarkets: Market[];
  onDismiss: () => void;
}) {
  const [favorites] = useState<Market[]>(favoriteMarkets);
  const allMarkets = useNeutralMarkets();

  return (
    <>
      {favorites.length > 0 &&
        markets.length > 0 &&
        markets.length === allMarkets.length && (
          <div>
            <Title>Favorite Markets</Title>
            {favorites.map((market, index) => (
              <MarketRow key={index} market={market} onDismiss={onDismiss} />
            ))}
          </div>
        )}
      <div>
        <Title>Markets</Title>
        {markets.length > 0 ? (
          markets.map((market, index) => (
            <MarketRow key={index} market={market} onDismiss={onDismiss} />
          ))
        ) : (
          <EmptyRow>
            <EmptySearch />
          </EmptyRow>
        )}
      </div>
    </>
  );
}
