import React from "react";

export default function AdvancedSettings({
  width = 20,
  height = 18,
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
      viewBox="0 0 20 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.45792 10.3448C3.81922 10.3448 4.11212 10.669 4.11212 11.069V17.2759C4.11212 17.6758 3.81922 18 3.45792 18C3.09661 18 2.80371 17.6758 2.80371 17.2759V11.069C2.80371 10.669 3.09661 10.3448 3.45792 10.3448Z"
        fill="#8B8E9F"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.45792 0C3.81922 0 4.11212 0.324208 4.11212 0.724138V6.93104C4.11212 7.33097 3.81922 7.65517 3.45792 7.65517C3.09661 7.65517 2.80371 7.33097 2.80371 6.93104V0.724138C2.80371 0.324208 3.09661 0 3.45792 0Z"
        fill="#8B8E9F"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.99991 8.27585C10.3612 8.27585 10.6541 8.60006 10.6541 8.99999V17.2758C10.6541 17.6758 10.3612 18 9.99991 18C9.6386 18 9.3457 17.6758 9.3457 17.2758V8.99999C9.3457 8.60006 9.6386 8.27585 9.99991 8.27585Z"
        fill="#8B8E9F"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.99991 0C10.3612 0 10.6541 0.324208 10.6541 0.724138V4.86207C10.6541 5.262 10.3612 5.58621 9.99991 5.58621C9.6386 5.58621 9.3457 5.262 9.3457 4.86207V0.724138C9.3457 0.324208 9.6386 0 9.99991 0Z"
        fill="#8B8E9F"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.5419 11.3793C16.9032 11.3793 17.1961 11.7035 17.1961 12.1034V17.2759C17.1961 17.6758 16.9032 18 16.5419 18C16.1806 18 15.8877 17.6758 15.8877 17.2759V12.1034C15.8877 11.7035 16.1806 11.3793 16.5419 11.3793Z"
        fill="#8B8E9F"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.5419 0C16.9032 0 17.1961 0.324208 17.1961 0.724138V9C17.1961 9.39993 16.9032 9.72414 16.5419 9.72414C16.1806 9.72414 15.8877 9.39993 15.8877 9V0.724138C15.8877 0.324208 16.1806 0 16.5419 0Z"
        fill="#8B8E9F"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 11.069C0 10.669 0.292898 10.3448 0.654206 10.3448H5.3271C5.68841 10.3448 5.98131 10.669 5.98131 11.069C5.98131 11.4689 5.68841 11.7931 5.3271 11.7931H0.654206C0.292898 11.7931 0 11.4689 0 11.069Z"
        fill="url(#paint0_linear_4024_18020)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.54199 4.86208C6.54199 4.46215 6.83489 4.13794 7.1962 4.13794H12.8037C13.165 4.13794 13.4579 4.46215 13.4579 4.86208C13.4579 5.26201 13.165 5.58622 12.8037 5.58622H7.1962C6.83489 5.58622 6.54199 5.26201 6.54199 4.86208Z"
        fill="url(#paint1_linear_4024_18020)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.0186 12.1034C14.0186 11.7035 14.3115 11.3793 14.6728 11.3793H19.3457C19.707 11.3793 19.9999 11.7035 19.9999 12.1034C19.9999 12.5034 19.707 12.8276 19.3457 12.8276H14.6728C14.3115 12.8276 14.0186 12.5034 14.0186 12.1034Z"
        fill="url(#paint2_linear_4024_18020)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_4024_18020"
          x1="4.45642e-08"
          y1="11.069"
          x2="5.98131"
          y2="11.069"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E5F1F3" />
          <stop offset="0.5" stopColor="#AEE3FA" />
          <stop offset="1" stopColor="#E5F1F3" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_4024_18020"
          x1="6.54199"
          y1="4.86208"
          x2="13.4579"
          y2="4.86208"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E5F1F3" />
          <stop offset="0.5" stopColor="#AEE3FA" />
          <stop offset="1" stopColor="#E5F1F3" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_4024_18020"
          x1="14.0186"
          y1="12.1034"
          x2="19.9999"
          y2="12.1034"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E5F1F3" />
          <stop offset="0.5" stopColor="#AEE3FA" />
          <stop offset="1" stopColor="#E5F1F3" />
        </linearGradient>
      </defs>
    </svg>
  );
}
