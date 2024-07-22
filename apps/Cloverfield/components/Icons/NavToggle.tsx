import React from "react";

export default function NavToggle({
  width = 24,
  height = 10,
  ...rest
}: {
  width: number;
  height: number;
  [x: string]: any;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <rect width="24" height="3" rx="1" fill="#A0A2AA" />
      <rect y="7" width="24" height="3" rx="1" fill="#A0A2AA" />
    </svg>
  );
}
