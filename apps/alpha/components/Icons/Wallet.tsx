import React from "react";

export const Wallet = ({
  size = 20,
  ...rest
}: {
  size?: number;
  [x: string]: any;
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <rect
        x="0.5"
        y="0.5"
        width="19"
        height="19"
        rx="3.5"
        fill="#383C4B"
        stroke="url(#paint0_linear_1910_3951)"
        strokeMiterlimit="16"
      />
      <path
        opacity="0.7"
        d="M12.5 8C12.5 7.17157 13.1716 6.5 14 6.5H19.5V13.5H14C13.1716 13.5 12.5 12.8284 12.5 12V8Z"
        stroke="url(#paint1_linear_1910_3951)"
        strokeMiterlimit="16"
      />
      <defs>
        <linearGradient
          id="paint0_linear_1910_3951"
          x1="1.49012e-07"
          y1="10"
          x2="20"
          y2="10"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E5EFF3" />
          <stop offset="0.5" stopColor="#A2D4EA" />
          <stop offset="1" stopColor="#E5EFF3" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_1910_3951"
          x1="12"
          y1="10"
          x2="20"
          y2="10"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E5EFF3" />
          <stop offset="0.5" stopColor="#A2D4EA" />
          <stop offset="1" stopColor="#E5EFF3" />
        </linearGradient>
      </defs>
    </svg>
  );
};
