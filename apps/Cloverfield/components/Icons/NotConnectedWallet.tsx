import React from "react";

export default function NotConnectedWallet({
  width = 92,
  height = 96,
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
      viewBox="0 0 92 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <rect x="45" y="41" width="2" height="24" fill="#292C3B" />
      <rect x="45" width="2" height="23" fill="#292C3B" />
      <rect x="40.5" y="23.5" width="11" height="17" stroke="#292C3B" />
      <rect x="5" y="77" width="2" height="17" fill="#323847" />
      <rect x="5" y="46" width="2" height="17" fill="#323847" />
      <rect x="0.5" y="63.5" width="11" height="13" stroke="#323847" />
      <rect x="25" y="60" width="2" height="24" fill="#323847" />
      <rect x="25" y="16" width="2" height="14" fill="#323847" />
      <rect x="20.5" y="30.5" width="11" height="29" stroke="#323847" />
      <rect x="85" y="70" width="2" height="16" fill="#323847" />
      <rect x="85" y="10" width="2" height="12" fill="#323847" />
      <rect x="80.5" y="21.5" width="11" height="49" stroke="#323847" />
      <rect x="65" y="69" width="2" height="27" fill="#292C3B" />
      <rect x="65" y="13" width="2" height="26" fill="#292C3B" />
      <rect x="60.5" y="39.5" width="11" height="29" stroke="#292C3B" />
    </svg>
  );
}
