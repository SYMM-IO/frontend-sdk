import React from "react";

export default function ChevronDown({
  width = 10,
  height = 7,
  color = "#5F6064",
  ...rest
}: {
  width: number;
  height: number;
  color?: string;
  [x: string]: any;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 10 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M9.55824 2.75607L6.05924 6.52713C5.47424 7.15762 4.52576 7.15762 3.94076 6.52713L0.441756 2.75607C-0.501929 1.73901 0.166427 0 1.501 0H8.499C9.83357 0 10.5019 1.73901 9.55824 2.75607Z"
        fill={color}
      />
    </svg>
  );
}
