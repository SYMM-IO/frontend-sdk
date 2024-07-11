import React from "react";

export default function NavbarBackground({
  width = 1394,
  height = 55,
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
      viewBox="0 0 1394 55"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <circle opacity="0.5" cx="829.5" cy="14.5" r="0.5" fill="#AA5CA1" />
      <circle opacity="0.5" cx="879.5" cy="24.5" r="0.5" fill="#AA5CA1" />
      <circle opacity="0.5" cx="799.5" cy="54.5" r="0.5" fill="#AA5CA1" />
      <circle opacity="0.5" cx="1069.5" cy="4.5" r="0.5" fill="#AA5CA1" />
      <circle opacity="0.5" cx="1189.5" cy="4.5" r="0.5" fill="#AA5CA1" />
      <circle opacity="0.5" cx="1119.5" cy="9.5" r="0.5" fill="#AA5CA1" />
      <circle opacity="0.5" cx="1239.5" cy="10.5" r="0.5" fill="#AA5CA1" />
      <circle opacity="0.5" cx="1039.5" cy="44.5" r="0.5" fill="#AA5CA1" />
      <circle opacity="0.5" cx="1159.5" cy="0.5" r="0.5" fill="#AA5CA1" />
      <circle opacity="0.5" cx="1393" cy="5" r="1" fill="#AA5CA1" />
      <circle opacity="0.5" cx="0.5" cy="11.5" r="0.5" fill="#AA5CA1" />
      <circle opacity="0.5" cx="639.5" cy="4.5" r="0.5" fill="#AA5CA1" />
      <circle opacity="0.5" cx="642.5" cy="44.5" r="0.5" fill="#AA5CA1" />
      <circle opacity="0.5" cx="579.5" cy="54.5" r="0.5" fill="#AA5CA1" />
      <circle opacity="0.5" cx="590" cy="15" r="1" fill="#AA5CA1" />
      <circle opacity="0.5" cx="519.5" cy="14.5" r="0.5" fill="#AA5CA1" />
      <circle opacity="0.5" cx="490" cy="35" r="1" fill="#AA5CA1" />
      <circle opacity="0.5" cx="440" cy="45" r="1" fill="#AA5CA1" />
      <circle opacity="0.5" cx="1363" cy="8" r="1" fill="#AA5CA1" />
      <circle opacity="0.5" cx="863" cy="38" r="1" fill="#AA5CA1" />
      <circle opacity="0.5" cx="783" cy="18" r="1" fill="#AA5CA1" />
      <circle opacity="0.5" cx="419.5" cy="14.5" r="0.5" fill="#AA5CA1" />
      <circle opacity="0.5" cx="361.5" cy="47.5" r="0.5" fill="#AA5CA1" />
      <circle opacity="0.5" cx="319.5" cy="14.5" r="0.5" fill="#AA5CA1" />
      <circle opacity="0.5" cx="240" cy="3" r="1" fill="#AA5CA1" />
      <circle opacity="0.5" cx="190" cy="25" r="1" fill="#AA5CA1" />
    </svg>
  );
}
