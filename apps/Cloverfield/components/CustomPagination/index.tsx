import { useState, createContext, useContext } from "react";
import styled from "styled-components";

import { ChevronDown, IconWrapper } from "components/Icons";
import ArrowRightTriangle from "components/Icons/ArrowRightTriangle";
import { Card } from "components/Card";
import { Row, RowBetween, RowEnd } from "components/Row";

const Container = styled(RowEnd)`
  height: 48px;
  padding: 0 24px;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 0 12px;
  `}
  position: relative;
`;

const Center = styled.div`
  width: 200px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const Pagination = styled(Row)`
  font-weight: 400;
`;

const RowPerPage = styled(Pagination)`
  width: 200px;
  font-weight: 400;
  background-color: ${({ theme }) => theme.bg2};
  border-radius: 4px;
  padding: 12px;
  font-size: 12px;
  &:hover {
    cursor: pointer;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 64px;
  `}
`;
const RowPerPageText = styled.div`
  font-size: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `}
`;
const ArrowWrapper = styled.button<{ left?: boolean; active?: boolean }>`
  transform: rotate(${({ left }) => (left ? "180deg" : "0")});
  opacity: ${({ active }) => (active ? "1" : "0.5")};
  &:hover {
    cursor: ${({ active }) => (active ? "pointer" : "default")};
  }
`;

const ChevronWrapper = styled.div`
  width: 10%;
  height: 100%;
  text-align: center;
`;

const Chevron = styled(ChevronDown)<{ open: boolean }>`
  transform: rotateX(${({ open }) => (open ? "180deg" : "0deg")});
  transition: 0.5s;
`;

const ActiveNum = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

const HoverWrapper = styled(Card)`
  padding: 0px;
  width: 200px;
  position: absolute;
  transform: translateY(-4px);
  z-index: 1;
  background: ${({ theme }) => theme.bg2};
  border-top: 1px solid ${({ theme }) => theme.bg5};
  border-radius: 0 0 4px 4px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 64px;
  `};
`;

const HoverItem = styled.div`
  &:hover {
    cursor: pointer;
    background: ${({ theme }) => theme.bg0};
  }
`;
const HoverItemContent = styled.div`
  padding: 12px;
  font-size: 14px;
  font-weight: 400;
`;

interface IPageInfo {
  currentPage: number;
  pageCount: number;
  onPageChange: (...args: any) => any;
}

interface IRowsPerPageInfo {
  currentPage: number;
  rowsPerPage: number;
  onRowsPerPageChange: (...args: any) => any;
}

const NavigationContext = createContext<IPageInfo>({
  currentPage: 1,
  pageCount: 1,
  onPageChange: () => {
    return;
  },
});

const CardContext = createContext<IRowsPerPageInfo>({
  currentPage: 1,
  rowsPerPage: 20,
  onRowsPerPageChange: () => {
    return;
  },
});

function Arrow({
  currentPage,
  newPage,
  onPageChange,
  pageCount,
  left,
}: {
  currentPage: number;
  newPage: number;
  onPageChange: (...args: any) => any;
  pageCount: number;
  left?: boolean;
}) {
  const isActive = left ? currentPage > 1 : currentPage < pageCount;
  return (
    <ArrowWrapper
      active={isActive}
      left={left}
      onClick={() => onPageChange(newPage)}
    >
      <IconWrapper size={"40px"}>
        <ArrowRightTriangle width={10} height={18} />
      </IconWrapper>
    </ArrowWrapper>
  );
}

function PaginationNavigation() {
  const { currentPage, pageCount, onPageChange } =
    useContext(NavigationContext);
  return (
    <Center>
      <Pagination width={"initial"} gap={"12px"}>
        <Arrow
          currentPage={currentPage}
          newPage={currentPage - 1}
          onPageChange={onPageChange}
          pageCount={pageCount}
          left
        />
        <Row gap={"12px"} width={"initial"}>
          <ActiveNum>{currentPage}</ActiveNum> <span>of</span>{" "}
          <span>{pageCount}</span>
        </Row>
        <Arrow
          currentPage={currentPage}
          newPage={currentPage + 1}
          onPageChange={onPageChange}
          pageCount={pageCount}
        />
      </Pagination>
    </Center>
  );
}

function PaginationPerPageCard() {
  const { currentPage, rowsPerPage, onRowsPerPageChange } =
    useContext(CardContext);
  const [cardOpen, setCardOpen] = useState<boolean>(false);
  return (
    <div>
      <RowPerPage
        gap="4px"
        onClick={() => setCardOpen((prevCardOpen) => !prevCardOpen)}
      >
        <RowBetween>
          <RowPerPageText>Rows per page</RowPerPageText>
          <ActiveNum>{rowsPerPage}</ActiveNum>
        </RowBetween>
        <ChevronWrapper>
          <Chevron open={cardOpen} />
        </ChevronWrapper>
      </RowPerPage>
      {cardOpen && (
        <HoverWrapper onClick={() => setCardOpen(false)}>
          {[5, 10, 20].map((newRowsPerPage) => (
            <HoverItem
              key={newRowsPerPage}
              onClick={() =>
                onRowsPerPageChange(currentPage, rowsPerPage, newRowsPerPage)
              }
            >
              <HoverItemContent>{newRowsPerPage}</HoverItemContent>
            </HoverItem>
          ))}
        </HoverWrapper>
      )}
    </div>
  );
}

export default function CustomPagination({
  pageCount,
  currentPage,
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
}: {
  pageCount: number;
  currentPage: number;
  onPageChange: (...args: any) => any;
  rowsPerPage: number;
  onRowsPerPageChange: (...args: any) => any;
}) {
  const pageInfo: IPageInfo = {
    currentPage,
    pageCount,
    onPageChange,
  };
  const rowsPerPageInfo: IRowsPerPageInfo = {
    currentPage,
    rowsPerPage,
    onRowsPerPageChange,
  };
  return (
    <Container>
      <NavigationContext.Provider value={pageInfo}>
        <PaginationNavigation />
      </NavigationContext.Provider>

      <CardContext.Provider value={rowsPerPageInfo}>
        <PaginationPerPageCard />
      </CardContext.Provider>
    </Container>
  );
}
