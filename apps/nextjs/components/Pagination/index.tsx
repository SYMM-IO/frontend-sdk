import React from "react";
import styled from "styled-components";
import ReactPaginate from "react-paginate";
import { lighten } from "polished";

const Wrapper = styled.div`
  /* margin: 0.8rem auto; */
  font-size: 0.8rem;
  margin-top: auto;
  .pagination {
    display: flex;
    justify-content: center;
    list-style-type: none;
    align-items: baseline;
    margin: 0;
    padding: 0;
    overflow: hidden;
    & > li {
      float: left;
    }
    & > li a {
      display: block;
      padding: 10px;
      font-size: 14px;
      text-decoration: none;
      :hover {
        cursor: pointer;
      }
      ${({ theme }) => theme.mediaWidth.upToSmall`
        padding: 1rem 0.8rem;
      `}
    }
    .active {
      a {
        color: ${({ theme }) => lighten(0.05, theme.text0)};
        font-size: 16px;
        font-weight: 600;
      }
    }
  }
  .break {
    pointer-events: none;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 0.7rem;
  `}
`;

export default function Pagination({
  pageCount,
  onPageChange,
}: {
  pageCount: number;
  onPageChange: ({ selected }: { selected: number }) => void;
}) {
  return (
    <Wrapper>
      <ReactPaginate
        previousLabel={"<"}
        nextLabel={">"}
        breakLabel={"..."}
        breakClassName={"break"}
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={3}
        onPageChange={onPageChange}
        containerClassName={"pagination"}
        activeClassName={"active"}
      />
    </Wrapper>
  );
}
