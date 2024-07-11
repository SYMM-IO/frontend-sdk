import React from "react";

export default function Leverage({
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
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M0 10L3.99801 4.26215L4.02792 5.82035L0.199402 0H3.04088L4.51645 2.67644L5.15454 3.91384L5.62313 2.70394L6.999 0H9.82054L5.94217 5.82035L5.97208 4.25298L10 10H7.07876L5.45364 7.26856L4.82552 6.18699L4.33699 7.33272L2.81156 10H0Z"
        fill={color}
      />
    </svg>
  );
}
