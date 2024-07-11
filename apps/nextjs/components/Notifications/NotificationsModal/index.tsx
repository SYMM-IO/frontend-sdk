import React, { useMemo } from "react";
import styled, { useTheme } from "styled-components";
import { Z_INDEX } from "theme";

import { NotificationDetails } from "@symmio/frontend-sdk/state/notifications/types";
import {
  useReadNotifications,
  useUnreadNotifications,
} from "@symmio/frontend-sdk/state/notifications/hooks";

import Column, { ColumnCenter } from "components/Column";
import { Card } from "components/Card";
import { Bell } from "components/Icons";
import { Modal } from "components/Modal";
import { RowCenter } from "components/Row";
import NotificationCardsItems from "components/Notifications/Cards/index";
import OldNotificationsDropdown from "./OldNotificationsDropdown";

const ModalWrapper = styled(Card)`
  padding: 0.6rem;
  border: none;
  background: ${({ theme }) => theme.bg3};

  & > * {
    &:last-child {
      overflow-y: scroll;
      overflow-x: hidden;
      width: 100%;
      min-height: 100%;
      max-height: 400px;
    }
  }
`;

const InlineModal = styled(Card)<{
  isOpen: boolean;
  height?: string;
}>`
  padding: 10px;
  width: 404px;
  max-height: ${({ height }) => height ?? "554px"};
  display: ${(props) => (props.isOpen ? "flex" : "none")};
  position: absolute;
  z-index: ${Z_INDEX.modal};
  transform: translate(-364px, 10px);
  background: ${({ theme }) => theme.bg3};
  border: 2px solid ${({ theme }) => theme.bg6};

  & > * {
    &:last-child {
      overflow-y: scroll;
      overflow-x: hidden;
      width: 100%;
    }
  }
`;

const EmptyRow = styled(ColumnCenter)`
  font-size: 14px;
  margin-bottom: 70px;
  font-weight: 400;
  color: ${({ theme }) => theme.text1};
  background: ${({ theme }) => theme.bg3};
`;

const InfoBox = styled(RowCenter)`
  font-weight: 500;
  font-size: 12px;
  height: 30px;
  border-radius: 4px;
  color: ${({ theme }) => theme.text0};
  background: ${({ theme }) => theme.bg4};
`;

const Title = styled.div`
  height: 40px;
  font-size: 16px;
  font-weight: 400;
  margin-top: 8px;
  height: 40px;
  color: ${({ theme }) => theme.text0};
`;

export function newNotificationsFirst(
  a: NotificationDetails,
  b: NotificationDetails
) {
  return Number(b.modifyTime) - Number(a.modifyTime);
}

export default function NotificationsModal({
  isModal,
  isOpen,
  onDismiss,
}: {
  isModal?: boolean;
  isOpen: boolean;
  onDismiss: () => void;
}) {
  const theme = useTheme();

  const unreadNotifications = [...useUnreadNotifications()];
  const readNotifications = [...useReadNotifications()];
  const emptyNotification = useMemo(
    () => unreadNotifications.length === 0 && readNotifications.length === 0,
    [readNotifications.length, unreadNotifications.length]
  );

  function getInnerContent() {
    return (
      <>
        <Title>Notifications</Title>
        {emptyNotification ? (
          <EmptyRow>
            <Bell
              width={48}
              height={50}
              color={theme.bg5}
              style={{ margin: "10px auto 20px auto" }}
            />
            you have no notifications!
          </EmptyRow>
        ) : (
          <Column style={{ gap: "10px" }}>
            {unreadNotifications.length > 0 && (
              <Column style={{ gap: "10px" }}>
                <InfoBox>
                  {unreadNotifications.length} New Notifications
                </InfoBox>
                {unreadNotifications
                  .sort(newNotificationsFirst)
                  .map((notification, index) => {
                    return (
                      <NotificationCardsItems
                        notification={notification}
                        key={index}
                      />
                    );
                  })}
              </Column>
            )}
            {readNotifications.length > 0 && (
              <OldNotificationsDropdown
                newNotifications={!unreadNotifications.length}
              />
            )}
          </Column>
        )}
      </>
    );
  }

  return isModal ? (
    <Modal
      isOpen={isOpen}
      onBackgroundClick={onDismiss}
      onEscapeKeydown={onDismiss}
    >
      <ModalWrapper>{getInnerContent()}</ModalWrapper>
    </Modal>
  ) : (
    <InlineModal
      isOpen={isOpen}
      height={emptyNotification ? "288px" : undefined}
    >
      {getInnerContent()}
    </InlineModal>
  );
}
