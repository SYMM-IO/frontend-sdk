import React from "react";

export default function Next({
  width = 10,
  height = 8,
  color = "#A0A2B2",
  ...rest
}: {
  width?: number;
  height?: number;
  color?: string;
  [x: string]: any;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 10 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M0.5 0C0.223858 0 0 0.223858 0 0.5C0 0.776142 0.223858 1 0.5 1H4.99944C4.61625 1.00015 4.23312 1.15778 3.94076 1.47287L0.441756 5.24393C-0.501929 6.26099 0.166427 8 1.501 8H8.499C9.83357 8 10.5019 6.26099 9.55824 5.24393L6.05924 1.47287C5.76688 1.15778 5.38375 1.00015 5.00056 1H9.5C9.77614 1 10 0.776142 10 0.5C10 0.223858 9.77614 0 9.5 0H0.5Z"
        fill={color}
      />
    </svg>
  );
}
