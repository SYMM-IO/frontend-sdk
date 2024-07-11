import { useRef, useState } from "react";
import styled from "styled-components";
import { isMobile } from "react-device-detect";

import { useActiveMarket } from "@symmio/frontend-sdk/state/trade/hooks";
import useOnOutsideClick from "lib/hooks/useOnOutsideClick";

import { ChevronDown, Loader } from "components/Icons";
import { Row, RowEnd, RowStart } from "components/Row";
import { MarketsModal } from "components/App/MarketBar/MarketsModal";

const Container = styled.div`
  display: inline-flex;
  align-items: center;
  height: 100%;
`;

const Wrapper = styled.div`
  gap: 5px;
  font-size: 1.2rem;

  &:hover {
    cursor: pointer;
  }
`;

const InnerContentWrapper = styled(Row)`
  padding: 11px 8px 10px 12px;
  height: 38px;
  max-width: 175px;
  border-radius: 4px;
  background: ${({ theme }) => theme.bg3};
`;

const Chevron = styled(ChevronDown)<{
  open: boolean;
}>`
  transform: rotateX(${({ open }) => (open ? "180deg" : "0deg")});
  transition: 0.5s;
`;

const MarketText = styled(Row)`
  gap: 12px;
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
  white-space: nowrap;
  color: ${({ theme }) => theme.text0};
`;

export default function MarketSelect() {
  const ref = useRef(null);
  const [clickMarket, setClickMarket] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const market = useActiveMarket();
  useOnOutsideClick(ref, () => setClickMarket(false));

  function getInnerContent() {
    return (
      <InnerContentWrapper>
        <RowStart style={{ marginRight: "39px" }}>
          {market ? (
            <MarketText>
              {market.symbol} / {market.asset}
            </MarketText>
          ) : (
            <Loader />
          )}
        </RowStart>
        <RowEnd width={"10%"} minWidth={"10px"}>
          <Chevron open={clickMarket} />
        </RowEnd>
      </InnerContentWrapper>
    );
  }

  return isMobile ? (
    <>
      <Wrapper onClick={() => setModalOpen(true)}>{getInnerContent()}</Wrapper>
      <MarketsModal
        isModal
        isOpen={modalOpen}
        onDismiss={() => setModalOpen(false)}
      />
    </>
  ) : (
    <Container ref={ref}>
      {clickMarket && (
        <div>
          <MarketsModal isOpen onDismiss={() => setClickMarket(!clickMarket)} />
        </div>
      )}
      <Wrapper onClick={() => setClickMarket(!clickMarket)}>
        {getInnerContent()}
      </Wrapper>
    </Container>
  );
}
