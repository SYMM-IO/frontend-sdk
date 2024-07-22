import { useMemo } from "react";
import Pagination from "components/Pagination";
import { Quote } from "@symmio/frontend-sdk/types/quote";

export const ItemsPerPage = 7;

export default function PaginateTable({
  quotes,
  setPaginationOffset,
}: {
  quotes: Quote[];
  setPaginationOffset: (num: number) => void;
}): JSX.Element | null {
  const pageCount = useMemo(() => {
    return Math.ceil(quotes.length / ItemsPerPage);
  }, [quotes]);

  const onPageChange = ({ selected }: { selected: number }) => {
    setPaginationOffset(Math.ceil(selected * ItemsPerPage));
  };
  return <Pagination pageCount={pageCount} onPageChange={onPageChange} />;
}
