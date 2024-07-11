import React from "react";

// export const Close = styled(X)<{
//   size?: string
//   color?: string
//   onClick?: () => void
// }>`
//   width: ${(props) => props.size ?? '15px'};
//   height: ${(props) => props.size ?? '15px'};
//   color: ${({ theme, color }) => color ?? theme.text0};
//   &:hover {
//     cursor: pointer;
//     opacity: 0.6;
//   }
// `

export default function Close({
  size = 16,
  color = "#A0A2B2",
  onClick,
  ...rest
}: {
  size?: number;
  color?: string;
  onClick?: () => void;
  [x: string]: any;
}) {
  return (
    <svg
      width={size}
      height={size}
      onClick={onClick}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M16 1.45455L14.5455 0L8 6.54545L1.45455 0L0 1.45455L6.54545 8L0 14.5455L1.45455 16L8 9.45455L14.5455 16L16 14.5455L9.45455 8L16 1.45455Z"
        fill={color}
      />
    </svg>
  );
}
