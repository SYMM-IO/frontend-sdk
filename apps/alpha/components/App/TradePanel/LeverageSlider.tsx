import React, { useMemo } from "react";
import styled, { useTheme } from "styled-components";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

import {
  MAX_LEVERAGE_VALUE,
  MIN_LEVERAGE_VALUE,
} from "@symmio/frontend-sdk/constants/misc";

const Wrapper = styled.div`
  margin-top: 10px;
  padding: 0 5px;
  .rc-slider-mark {
    font-size: 10px;
  }
  .rc-slider-mark-text-active:last-chid {
    color: green;
  }
`;

export function LeverageSlider({
  value,
  maxLeverage,
  onChange,
  mixedColor,
}: {
  value: number;
  maxLeverage: number;
  onChange: any;
  mixedColor: string;
}) {
  const marks = useMemo(() => {
    if (maxLeverage === MAX_LEVERAGE_VALUE) {
      return {
        "1": "1",
        5: "5",
        10: "10",
        15: "15",
        20: "20",
        25: "25",
        30: "30",
        35: "35",
        40: "40",
      };
    }

    const range = (
      start: number,
      stop: number,
      step = maxLeverage < 10 ? 1 : Math.floor(maxLeverage / 10)
    ) =>
      Array.from(
        { length: (stop - start) / step + 1 },
        (_, i) => start + i * step
      ).reduce((a, v) => ({ ...a, [v]: v, [maxLeverage]: maxLeverage }), {});

    return range(1, maxLeverage);
  }, [maxLeverage]);
  const theme = useTheme();
  return (
    <Wrapper>
      <Slider
        min={MIN_LEVERAGE_VALUE}
        max={maxLeverage}
        step={1}
        marks={marks}
        value={value}
        trackStyle={{
          backgroundImage: `linear-gradient(to right, #6AFF78, ${mixedColor})`,
          height: 4,
        }}
        dotStyle={{
          borderRadius: "4px",
          height: "8px",
          width: "1px",
          borderColor: theme.text4,
        }}
        handleStyle={{
          borderColor: theme.bg,
          borderWidth: "1px",
          opacity: 1,
          height: 12,
          width: 12,
          marginTop: -4,
          borderRadius: 2,
          boxShadow: "none",
          backgroundColor: mixedColor,
        }}
        railStyle={{
          width: "calc(100% + 8px)",
          marginLeft: "-4px",
          background: theme.bg6,
        }}
        activeDotStyle={{ borderColor: theme.text4 }}
        onChange={onChange}
      />
    </Wrapper>
  );
}
