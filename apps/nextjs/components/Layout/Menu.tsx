import React, { useState, useRef } from "react";
import styled from "styled-components";
import Link from "next/link";
import { useRouter } from "next/router";

import { Z_INDEX } from "theme";
import useOnOutsideClick from "lib/hooks/useOnOutsideClick";

import { Client, MarketPair, NavToggle, Trade } from "components/Icons";
import { Card } from "components/Card";
import { RowBetween, RowEnd } from "components/Row";
import { NavButton } from "components/Button";
// import { ExternalLink } from 'components/Link'

const Container = styled(RowEnd)`
  overflow: hidden;
  flex-flow: row nowrap;
  width: unset;
  height: 40px;
`;

const InlineModal = styled(Card)<{ isOpen: boolean }>`
  display: ${(props) => (props.isOpen ? "flex" : "none")};
  position: absolute;
  width: 216px;
  height: 256px;
  transform: translateX(-215px) translateY(20px);
  z-index: ${Z_INDEX.modal};
  gap: 8px;
  padding: 11px;
  margin-top: 10px;
  border: 1px solid ${({ theme }) => theme.bg7};
  background: ${({ theme }) => theme.bg5};
  border-radius: 4px;
`;

const Row = styled(RowBetween)<{ active?: boolean }>`
  width: unset;
  height: 40px;
  color: ${({ theme }) => theme.text0};
  &:hover {
    cursor: pointer;
    color: ${({ theme }) => theme.text1};
  }

  ${({ active, theme }) =>
    active &&
    ` color: ${theme.primaryBlue};
      pointer-events: none;
  `};
`;

const Button = styled(NavButton)`
  padding: 0px 8px;
`;

// const Separator = styled.div`
//   width: 225px;
//   margin-left: -13px;
//   height: 1px;
//   background: ${({ theme }) => theme.bg3};
// `

// const ExternalLinkIcon = styled(LinkIcon)`
//   margin-left: 4px;
//   path {
//     fill: ${({ theme }) => theme.text2};
//   }
// `
// const ExternalItem = styled(RowStart)`
//   &:hover {
//     svg {
//       path {
//         fill: ${({ theme }) => theme.white};
//       }
//     }
//   }
// `

export default function Menu() {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const toggle = () => setIsOpen((prev) => !prev);
  useOnOutsideClick(ref, () => setIsOpen(false));

  return (
    <Container ref={ref}>
      <Button onClick={() => toggle()}>
        <NavToggle width={24} height={10} />
      </Button>
      {/* <Image src={BURGER_ICON} alt="burger-icon" onClick={() => toggle()} /> */}
      <div>
        <InlineModal isOpen={isOpen} onClick={() => toggle()}>
          <Link href="/trade" passHref>
            <Row active={router.route.includes("/trade")}>
              <div>Trade</div>
              <Trade size={20} />
            </Row>
          </Link>
          <Link href="/my-account" passHref>
            <Row active={router.route.includes("/my-account")}>
              <div>My Account</div>
              <Client />
            </Row>
          </Link>
          <Link href="/markets" passHref>
            <Row active={router.route.includes("/markets")}>
              <div>Markets</div>
              <MarketPair />
            </Row>
          </Link>
        </InlineModal>
      </div>
    </Container>
  );
}
