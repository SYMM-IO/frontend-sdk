import styled from "styled-components";

import { useActivePopups } from "@symmio/frontend-sdk/state/application/hooks";
import useWindowSize from "lib/hooks/useWindowSize";

import PopupItem from "./PopupItem";
import { MEDIA_WIDTHS, Z_INDEX } from "theme";
import { useEffect } from "react";
import { useNotificationAdderCallback } from "@symmio/frontend-sdk/state/notifications/hooks";
import {
  NotificationDetails,
  NotificationType,
} from "@symmio/frontend-sdk/state/notifications/types";
import { useActiveAccountAddress } from "@symmio/frontend-sdk/state/user/hooks";
import { PopupList } from "@symmio/frontend-sdk/state/application/reducer";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: fixed;
  height: auto;
  top: 75px;
  z-index: ${Z_INDEX.popover};
`;

const ContainerLarge = styled(Container)`
  top: 15px;
  right: 13px;
  width: 457px;
`;

const ContainerSmall = styled(Container)`
  margin-left: 50%;
  transform: translateX(-50%);
  width: 90vw;
`;

export default function Popups() {
  const activePopups = useActivePopups();
  useCreateNotificationFromTx(activePopups);
  const { width } = useWindowSize();

  return (
    <>
      {typeof width == "number" && width >= MEDIA_WIDTHS.upToExtraSmall ? (
        <ContainerLarge>
          {activePopups.map((item) => {
            return (
              <PopupItem
                key={item.key}
                content={item.content}
                popKey={item.key}
                removeAfterMs={item.removeAfterMs}
              />
            );
          })}
        </ContainerLarge>
      ) : (
        <ContainerSmall>
          {activePopups // reverse so new items up front
            .slice(0)
            .reverse()
            .map((item) => (
              <PopupItem
                key={item.key}
                content={item.content}
                popKey={item.key}
                removeAfterMs={item.removeAfterMs}
              />
            ))}
        </ContainerSmall>
      )}
    </>
  );
}

function useCreateNotificationFromTx(activePopups: PopupList) {
  const notificationAdder = useNotificationAdderCallback();
  const activeAccount = useActiveAccountAddress();

  useEffect(() => {
    activePopups.forEach((popup) => {
      if ("txn" in popup.content) {
        const info = popup.content.txn.info;
        if (info && "transferType" in info && popup.content.txn.success) {
          const currentTimestamp = Math.floor(Date.now() / 1000);

          notificationAdder(
            {
              quoteId: "0",
              notificationType: NotificationType.TRANSFER_COLLATERAL,
              showInModal: true,
              createTime: currentTimestamp.toString(),
              modifyTime: currentTimestamp.toString(),
              transferAmount: info.amount,
              transferType: info.transferType,
              counterpartyAddress: activeAccount,
            } as unknown as NotificationDetails,
            "unread"
          );
        }
      }
    });
  }, [activeAccount, activePopups, notificationAdder]);
}
