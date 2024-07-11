import { useCallback } from "react";
import find from "lodash/find.js";

import { useAppDispatch, useAppSelector } from "../declaration";
import { NotificationDetails } from "./types";
import {
  addReadNotification,
  addUnreadNotification,
  readOneNotification,
  updateIsNewNotification,
} from "./actions";

export function useUnreadNotifications(): NotificationDetails[] {
  const unreadNotification: NotificationDetails[] = useAppSelector(
    (state) => state.notifications.unreadNotification
  );
  return unreadNotification.filter((notification) => notification.showInModal);
}

export function useReadNotifications(): NotificationDetails[] {
  const readNotification: NotificationDetails[] = useAppSelector(
    (state) => state.notifications.readNotification
  );
  return readNotification.filter((notification) => notification.showInModal);
}

export function usePartialFillNotifications() {
  const readNotification: NotificationDetails[] = useAppSelector(
    (state) => state.notifications.readNotification
  );
  const unreadNotification: NotificationDetails[] = useAppSelector(
    (state) => state.notifications.unreadNotification
  );
  return [...readNotification, ...unreadNotification].filter(
    (notification) => !notification.showInModal
  );
}

export function useVisibleNotifications() {
  const readNotification: NotificationDetails[] = useAppSelector(
    (state) => state.notifications.readNotification
  );
  const unreadNotification: NotificationDetails[] = useAppSelector(
    (state) => state.notifications.unreadNotification
  );
  return [...readNotification, ...unreadNotification].filter(
    (notification) => notification.showInModal
  );
}

export function useLastUpdateTimestamp() {
  const lastUpdateTimestamp = useAppSelector(
    (state) => state.notifications.lastUpdateTimestamp
  );
  return lastUpdateTimestamp;
}

export function useNewNotification() {
  const isNewNotification = useAppSelector(
    (state) => state.notifications.isNewNotification
  );
  return isNewNotification;
}

export function useSetNewNotificationFlag() {
  const dispatch = useAppDispatch();
  return useCallback(() => {
    dispatch(updateIsNewNotification({ flag: true }));
    setTimeout(() => dispatch(updateIsNewNotification({ flag: false })), 1000);
  }, [dispatch]);
}

export function useNotificationAdderCallback(): (
  notification: NotificationDetails,
  readOrUnread: "read" | "unread"
) => void {
  const dispatch = useAppDispatch();
  return useCallback(
    (notification: NotificationDetails, readOrUnread: "read" | "unread") => {
      const { notificationType } = notification;
      if (!notificationType) return;
      if (readOrUnread === "read")
        dispatch(addReadNotification({ notification }));
      else dispatch(addUnreadNotification({ notification }));
    },
    [dispatch]
  );
}

export function useMarkAsReadNotificationCallback(): (
  notification: NotificationDetails
) => void {
  const dispatch = useAppDispatch();
  const readNotifications = useReadNotifications();
  return useCallback(
    (notification: NotificationDetails) => {
      const { quoteId, notificationType } = notification;
      const existedNotification = find(readNotifications, {
        quoteId,
        notificationType,
      });
      if (!quoteId) return;
      if (existedNotification) {
        return;
      }
      dispatch(readOneNotification({ notification }));
    },
    [dispatch, readNotifications]
  );
}

export function useMarkAsReadAllNotificationsCallback(): () => void {
  const dispatch = useAppDispatch();
  const unReadNotifications = useUnreadNotifications();

  return useCallback(() => {
    unReadNotifications.map((notification) => {
      return dispatch(readOneNotification({ notification }));
    });
  }, [dispatch, unReadNotifications]);
}
