// https://day.js.org/docs/en/plugin/loading-into-nodejs
// day.js config
import i18n from "@/i18n";
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import minMax from "dayjs/plugin/minMax";
import duration from "dayjs/plugin/duration";

export function initDayJs() {
  dayjs.extend(calendar);
  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.extend(localizedFormat);
  dayjs.extend(relativeTime, {
    rounding: Math.floor,
  });
  dayjs.extend(minMax);
  dayjs.extend(duration);
}

export const formatDateTime = (date: Date | string) => {
  const parsed = dayjs(date);

  return parsed.isValid() ? parsed.format("lll") : "";
};

export const formatDate = (date: Date | string) => {
  const parsed = dayjs(date);

  return parsed.isValid() ? parsed.format("ll") : "";
};

export const fromNow = (date: Date | string, skipSuffix?: boolean) =>
  dayjs(date).fromNow(skipSuffix);

export const formatRelativeTimeShort = (date: Date | string) => {
  const target = dayjs(date);

  if (!target.isValid()) {
    return "";
  }

  const now = dayjs();
  const [earlier, later] =
    target.isBefore(now) || target.isSame(now) ? [target, now] : [now, target];

  const years = later.diff(earlier, "year");
  const months = later.diff(earlier, "month");
  const days = later.diff(earlier, "day");
  const hours = later.diff(earlier, "hour");
  const minutes = later.diff(earlier, "minute");

  switch (true) {
    case years >= 1:
      return `${years}${i18n.t("time.shortYear")}`;

    case months >= 1:
      return `${months}${i18n.t("time.shortMonth")}`;

    case days >= 1:
      return `${days}${i18n.t("time.shortDay")}`;

    case hours >= 1:
      return `${hours}${i18n.t("time.shortHour")}`;

    case minutes >= 1:
      return `${minutes}${i18n.t("time.shortMinute")}`;

    default:
      return i18n.t("time.now");
  }
};

export const beforeNow = (date: Date | string) => dayjs(date).toNow(true);

export const getCalendarTime = (date: Date | string) =>
  dayjs(date).calendar(null, {
    sameDay: "[Today] h:mm A",
    nextDay: "[Tomorrow] h:mm A",
    nextWeek: "dddd h:mm A",
    lastDay: "[Yesterday] h:mm A",
    lastWeek: "dddd hh:mm A",
    sameElse: "lll",
  });

export const getShortCalendarTime = (date: Date | string) =>
  dayjs(date).calendar(null, {
    sameDay: "[Today] h:mm A",
    nextDay: "[Tomorrow] h:mm A",
    nextWeek: "ddd. h:mm A",
    lastDay: "[Yesterday] h:mm A",
    lastWeek: "ddd. h:mm A",
    sameElse: "MMM D h:mm A",
  });

export const fullDaysFromEndOfDay = (date: Date | string) =>
  dayjs().endOf("day").diff(date, "days");

export const passedTimeName = (time: string) => {
  const now = dayjs();
  let title;
  const timeN = dayjs(time).startOf("day");

  const daysFromNow = now.diff(timeN, "days");

  if (now.isSame(timeN, "d")) {
    title = "Today";
  } else if (daysFromNow <= 1) {
    title = "Yesterday";
  } else if (daysFromNow <= 7) {
    title = "Last 7 days";
  } else if (daysFromNow <= 30) {
    title = "Last 30 days";
  } else {
    title = "A while ago";
  }

  return title;
};
export const getEffectiveDate = (date: string | null) =>
  date ? dayjs(date).format("MMMM D") : "";

export function formatMessageTime(createdTime: string): string {
  const parsed = dayjs(createdTime);

  return parsed.isValid() ? parsed.format("HH:mm") : "";
}

export function isSameConversationDay(isoA: string, isoB: string): boolean {
  return dayjs(isoA).isSame(dayjs(isoB), "day");
}

export function formatConversationDayLabel(iso: string): string {
  const d = dayjs(iso);
  return d.isValid() ? d.format("LL") : "";
}
