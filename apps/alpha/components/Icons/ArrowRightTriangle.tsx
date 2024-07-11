import React from "react";

export default function ArrowRightTriangle({
  width = 7,
  height = 12,
  color = "#EBEBEC",
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
      viewBox="0 0 7 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M6.53787 5.78791L1.26213 0.512176C1.07314 0.323186 0.75 0.457036 0.75 0.724308L0.75 11.2758C0.75 11.5431 1.07314 11.6769 1.26213 11.4879L6.53787 6.21218C6.65503 6.09502 6.65503 5.90507 6.53787 5.78791Z"
        fill={color}
      />
    </svg>
  );
}
