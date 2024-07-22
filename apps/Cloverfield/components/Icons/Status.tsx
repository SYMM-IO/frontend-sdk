import React from "react";
import { useTheme } from "styled-components";

export default function Status({
  connected,
  size = 8,
  ...rest
}: {
  connected?: boolean;
  size?: number;
  [x: string]: any;
}) {
  const theme = useTheme();
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" fill="none" {...rest}>
      <circle
        cx="4"
        cy="4"
        r="4"
        fill={connected ? theme.green1 : theme.red1}
      />
    </svg>
  );
}
