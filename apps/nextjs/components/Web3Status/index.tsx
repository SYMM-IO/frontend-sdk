import React, { useRef } from "react";

import MultiAccount from "components/Web3Status/MultiAccount";

export default function Web3Status() {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <span ref={ref}>
      <MultiAccount />
    </span>
  );
}
