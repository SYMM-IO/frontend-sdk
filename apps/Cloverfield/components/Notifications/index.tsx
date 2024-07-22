import React, { useMemo, useRef, useState } from "react";
import styled, { useTheme } from "styled-components";
import { isMobile } from "react-device-detect";

import useOnOutsideClick from "lib/hooks/useOnOutsideClick";
import {
  useMarkAsReadAllNotificationsCallback,
  useUnreadNotifications,
} from "@symmio/frontend-sdk/state/notifications/hooks";

import { Bell } from "components/Icons";
import { NavButton } from "components/Button";
import NotificationsModal from "components/Notifications/NotificationsModal";

const Container = styled.div`
  display: unset;
  align-items: center;
  height: 100%;
`;

const NotificationsCount = styled.div`
  width: 20px;
  height: 20px;
  position: absolute;
  left: 27px;
  bottom: 3px;
  padding: 3px;
  border-radius: 10px;
  font-weight: 500;
  font-size: 10px;
  text-align: center;

  background: ${({ theme }) => theme.gradLight};
  border: 1px solid ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.primaryBlackNew};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 14px;
    height: 14px;
    left: 19px;
    bottom: 17px;
    font-size: 7px;
  `};
`;

export default function Notifications() {
  const theme = useTheme();
  const ref = useRef(null);
  useOnOutsideClick(ref, () => {
    if (!isMobile) setModalOpen(false);
    if (modalOpen) readAllNotifications();
  });
  const [modalOpen, setModalOpen] = useState(false);
  const readAllNotifications = useMarkAsReadAllNotificationsCallback();
  const unreadNotifications = [...useUnreadNotifications()];
  const newNotifications = useMemo(
    () => unreadNotifications.length !== 0,
    [unreadNotifications.length]
  );

  const closeOnClick = () => {
    if (modalOpen) readAllNotifications();
    setModalOpen(!modalOpen);
  };

  return (
    <div ref={ref}>
      <NavButton onClick={closeOnClick}>
        <Bell color={newNotifications ? theme.primaryBlue : undefined} />
        {newNotifications && (
          <NotificationsCount>{unreadNotifications.length}</NotificationsCount>
        )}
      </NavButton>
      <>
        {isMobile ? (
          <>
            <NotificationsModal
              isModal
              isOpen={modalOpen}
              onDismiss={() => setModalOpen(false)}
            />
          </>
        ) : (
          <Container>
            {modalOpen && (
              <div>
                <NotificationsModal
                  isOpen
                  onDismiss={() => setModalOpen(!modalOpen)}
                />
              </div>
            )}
          </Container>
        )}
      </>
    </div>
  );
}
