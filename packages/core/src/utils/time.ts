import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
import localizedFormat from "dayjs/plugin/localizedFormat.js";

dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

export function getRemainingTime(timeStamp: number): {
  diff: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const now = dayjs().utc();
  const endTime = dayjs.utc(timeStamp);
  const diff = endTime.diff(now);

  const day = endTime.diff(now, "day");
  const hours = dayjs.utc(diff).hour();
  const minutes = dayjs.utc(diff).minute();
  const seconds = dayjs.utc(diff).second();

  return { diff, day, hours, minutes, seconds };
}

export function formatTimestamp(timeLength: number, format?: string): string {
  return dayjs(timeLength).format(format ?? "YYYY /MMMM /DD - HH:mm");
}
