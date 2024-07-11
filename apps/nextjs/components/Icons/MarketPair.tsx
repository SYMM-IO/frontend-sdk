import React from "react";

export default function MarketPair({
  width = 30,
  height = 18,
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
      viewBox="0 0 30 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <circle
        cx="21"
        cy="9"
        r="8.5"
        fill="#383C4B"
        stroke="url(#paint0_linear_4024_18013)"
      />
      <circle
        cx="9"
        cy="9"
        r="8.5"
        fill="#383C4B"
        stroke="url(#paint1_linear_4024_18013)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_4024_18013"
          x1="12"
          y1="9"
          x2="30"
          y2="9"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E5F1F3" />
          <stop offset="0.5" stopColor="#AEE3FA" />
          <stop offset="1" stopColor="#E5F1F3" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_4024_18013"
          x1="1.3411e-07"
          y1="9"
          x2="18"
          y2="9"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E5F1F3" />
          <stop offset="0.5" stopColor="#AEE3FA" />
          <stop offset="1" stopColor="#E5F1F3" />
        </linearGradient>
      </defs>
    </svg>
  );
}
