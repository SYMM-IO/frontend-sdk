import React, { useState, useRef } from "react";
import styled from "styled-components";
import Link from "next/link";
import { useRouter } from "next/router";

import { Z_INDEX } from "theme";
import useOnOutsideClick from "lib/hooks/useOnOutsideClick";

import {
  Client,
  MarketPair,
  NavToggle,
  Settings,
  Trade,
} from "components/Icons";
import { Card } from "components/Card";
import { RowBetween, RowEnd } from "components/Row";
import { NavButton } from "components/Button";
import { ApplicationModal } from "@symmio/frontend-sdk/state/application/reducer";
import {
  useAdvancedSettingModalToggle,
  useModalOpen,
} from "@symmio/frontend-sdk/state/application/hooks";
import SettingsModal from "components/ReviewModal/SettingsModal";

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
  padding: 11px 11px 11px 0px;
  margin-top: 10px;
  border: 1px solid ${({ theme }) => theme.bg7};
  background: ${({ theme }) => theme.bg5};
  border-radius: 4px;
  & > * {
  }
`;

const Row = styled(RowBetween)<{ active?: boolean }>`
  width: unset;
  height: 40px;
  margin-left: 11px;
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

const SettingsRow = styled(Row)`
  font-size: 18px;
  width: 100%;
  margin: unset;

  position: absolute;
  bottom: 0px;
  padding: 10px 10px 10px 0px;
  border-top-color: ${({ theme }) => theme.text0};
  border-top-width: 2px;
  border-top-style: solid;

  &:hover {
    cursor: pointer;
    background: ${({ theme }) => theme.bg2};
  }
`;

const Button = styled(NavButton)`
  padding: 0px 8px;
`;

const Label = styled.div<{ margin?: string }>`
  font-size: 16px;
  color: ${({ theme }) => theme.white};
  margin: ${({ margin }) => margin};
`;

export default function Menu() {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const showAdvancedSettingsModal = useModalOpen(
    ApplicationModal.ADVANCED_SETTINGS
  );
  const toggleAdSettingsModal = useAdvancedSettingModalToggle();

  const toggle = () => setIsOpen((prev) => !prev);
  useOnOutsideClick(ref, () => setIsOpen(false));

  return (
    <Container ref={ref}>
      <Button onClick={() => toggle()}>
        <NavToggle width={24} height={10} />
      </Button>

      <div>
        <InlineModal isOpen={isOpen}>
          <Link href="/trade" passHref onClick={() => toggle()}>
            <Row active={router.route.includes("/trade")}>
              <div>Trade</div>
              <Trade size={20} />
            </Row>
          </Link>
          <Link href="/my-account" passHref onClick={() => toggle()}>
            <Row active={router.route.includes("/my-account")}>
              <div>My Account</div>
              <Client />
            </Row>
          </Link>
          <Link href="/markets" passHref onClick={() => toggle()}>
            <Row active={router.route.includes("/markets")}>
              <div>Markets</div>
              <MarketPair />
            </Row>
          </Link>

          <SettingsRow
            onClick={() => {
              toggleAdSettingsModal();
            }}
          >
            <Label margin={"0px 16px"}>Settings</Label>
            <Settings size={"24px"} />
          </SettingsRow>
        </InlineModal>
      </div>
      {showAdvancedSettingsModal && (
        <SettingsModal
          title={"Advanced Settings"}
          isOpen={true}
          toggleModal={toggleAdSettingsModal}
        />
      )}
    </Container>
  );
}
