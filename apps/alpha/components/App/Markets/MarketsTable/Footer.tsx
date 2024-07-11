import CustomPagination from "components/CustomPagination";

export default function Footer({
  pageCount,
  currentPage,
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
}: {
  pageCount: number;
  currentPage: number;
  onPageChange: (value: number) => any;
  rowsPerPage: number;
  onRowsPerPageChange: (...args: any) => any;
}) {
  return (
    <CustomPagination
      currentPage={currentPage}
      pageCount={pageCount}
      onPageChange={onPageChange}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={onRowsPerPageChange}
    />
  );
}
