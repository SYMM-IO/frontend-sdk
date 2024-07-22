import { useCallback, useEffect, useRef, useState } from "react";
import styled, { css } from "styled-components";
import { useRouter } from "next/router";

import { Market } from "@symmio/frontend-sdk/types/market";

import { useFavoriteMarkets } from "@symmio/frontend-sdk/hooks/useMarkets";

import { Row, RowCenter } from "components/Row";
import { GradientStar } from "components/Icons";
import BlinkingPrice from "components/App/FavoriteBar/BlinkingPrice";

const Wrapper = styled(Row)`
  position: relative;
  min-height: 50px;
  border-radius: 4px;
  background: ${({ theme }) => theme.bg0};
`;

const FavoritesWrap = styled(Row)`
  height: 100%;
  padding: 8px;
  position: relative;
  width: 0px;
  z-index: 1;
  overflow-x: auto;
  overflow-y: hidden;
  flex: 1 1 0%;
  border-radius: 4px;
  margin-left: 12px;
  background: ${({ theme }) => theme.bg0};
`;

const Nav = styled.div<{ direction: "right" | "left" }>`
  position: absolute;
  ${({ direction }) => (direction === "left" ? "left: 42px" : "right: 0px")};
  top: 0;
  height: 100%;
  z-index: 99;
`;

const StyledNavButton = styled.button<{ direction: "right" | "left" }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 100%;
  background: ${({ theme }) => css`
    linear-gradient(90deg, ${theme.bg0} 50%, #ffffff00 100%);
  `};
  transform: ${({ direction }) =>
    direction === "left" ? "rotate(0deg)" : "rotate(180deg)"};
`;

const Arrow = styled.div`
  width: 12px;
  height: 12px;
  border: solid ${({ theme }) => theme.text0};
  border-width: 0 2px 2px 0;
  rotate: 135deg;
`;

const Item = styled(RowCenter)`
  min-width: 180px;
  width: unset;
  height: 30px;
  padding: 8px 12px;
  margin: 0px 7.5px;
  border-radius: 4px;

  &:hover {
    cursor: pointer;
    background: ${({ theme }) => theme.bg5};
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    min-width: 130px;
  `};
`;

const Empty = styled(RowCenter)`
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
`;

const Name = styled.div`
  font-weight: 500;
  font-size: 12px;
  line-height: 14px;
  white-space: nowrap;
  margin-right: 8px;
  margin-top: 1px;
  color: ${({ theme }) => theme.text1};
`;

export default function FavoriteBar() {
  const favorites = useFavoriteMarkets();
  const ref = useRef<HTMLDivElement>();
  const [target, setTarget] = useState(ref.current);

  const [leftArrow, setLeftArrow] = useState(false);
  const [rightArrow, setRightArrow] = useState(false);
  const THRESHOLD = 24;
  const SCROLL_AMOUNT = 200;

  useEffect(() => {
    setTarget(ref.current);
  }, [ref]);

  // set right arrow in initial loading
  useEffect(() => {
    if (target && favorites.length) {
      const maxScroll = target.scrollWidth - target.clientWidth;
      if (maxScroll > THRESHOLD) {
        setRightArrow(true);
      } else {
        setRightArrow(false);
      }
    }
  }, [favorites.length, target, target?.scrollWidth]);

  return (
    <Wrapper>
      <GradientStar
        style={{
          zIndex: 99,
          marginLeft: "16px",
        }}
      />

      {leftArrow && (
        <NavButton
          direction="left"
          onClick={() => {
            target?.scrollTo({
              left: target.scrollLeft - SCROLL_AMOUNT,
              behavior: "smooth",
            });
          }}
        />
      )}

      <FavoritesWrap
        ref={ref}
        onScroll={(e) => {
          const { scrollLeft, scrollWidth, clientWidth } = e.currentTarget;
          const maxScroll = scrollWidth - clientWidth;

          if (scrollLeft > THRESHOLD) {
            setLeftArrow(true);
          } else {
            setLeftArrow(false);
          }

          if (scrollLeft < maxScroll - THRESHOLD) {
            setRightArrow(true);
          } else {
            setRightArrow(false);
          }
        }}
      >
        {favorites.length > 0 ? (
          favorites.map((favorite, index) => (
            <FavoriteItem market={favorite} key={index} />
          ))
        ) : (
          <Empty>There are no markets in your Favorites List</Empty>
        )}
      </FavoritesWrap>

      {rightArrow && (
        <NavButton
          direction="right"
          onClick={() => {
            target?.scrollTo({
              left: target.scrollLeft + SCROLL_AMOUNT,
              behavior: "smooth",
            });
          }}
        />
      )}
    </Wrapper>
  );
}

function NavButton({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) {
  return (
    <Nav direction={direction}>
      <StyledNavButton direction={direction} onClick={onClick}>
        <Arrow />
      </StyledNavButton>
    </Nav>
  );
}

function FavoriteItem({ market }: { market: Market }) {
  const router = useRouter();

  const onClick = useCallback(() => {
    router.push(`/trade/${market.id}`);
  }, [router, market]);

  return (
    <Item onClick={onClick}>
      <Name>
        {market.symbol} / {market.asset}
      </Name>
      <BlinkingPrice market={market} />
    </Item>
  );
}
