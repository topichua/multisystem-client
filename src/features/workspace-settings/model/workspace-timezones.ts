import ukTimeZoneCities from "./workspace-timezone-cities.uk.json";

export type WorkspaceTimeZoneOption = {
  value: string;
  label: string;
  searchText: string;
};

function getIanaTimeZones(): string[] {
  if (typeof Intl.supportedValuesOf !== "function") {
    return ["UTC"];
  }

  return Intl.supportedValuesOf("timeZone");
}

function isUserFacingTimeZone(timeZone: string): boolean {
  if (timeZone === "UTC" || timeZone === "Etc/UTC") {
    return true;
  }

  return !timeZone.startsWith("Etc/");
}

function isUkrainianLocale(locale: string): boolean {
  return locale.startsWith("uk") || locale.startsWith("ua");
}

function readTimeZoneName(
  timeZone: string,
  timeZoneName: NonNullable<Intl.DateTimeFormatOptions["timeZoneName"]>,
  date = new Date(),
): string {
  return (
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName,
    })
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName")?.value ?? ""
  );
}

function formatGmtOffset(timeZone: string, date = new Date()): string {
  const raw = readTimeZoneName(timeZone, "shortOffset", date);

  if (raw === "UTC" || raw === "GMT") {
    return "GMT +0";
  }

  const match = raw.match(/^(?:GMT|UTC)([+-])(\d{1,2})(?::(\d{2}))?$/i);

  if (!match) {
    return raw || "GMT";
  }

  const hours = Number(match[2]);
  const minutes = match[3] && match[3] !== "00" ? `:${Number(match[3])}` : "";

  return `GMT ${match[1]}${hours}${minutes}`;
}

function getTimeZoneOffsetMinutes(timeZone: string, date = new Date()): number {
  const offset = formatGmtOffset(timeZone, date);
  const match = offset.match(/^GMT ([+-])(\d{1,2})(?::(\d{2}))?$/i);

  if (!match) {
    return 0;
  }

  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? 0);

  return sign * (hours * 60 + minutes);
}

function getTimeZoneCityName(timeZone: string, locale: string): string {
  if (isUkrainianLocale(locale)) {
    const localized =
      ukTimeZoneCities[timeZone as keyof typeof ukTimeZoneCities];

    if (localized) {
      return localized;
    }
  }

  const city = timeZone.split("/").pop() ?? timeZone;
  return city.replaceAll("_", " ");
}

export function formatWorkspaceTimeZoneLabel(
  timeZone: string,
  locale: string,
): string {
  return `${getTimeZoneCityName(timeZone, locale)} (${formatGmtOffset(timeZone)})`;
}

export function getWorkspaceTimeZoneOptions(
  locale: string,
  extraTimeZone?: string | null,
): WorkspaceTimeZoneOption[] {
  const zones = new Set(getIanaTimeZones().filter(isUserFacingTimeZone));

  if (extraTimeZone) {
    zones.add(extraTimeZone);
  }

  const collatorLocale = isUkrainianLocale(locale) ? "uk" : "en";

  return [...zones]
    .map((value) => ({
      value,
      label: formatWorkspaceTimeZoneLabel(value, locale),
      offsetMinutes: getTimeZoneOffsetMinutes(value),
    }))
    .sort((a, b) => {
      if (a.offsetMinutes !== b.offsetMinutes) {
        return a.offsetMinutes - b.offsetMinutes;
      }

      return a.label.localeCompare(b.label, collatorLocale);
    })
    .map(({ value, label }) => ({
      value,
      label,
      searchText: `${label} ${value.replaceAll("_", " ")}`,
    }));
}
