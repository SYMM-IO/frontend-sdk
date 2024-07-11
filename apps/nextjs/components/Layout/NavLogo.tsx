import React from "react";
import styled from "styled-components";

import { ExternalLink } from "components/Link";
import { RowCenter } from "components/Row";
import { APP_URL } from "constants/chains/misc";
import { CloverfieldLogo } from "components/Icons";
import { RowStart } from "components/Row";
import SYMMETRIAL_ICON from "/public/static/images/header/SymmetrialX.svg";
import Image from "next/legacy/image";

const Wrapper = styled(RowCenter)`
  width: fit-content;

  &:hover {
    cursor: pointer;
  }

  & > div {
    &:first-child {
      margin-right: 10px;
    }
  }
`;

const TextWrapper = styled(RowStart)`
  ${({ theme }) => theme.mediaWidth.upToMedium`
  flex-direction: column;
  align-items: flex-start;
`};
`;

const Text = styled.div`
  font-size: 24px;
  margin-left: 6px;
  font-weight: normal;
  background: ${({ theme }) => theme.gradLight};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 10px;
  `};
`;

const SymmetrialText = styled.div`
  gap: 4px;
  font-size: 12px;
  font-weight: 400;
  margin: 6px 4px 0px 4px;
  color: ${({ theme }) => theme.text0};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 10px;
  `};
`;

export default function NavLogo() {
  return (
    <div>
      <Wrapper>
        <ExternalLink href={APP_URL} target="_self" passHref>
          <CloverfieldLogo />
        </ExternalLink>

        <TextWrapper>
          <ExternalLink href={APP_URL} target="_self" passHref>
            <Text>Cloverfield</Text>
          </ExternalLink>

          <ExternalLink href="https://www.symm.io/">
            <SymmetrialText>
              Powered by SYMMIO{" "}
              <Image
                src={SYMMETRIAL_ICON}
                width={16}
                height={12}
                alt="Symmetrial Logo"
              />
            </SymmetrialText>
          </ExternalLink>
        </TextWrapper>
      </Wrapper>
    </div>
  );
}
