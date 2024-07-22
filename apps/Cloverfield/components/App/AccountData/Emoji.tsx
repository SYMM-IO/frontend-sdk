import React from "react";

export default function Emoji({
  label,
  symbol,
  ...rest
}: {
  label: string;
  symbol: string;
  [x: string]: any;
}) {
  return (
    <span
      className="emoji"
      role="img"
      aria-label={label ? label : ""}
      aria-hidden={label ? "false" : "true"}
      {...rest}
    >
      {symbol}
    </span>
  );
}
