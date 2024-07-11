import React from "react";

export default function Rectangle({
  width = 9,
  height = 20,
  ...rest
}: {
  width?: number;
  height?: number;
  [x: string]: any;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 9 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M1.20414 11.3379C0.519589 10.5773 0.519588 9.42268 1.20414 8.66207L9 0V20L1.20414 11.3379Z"
        fill="url(#paint0_linear_2783_5763)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_2783_5763"
          x1="6.70552e-08"
          y1="10"
          x2="9"
          y2="10"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#B300B8" />
          <stop offset="0.5" stopColor="#B300B8" />
          <stop offset="1" stopColor="#B300B8" />
        </linearGradient>
      </defs>
    </svg>
  );
}
