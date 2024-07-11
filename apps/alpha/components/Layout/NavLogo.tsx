import React from "react";
import styled from "styled-components";
import Image from "next/legacy/image";

import SYMMETRIAL_ICON from "/public/static/images/header/SymmetrialX.svg";

import { useIsMobile } from "lib/hooks/useWindowSize";

import { ExternalLink } from "components/Link";
import { RowCenter } from "components/Row";
import { APP_URL } from "constants/chains/misc";
import { NavBarLogo } from "components/Icons";

const Wrapper = styled(RowCenter)`
  width: fit-content;
  align-items: flex-end;

  &:hover {
    cursor: pointer;
  }

  & > div {
    &:first-child {
      margin-right: 10px;
    }
  }
`;

const SymmetrialText = styled.div`
  gap: 4px;
  font-size: 12px;
  font-weight: 400;
  margin: 0px 4px 4px 4px;
  color: ${({ theme }) => theme.text0};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 10px;
  `};
`;

export default function NavLogo() {
  const mobileVersion = useIsMobile();
  return (
    <div>
      <Wrapper>
        <ExternalLink href={APP_URL} target="_self" passHref>
          <NavBarLogo
            width={mobileVersion ? 84 : undefined}
            height={mobileVersion ? 18 : undefined}
          />
        </ExternalLink>
        <ExternalLink href="https://www.symm.io/">
          <SymmetrialText>
            Powered by SYMMIO{" "}
            <Image
              src={SYMMETRIAL_ICON}
              width={"16"}
              height={"12"}
              alt="Symmetrial Logo"
            />
          </SymmetrialText>
        </ExternalLink>
      </Wrapper>
    </div>
  );
}
