import React from "react";

export default function Client({
  width = 18,
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
      viewBox="0 0 18 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <circle
        cx="9"
        cy="5"
        r="4.5"
        fill="#383C4B"
        stroke="url(#paint0_linear_1910_3928)"
      />
      <path
        d="M0 18C0 14.6863 2.68629 12 6 12H12C15.3137 12 18 14.6863 18 18V19C18 19.5523 17.5523 20 17 20H1C0.447716 20 0 19.5523 0 19V18Z"
        fill="url(#paint1_linear_1910_3928)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_1910_3928"
          x1="4"
          y1="5"
          x2="14"
          y2="5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E5EFF3" />
          <stop offset="1" stopColor="#89B3C5" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_1910_3928"
          x1="1.3411e-07"
          y1="16"
          x2="18"
          y2="16"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E5EFF3" />
          <stop offset="1" stopColor="#89B3C5" />
        </linearGradient>
      </defs>
    </svg>
  );
}
