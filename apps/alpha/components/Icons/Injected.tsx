import React from "react";

export default function Injected({
  width = 18,
  height = 18,
  color,
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
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M9.79261 16.1108L17.5398 8.36364L9.79261 0.616477L8.25852 2.15057L13.3807 7.25568H0V9.47159H13.3807L8.25852 14.5852L9.79261 16.1108Z"
        fill={color}
      />
    </svg>
  );
}
