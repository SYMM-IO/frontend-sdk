import React from "react";

export default function Trade({
  width = 28,
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
      viewBox="0 0 28 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <rect
        x="0.5"
        y="0.5"
        width="27"
        height="17"
        rx="3.5"
        fill="#383C4B"
        stroke="url(#paint0_linear_1903_3830)"
      />
      <path
        d="M5 14L11.5455 7.68421L15.3636 11.3684L23 4"
        stroke="url(#paint1_linear_1903_3830)"
        strokeWidth="1.3"
      />
      <defs>
        <linearGradient
          id="paint0_linear_1903_3830"
          x1="2.08616e-07"
          y1="9"
          x2="28"
          y2="9"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E5EFF3" />
          <stop offset="0.5" stopColor="#A2D4EA" />
          <stop offset="1" stopColor="#E5EFF3" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_1903_3830"
          x1="5"
          y1="9"
          x2="23"
          y2="9"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#A6CCDC" />
          <stop offset="1" stopColor="#C0E9FA" />
        </linearGradient>
      </defs>
    </svg>
  );
}
