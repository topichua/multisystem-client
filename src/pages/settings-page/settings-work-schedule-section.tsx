import { Button, Checkbox, Flex, Form, Spin, Typography, theme } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import {
  WORK_WEEKDAYS,
  type WorkDayHours,
  type WorkWeekday,
  type WorkspaceWorkSchedule,
} from "@/features/workspace-settings/model/workspace-settings.types";
import { useWorkspaceSettingsStore } from "@/features/workspace-settings/model/use-workspace-settings-store";
import { useNotification } from "@/shared/components/notification/use-notification";

import { SettingsSectionHeader } from "./components/settings-section-header";
import * as MobileS from "./mobile-settings-page.styled";
import { WorkTimePicker } from "./work-time-picker";

const { Text } = Typography;

type SettingsWorkScheduleSectionProps = {
  layout?: "desktop" | "mobile";
};

function orderedWorkDays(days: readonly WorkWeekday[]): WorkWeekday[] {
  return WORK_WEEKDAYS.filter((day) => days.includes(day));
}

function areSchedulesEqual(
  left: WorkspaceWorkSchedule,
  right: WorkspaceWorkSchedule,
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export const SettingsWorkScheduleSection = observer(
  ({ layout = "desktop" }: SettingsWorkScheduleSectionProps) => {
    const { t } = useTranslation();
    const { token } = theme.useToken();
    const workspaceSettingsStore = useWorkspaceSettingsStore();
    const notification = useNotification();
    const isMobile = layout === "mobile";
    const schedule = workspaceSettingsStore.workSchedule;

    useEffect(() => {
      if (
        !workspaceSettingsStore.initialized &&
        !workspaceSettingsStore.loadLoading
      ) {
        void workspaceSettingsStore.loadSettings();
      }
    }, [workspaceSettingsStore]);

    const isSettingsReady =
      schedule != null && workspaceSettingsStore.currency != null;
    const isLoading = workspaceSettingsStore.loadLoading && schedule == null;
    const isDisabled = workspaceSettingsStore.loadLoading || !isSettingsReady;

    const saveSchedule = useCallback(
      async (next: WorkspaceWorkSchedule) => {
        if (!schedule || areSchedulesEqual(schedule, next)) {
          return;
        }

        try {
          await workspaceSettingsStore.updateWorkSchedule(next);
        } catch (e) {
          notification.error({
            title: getApiErrorMessage(e, t("system.workSchedule.saveError")),
          });
        }
      },
      [notification, schedule, t, workspaceSettingsStore],
    );

    const handleDayBoundChange = useCallback(
      (field: "dayStart" | "dayEnd", value: string) => {
        if (!schedule) {
          return;
        }

        void saveSchedule({ ...schedule, [field]: value });
      },
      [saveSchedule, schedule],
    );

    const handleToggleDay = useCallback(
      (day: WorkWeekday) => {
        if (!schedule) {
          return;
        }

        const isSelected = schedule.workDays.includes(day);
        const workDays = isSelected
          ? schedule.workDays.filter((item) => item !== day)
          : orderedWorkDays([...schedule.workDays, day]);
        const dayHours = { ...schedule.dayHours };

        if (isSelected) {
          delete dayHours[day];
        } else if (schedule.differentHoursPerDay) {
          dayHours[day] = dayHours[day] ?? {
            start: schedule.dayStart,
            end: schedule.dayEnd,
          };
        }

        void saveSchedule({ ...schedule, workDays, dayHours });
      },
      [saveSchedule, schedule],
    );

    const handleDifferentHoursChange = useCallback(
      (checked: boolean) => {
        if (!schedule) {
          return;
        }

        const dayHours = { ...schedule.dayHours };

        if (checked) {
          for (const day of schedule.workDays) {
            dayHours[day] = dayHours[day] ?? {
              start: schedule.dayStart,
              end: schedule.dayEnd,
            };
          }
        }

        void saveSchedule({
          ...schedule,
          differentHoursPerDay: checked,
          dayHours,
        });
      },
      [saveSchedule, schedule],
    );

    const handleDayHoursChange = useCallback(
      (day: WorkWeekday, field: keyof WorkDayHours, value: string) => {
        if (!schedule) {
          return;
        }

        const currentHours = schedule.dayHours[day] ?? {
          start: schedule.dayStart,
          end: schedule.dayEnd,
        };

        void saveSchedule({
          ...schedule,
          dayHours: {
            ...schedule.dayHours,
            [day]: {
              ...currentHours,
              [field]: value,
            },
          },
        });
      },
      [saveSchedule, schedule],
    );

    const form = schedule ? (
      <Form layout="vertical" colon={false} disabled={isDisabled}>
        <Flex gap={12} vertical={isMobile}>
          <Form.Item
            label={t("system.workSchedule.dayStart")}
            style={{ flex: 1, marginBottom: isMobile ? 12 : 16 }}
          >
            <WorkTimePicker
              value={schedule.dayStart}
              disabled={isDisabled}
              dataQa="settings-work-schedule-day-start"
              onChange={(value) => handleDayBoundChange("dayStart", value)}
            />
          </Form.Item>
          <Form.Item
            label={t("system.workSchedule.dayEnd")}
            style={{ flex: 1, marginBottom: isMobile ? 12 : 16 }}
          >
            <WorkTimePicker
              value={schedule.dayEnd}
              disabled={isDisabled}
              dataQa="settings-work-schedule-day-end"
              onChange={(value) => handleDayBoundChange("dayEnd", value)}
            />
          </Form.Item>
        </Flex>

        <Form.Item
          label={t("system.workSchedule.workDays")}
          extra={t("system.workSchedule.workDaysHint")}
          style={{ marginBottom: 16 }}
        >
          <Flex gap={8} wrap={isMobile ? "wrap" : false}>
            {WORK_WEEKDAYS.map((day) => {
              const selected = schedule.workDays.includes(day);

              return (
                <Button
                  key={day}
                  type={selected ? "primary" : "default"}
                  disabled={isDisabled}
                  aria-pressed={selected}
                  data-qa={`settings-work-schedule-work-day-${day}`}
                  style={isMobile ? { flex: "1 1 0", minWidth: 40 } : undefined}
                  onClick={() => handleToggleDay(day)}
                >
                  {t(`system.workSchedule.weekdays.${day}`)}
                </Button>
              );
            })}
          </Flex>
        </Form.Item>

        <Form.Item
          style={{ marginBottom: schedule.differentHoursPerDay ? 16 : 0 }}
        >
          <Flex
            align="center"
            style={{
              width: "100%",
              minHeight: 48,
              padding: "12px 16px",
              border: `1px solid ${
                schedule.differentHoursPerDay
                  ? token.colorPrimary
                  : token.colorBorder
              }`,
              borderRadius: token.borderRadiusLG,
            }}
          >
            <Checkbox
              checked={schedule.differentHoursPerDay}
              disabled={isDisabled}
              data-qa="settings-work-schedule-different-hours"
              onChange={(event) => {
                handleDifferentHoursChange(event.target.checked);
              }}
            >
              {t("system.workSchedule.differentHours")}
            </Checkbox>
          </Flex>
        </Form.Item>

        {schedule.differentHoursPerDay ? (
          <Flex
            vertical
            gap={12}
            style={{
              padding: 16,
              borderRadius: token.borderRadiusLG,
              background: token.colorFillAlter,
            }}
          >
            {orderedWorkDays(schedule.workDays).map((day) => {
              const hours = schedule.dayHours[day] ?? {
                start: schedule.dayStart,
                end: schedule.dayEnd,
              };

              return (
                <Flex key={day} align="center" gap={12}>
                  <Text style={{ width: 28, flexShrink: 0 }}>
                    {t(`system.workSchedule.weekdays.${day}`)}
                  </Text>
                  <WorkTimePicker
                    value={hours.start}
                    disabled={isDisabled}
                    dataQa={`settings-work-schedule-day-hours-${day}-start`}
                    onChange={(value) =>
                      handleDayHoursChange(day, "start", value)
                    }
                  />
                  <Text type="secondary">—</Text>
                  <WorkTimePicker
                    value={hours.end}
                    disabled={isDisabled}
                    dataQa={`settings-work-schedule-day-hours-${day}-end`}
                    onChange={(value) =>
                      handleDayHoursChange(day, "end", value)
                    }
                  />
                </Flex>
              );
            })}
          </Flex>
        ) : null}
      </Form>
    ) : null;

    if (isMobile) {
      return (
        <Spin spinning={isLoading}>
          <MobileS.SectionGroup data-qa="settings-work-schedule-section">
            <MobileS.SectionTitle>
              {t("system.workSchedule.sectionTitle")}
            </MobileS.SectionTitle>
            <MobileS.PreferenceBlock>
              <MobileS.PreferenceLabel>
                {t("system.workSchedule.title")}
              </MobileS.PreferenceLabel>
              <Text type="secondary">
                {t("system.workSchedule.description")}
              </Text>
              {form}
            </MobileS.PreferenceBlock>
          </MobileS.SectionGroup>
        </Spin>
      );
    }

    return (
      <Spin spinning={isLoading}>
        <div data-qa="settings-work-schedule-section">
          <SettingsSectionHeader
            title={t("system.workSchedule.title")}
            description={t("system.workSchedule.description")}
          />
          {form}
        </div>
      </Spin>
    );
  },
);
