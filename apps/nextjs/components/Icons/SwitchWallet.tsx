import React from "react";

export const SwitchWallet = ({
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
        x="1"
        y="1"
        width="18"
        height="18"
        rx="3"
        stroke="#10141F"
        strokeWidth="2"
        strokeMiterlimit="16"
      />
      <path
        d="M13 8C13 7.44772 13.4477 7 14 7H19V13H14C13.4477 13 13 12.5523 13 12V8Z"
        stroke="#10141F"
        strokeWidth="2"
        strokeMiterlimit="16"
      />
    </svg>
  );
};
