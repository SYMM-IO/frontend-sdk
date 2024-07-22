import React from "react";

export default function External({
  size = 8,
  ...rest
}: {
  size?: number;
  [x: string]: any;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none" {...rest}>
      <path
        d="M9.17229 8.40085e-05L0.0235061 0.128185L0 1.80694L7.12232 1.70721L0.149528 8.68L1.31996 9.85044L8.29279 2.87761L8.19306 10L9.87181 9.97649L9.99992 0.827708C10.0064 0.364133 9.63587 -0.00640755 9.17229 8.40085e-05Z"
        fill="#F1F1FD"
      />
    </svg>
  );
}
