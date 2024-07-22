import React from "react";
import styled from "styled-components";

import { useUserWhitelist } from "@symmio/frontend-sdk/state/user/hooks";

import { Info } from "components/Icons";
import { Close as CloseIcon } from "components/Icons";
import { RowStart } from "components/Row";
import { ExternalLinkIcon } from "components/Link";

const Container = styled.div`
  margin: 0px 8px;
`;

const Wrapper = styled.div<{ bg?: string }>`
  width: 100%;
  display: flex;
  justify-content: center;
  background: ${({ theme, bg }) =>
    bg ? (bg === "gray" ? theme.text3 : bg) : theme.warning};
`;

const Text = styled.div`
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  margin: 8px 24px;
  color: ${({ theme }) => theme.black};
`;

const CloseIconWrapper = styled.button`
  position: absolute;
  padding: 5px;
  right: 25px;
  cursor: pointer;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    right: 6px;
  `}
`;

const InfoIcon = styled(Info)`
  color: ${({ theme }) => theme.white};
  margin-top: 6px;
  margin-right: -15px;
  cursor: default !important;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-left: 6px;
  `}
`;

export function Banner({
  text,
  onClose,
  bg,
  hasInfoIcon,
}: {
  text: string | JSX.Element;
  onClose?: (status: boolean) => void;
  bg?: string;
  hasInfoIcon?: boolean;
}) {
  return (
    <Wrapper bg={bg}>
      {hasInfoIcon && <InfoIcon size={20} />}
      <Text>{text}</Text>
      {onClose && (
        <CloseIconWrapper onClick={() => onClose(false)}>
          <CloseIcon size={12} color={"black"} />
        </CloseIconWrapper>
      )}
    </Wrapper>
  );
}

export default function WrapperBanner() {
  const userWhitelisted = useUserWhitelist();
  const showBanner =
    typeof window !== "undefined" &&
    localStorage.getItem("risk_warning") === "true"
      ? false
      : true;

  if (!showBanner) return null;

  return (
    <Container>
      {userWhitelisted === false && (
        <Banner
          text={
            <RowStart gap={"4px"} width="unset">
              You are not whitelisted! Please fill in this{" "}
              <ExternalLinkIcon href="https://7eoku1wmhjg.typeform.com/cloverfieldnew">
                form
              </ExternalLinkIcon>
            </RowStart>
          }
        />
      )}
    </Container>
  );
}
