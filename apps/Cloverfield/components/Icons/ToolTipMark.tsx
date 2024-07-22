import React from "react";

export default function ToolTipMark({
  width,
  height,
  ...rest
}: {
  width: number;
  height: number;
  [x: string]: any;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M6.54545 5.45455V8.72727H5.45455V5.45455H6.54545Z"
        fill="#8B8E95"
      />
      <path
        d="M6.55091 3.27273H5.45455V4.36364H6.55091V3.27273Z"
        fill="#8B8E95"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 6C0 2.68629 2.68629 0 6 0C9.31371 0 12 2.68629 12 6C12 9.31371 9.31371 12 6 12C2.68629 12 0 9.31371 0 6ZM6 1.09091C3.28878 1.09091 1.09091 3.28878 1.09091 6C1.09091 8.71122 3.28878 10.9091 6 10.9091C8.71122 10.9091 10.9091 8.71122 10.9091 6C10.9091 3.28878 8.71122 1.09091 6 1.09091Z"
        fill="#8B8E95"
      />
    </svg>
  );
}
