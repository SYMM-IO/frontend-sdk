import React, { useMemo } from "react";
import styled, { useTheme } from "styled-components";
import Image, { StaticImageData } from "next/legacy/image";
import { isMobile } from "react-device-detect";

import { formatTimestamp } from "@symmio/frontend-sdk/utils/time";

import Column from "components/Column";
import Logos from "components/Notifications/Logos";
import { Row, RowCenter, RowEnd, RowStart } from "components/Row";
import ShimmerAnimation from "components/ShimmerAnimation";

const Container = styled(Row)<{
  bg?: string;
  border?: string;
  report?: boolean;
  cursor?: string;
}>`
  border-radius: ${({ report }) => (report ? "4px 4px 0px 0px" : "4px")};
  background: ${({ theme, bg }) => (bg ? bg : theme.bg2)};
  cursor: ${({ cursor }) => (cursor ? cursor : "default")};

  ${({ border }) =>
    border &&
    `
    border: 1px solid ${border};
  `}
`;

const Wrapper = styled(Column)`
  width: 100%;
  padding: 12px;
  overflow: hidden;
`;

const LogoWrapper = styled(RowCenter)<{ rotate?: number }>`
  width: unset;
  min-width: 54px;
  padding: 8px 0px 8px 8px;
  rotate: ${({ rotate }) => (rotate ? `${rotate}deg` : "none")};
`;

const TextRow = styled(Row)`
  font-weight: 400;
  font-size: 12px;
  color: ${({ theme }) => theme.text0};
`;

const AccountName = styled(RowEnd)<{ alert?: string }>`
  font-weight: 400;
  font-size: 12px;
  width: unset;
  color: ${({ theme, alert }) => (alert ? alert : theme.text4)};
`;

const Timestamp = styled(AccountName)`
  margin-left: 6px;
  color: ${({ theme, alert }) => (alert ? alert : theme.text3)};
`;

const Report = styled(RowCenter)`
  height: 24px;
  font-weight: 500;
  font-size: 10px;
  text-align: center;
  margin-top: -10px;
  border-radius: 0px 0px 2px 2px;
  color: ${({ theme }) => theme.text0};
  background: ${({ theme }) => theme.bg6};
`;

export default function BaseCard({
  title,
  text,
  icon,
  bg,
  border,
  timestamp,
  accountName,
  token1,
  token2,
  rotate,
  status,
  report,
  onClick,
  loading,
}: {
  title: string | JSX.Element;
  text: string | JSX.Element;
  icon?: string | StaticImageData;
  token1?: string | StaticImageData;
  token2?: string | StaticImageData;
  rotate?: number;
  status?: string | JSX.Element;
  timestamp: string;
  accountName: string;
  bg?: string;
  border?: string;
  report?: string;
  onClick?: () => void;
  loading?: boolean;
}): JSX.Element {
  const theme = useTheme();

  const timeFormat = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const thatDay = new Date(Number(timestamp) * 1000).setHours(0, 0, 0, 0);
    return today === thatDay ? "HH:mm" : undefined;
  }, [timestamp]);

  const time = formatTimestamp(Number(timestamp) * 1000, timeFormat);
  const getImageSize = () => {
    return isMobile ? 40 : 44;
  };

  const onClickItem = () => {
    onClick && onClick();
  };

  return (
    <>
      <Container
        bg={bg}
        border={border}
        report={!!report}
        onClick={onClickItem}
        cursor={!!onClick ? "pointer" : "default"}
      >
        <LogoWrapper rotate={rotate}>
          {loading ? (
            <ShimmerAnimation
              width={"40px"}
              height={"40px"}
              borderRadius={"20px"}
            />
          ) : (
            <>
              {icon && (
                <Image
                  src={icon}
                  width={getImageSize()}
                  height={getImageSize()}
                  alt={`icon`}
                />
              )}
              {(token1 || token2) && <Logos img1={token1} img2={token2} />}
            </>
          )}
        </LogoWrapper>

        <Wrapper>
          <TextRow style={{ marginBottom: "8px" }}>
            <RowStart width={"70%"}>{title}</RowStart>
            <RowEnd>
              <AccountName
                alert={!!border ? theme.text1 : undefined}
              >{`[${accountName}]`}</AccountName>
              <Timestamp alert={!!border ? theme.text0 : undefined}>
                {time}
              </Timestamp>
            </RowEnd>
          </TextRow>
          <TextRow>
            {text}
            {status && <RowEnd>{status}</RowEnd>}
          </TextRow>
        </Wrapper>
      </Container>
      {report && <Report>{report}</Report>}
    </>
  );
}
