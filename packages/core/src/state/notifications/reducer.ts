import * as toolkitRaw from "@reduxjs/toolkit/dist/redux-toolkit.cjs.production.min.js";
const { createReducer } = ((toolkitRaw as any).default ??
  toolkitRaw) as typeof toolkitRaw;
import find from "lodash/find.js";
import remove from "lodash/remove.js";

import {
  addReadNotification,
  addUnreadNotification,
  setReadNotifications,
  setUnreadNotifications,
  readOneNotification,
  updateTimestamp,
  updateIsNewNotification,
} from "./actions";
import { NotificationDetails, NotificationType } from "./types";
import { getNotifications } from "./thunks";
import { ApiState } from "../../types/api";

export interface NotificationState {
  unreadNotification: NotificationDetails[];
  readNotification: NotificationDetails[];
  notificationsStatus: ApiState;
  lastUpdateTimestamp: string;
  isNewNotification: boolean;
}

export const initialState: NotificationState = {
  unreadNotification: [],
  readNotification: [],
  notificationsStatus: ApiState.LOADING,
  lastUpdateTimestamp: "",
  isNewNotification: false,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(addUnreadNotification, (state, { payload: { notification } }) => {
      const { readNotification, unreadNotification } = state;
      const { quoteId, notificationType, actionStatus } = notification;
      const existedNotification = find(unreadNotification, {
        quoteId,
        notificationType,
        actionStatus,
      });
      const readExistedNotification = find(readNotification, {
        quoteId,
        notificationType,
        actionStatus,
      });

      if (
        existedNotification &&
        notificationType !== NotificationType.TRANSFER_COLLATERAL
      ) {
        remove(unreadNotification, {
          quoteId,
          notificationType,
          actionStatus,
        });
      }
      if (
        readExistedNotification &&
        notificationType !== NotificationType.TRANSFER_COLLATERAL
      ) {
        remove(readNotification, {
          quoteId,
          notificationType,
          actionStatus,
        });
      }
      unreadNotification.push(notification);
      state.unreadNotification = unreadNotification;
      state.readNotification = readNotification;
    })
    .addCase(addReadNotification, (state, { payload: { notification } }) => {
      const { readNotification } = state;
      const { quoteId, notificationType } = notification;
      const existedNotification = find(readNotification, {
        quoteId,
        notificationType,
      });
      if (existedNotification) {
        remove(readNotification, { quoteId, notificationType });
      }

      readNotification.push(notification);
      state.readNotification = readNotification;
    })
    .addCase(
      setUnreadNotifications,
      (state, { payload: { notifications } }) => {
        state.unreadNotification = notifications;
      }
    )
    .addCase(setReadNotifications, (state, { payload: { notifications } }) => {
      state.readNotification = notifications;
    })
    .addCase(readOneNotification, (state, { payload: { notification } }) => {
      const { unreadNotification, readNotification } = state;
      const { quoteId, notificationType } = notification;
      const existedNotification = find(unreadNotification, {
        quoteId,
        notificationType,
      });
      const readExistedNotification = find(readNotification, {
        quoteId,
        notificationType,
      });
      if (
        !existedNotification &&
        notificationType !== NotificationType.TRANSFER_COLLATERAL
      ) {
        return;
      }
      if (
        readExistedNotification &&
        notificationType !== NotificationType.TRANSFER_COLLATERAL
      ) {
        remove(readNotification, { quoteId, notificationType });
        state.readNotification = readNotification;
      }

      remove(unreadNotification, { quoteId, notificationType });
      state.unreadNotification = unreadNotification;
      state.readNotification.push(notification);
    })

    .addCase(getNotifications.pending, (state) => {
      state.notificationsStatus = ApiState.LOADING;
    })
    .addCase(
      getNotifications.fulfilled,
      (state, { payload: { unreadNotifications } }) => {
        state.unreadNotification = unreadNotifications;
        state.notificationsStatus = ApiState.OK;
      }
    )
    .addCase(getNotifications.rejected, (state) => {
      state.notificationsStatus = ApiState.ERROR;
      console.error("Unable to getNotifications");
    })
    .addCase(updateTimestamp, (state, { payload }) => {
      state.lastUpdateTimestamp = payload.timestamp;
    })
    .addCase(updateIsNewNotification, (state, { payload: { flag } }) => {
      state.isNewNotification = flag;
    })
);
