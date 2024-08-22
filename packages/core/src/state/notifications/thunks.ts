import * as toolkitRaw from "@reduxjs/toolkit/dist/redux-toolkit.cjs.production.min.js";
const { createAsyncThunk } = ((toolkitRaw as any).default ??
  toolkitRaw) as typeof toolkitRaw;
import { makeHttpRequest } from "../../utils/http";
import {
  NotificationResponse,
  NotificationDetails,
  NotificationUrlResponseType,
} from "./types";
import { groupingNotification, toNotification } from "./updater";

export const getNotifications = createAsyncThunk(
  "notification/getNotifications",
  async ({
    baseUrl,
    account,
    appName,
    createTimestamp,
    modifyTimestamp,
    start = 0,
    size = 10,
    quoteId,
  }: {
    baseUrl: string | undefined;
    account: string;
    appName: string;

    createTimestamp?: number;
    modifyTimestamp?: number;
    start?: number;
    size?: number;
    quoteId?: string;
  }) => {
    if (!baseUrl) {
      throw new Error("baseUrl is empty");
    }

    const body = JSON.stringify({
      address: `${account}`,
      modify_time_gte: modifyTimestamp,
      create_time_gte: createTimestamp,
      quote_id: quoteId,
    });

    const { href: getNotificationsUrl } = new URL(
      `position-state/${start}/${size}`,
      baseUrl
    );
    let unreadNotifications: NotificationDetails[] = [];

    try {
      const [notificationsRes] = await Promise.allSettled([
        makeHttpRequest<NotificationUrlResponseType>(getNotificationsUrl, {
          method: "POST",
          headers: [
            ["Content-Type", "application/json"],
            ["App-Name", appName],
          ],
          body,
        }),
      ]);

      if (notificationsRes.status === "fulfilled" && notificationsRes.value) {
        unreadNotifications = notificationsRes.value.position_state.map(
          (n: NotificationResponse) => {
            const notification: NotificationDetails = groupingNotification(
              toNotification(n)
            );
            return notification;
          }
        );
      }
    } catch (error) {
      console.error(error, "happened in getNotifications");
      return { unreadNotifications: [] };
    }
    return { unreadNotifications };
  }
);
