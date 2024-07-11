import { useLayoutEffect, useState, useMemo } from "react";

import useEventListener from "./useEventListener";
import { MEDIA_WIDTHS } from "theme";

interface WindowSize {
  width: number;
  height: number;
}

export default function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 0,
    height: 0,
  });

  const handleSize = () => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  useEventListener("resize", handleSize);

  // Set size at the first client-side load
  useLayoutEffect(() => {
    handleSize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return windowSize;
}

export function useIsMobile() {
  const { width } = useWindowSize();
  return useMemo(() => width <= MEDIA_WIDTHS.upToMedium, [width]);
}
