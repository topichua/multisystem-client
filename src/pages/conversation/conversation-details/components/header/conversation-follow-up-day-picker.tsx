import { Button, Flex, Typography } from "antd";
import type { Dayjs } from "dayjs";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { getFollowUpDays } from "@/utils/date-time";

const { Text } = Typography;

type ConversationFollowUpDayPickerProps = {
  value?: string;
  anchor: Dayjs;
  onChange?: (value: string) => void;
};

export const ConversationFollowUpDayPicker = ({
  value,
  anchor,
  onChange,
}: ConversationFollowUpDayPickerProps) => {
  const { t } = useTranslation();
  const days = useMemo(() => getFollowUpDays(anchor), [anchor]);

  return (
    <Flex gap={8} style={{ overflowX: "auto" }}>
      {days.map((day) => {
        const selected = value === day.key;
        const weekdayLabel =
          day.offset === 0
            ? t("conversation.followUp.today")
            : day.offset === 1
              ? t("conversation.followUp.tomorrow")
              : day.date.format("dd");

        return (
          <Button
            key={day.key}
            htmlType="button"
            color={selected ? "primary" : "default"}
            variant={selected ? "filled" : "outlined"}
            aria-pressed={selected}
            data-qa={`layout-conversation-follow-up-day-${day.key}`}
            style={{
              flex: "1 0 56px",
              height: "auto",
              padding: "8px 4px",
            }}
            onClick={() => onChange?.(day.key)}
          >
            <Flex vertical align="center" gap={0}>
              <Text
                type={selected ? undefined : "secondary"}
                style={{
                  fontSize: 11,
                  lineHeight: 1.2,
                  textTransform: "uppercase",
                }}
              >
                {weekdayLabel}
              </Text>
              <Text strong style={{ fontSize: 16, lineHeight: 1.3 }}>
                {day.date.format("D")}
              </Text>
              <Text
                type={selected ? undefined : "secondary"}
                style={{ fontSize: 12, lineHeight: 1.2 }}
              >
                {day.date.format("MMM")}
              </Text>
            </Flex>
          </Button>
        );
      })}
    </Flex>
  );
};
