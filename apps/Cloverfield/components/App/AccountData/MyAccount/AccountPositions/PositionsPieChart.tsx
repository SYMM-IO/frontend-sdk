import React, { useCallback, useContext, useState } from "react";
import styled, { useTheme } from "styled-components";
import Image from "next/legacy/image";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";

import { ConnectionStatus } from "@symmio/frontend-sdk/types/api";
import { PositionType } from "@symmio/frontend-sdk/types/trade";
import { AccountPositionsContext } from "./context";

import Clover from "/public/static/images/Clover.svg";
import { RowCenter } from "components/Row";

import { useUpnlWebSocketStatus } from "@symmio/frontend-sdk/state/user/hooks";

const shapeDim = {
  width: 36,
  height: 36,
};

const ChartWrapper = styled.div`
  width: inherit;
  height: inherit;
  position: relative;
`;

const CenterWrapper = styled(RowCenter)`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.bg4};
`;

const ChartContent = styled.div`
  width: 200%;
  height: 200%;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
`;

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    percent,
    name,
    color,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill={color}
        style={{ fontSize: "12px" }}
      >
        {name}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#F1F1F1"
        style={{ fontSize: "12px" }}
      >
        {`${(percent * 100).toFixed(2)}%`}
      </text>
    </g>
  );
};

export default function PositionsPieChart() {
  const theme = useTheme();
  const upnlLoadingStatus = useUpnlWebSocketStatus();
  const loading = upnlLoadingStatus === ConnectionStatus.CLOSED;

  const { marketQuotesInfo, colors } = useContext(AccountPositionsContext);
  const data = marketQuotesInfo.map((quoteInfo) => ({
    name: quoteInfo.marketName,
    color:
      quoteInfo.positionType === PositionType.LONG ? theme.green1 : theme.red1,
    value: quoteInfo.value,
  }));

  const [activeIndex, setActiveIndex] = useState(0);
  const onPieEnter = useCallback(
    (_, index) => {
      setActiveIndex(index);
    },
    [setActiveIndex]
  );
  const onPieLeave = useCallback(() => {
    setActiveIndex(-1);
  }, [setActiveIndex]);

  return loading ? (
    <ChartWrapper>
      <CenterWrapper>
        <Image
          src={Clover}
          width={shapeDim.width}
          height={shapeDim.height}
          alt={"cloverfield"}
        />
      </CenterWrapper>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={[{ name: "full", value: 1 }]}
            dataKey={"value"}
            innerRadius={"70%"}
            outerRadius={"104%"}
            stroke={"none"}
            isAnimationActive={false}
          >
            <Cell fill={theme.bg3} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  ) : (
    <ChartWrapper>
      <CenterWrapper>
        <Image
          src={Clover}
          width={shapeDim.width}
          height={shapeDim.height}
          alt={"cloverfield"}
        />
      </CenterWrapper>
      <ResponsiveContainer>
        <PieChart>
          {/* // defining linear gradient */}
          <defs>
            <linearGradient id={`piePrimaryGrad`}>
              <stop offset="0%" stopColor={"#E5F1F3"} />
              <stop offset="50%" stopColor={"#AEE3FA"} />
              <stop offset="100%" stopColor={"#E5F1F3"} />
            </linearGradient>
          </defs>
          <Pie
            data={[{ name: "full", value: 1 }]}
            dataKey={"value"}
            innerRadius={"70%"}
            outerRadius={"104%"}
            stroke={"none"}
            isAnimationActive={false}
          >
            <Cell fill={"url(#piePrimaryGrad)"} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <ChartContent>
        <ResponsiveContainer>
          <PieChart width={400} height={400}>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={data}
              dataKey="value"
              innerRadius={"36%"}
              outerRadius={"49%"}
              paddingAngle={data.length > 1 ? 2 : 0}
              onMouseOver={onPieEnter}
              onMouseLeave={onPieLeave}
            >
              {data.map((_entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index]}
                  stroke={"none"}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </ChartContent>
    </ChartWrapper>
  );
}
