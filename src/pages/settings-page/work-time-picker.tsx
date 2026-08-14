import { TimePicker } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

const TIME_FORMAT = "HH:mm";

function toDayjsTime(value: string): Dayjs | null {
  const [hours, minutes] = value.split(":").map(Number);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return dayjs().hour(hours).minute(minutes).second(0).millisecond(0);
}

function fromDayjsTime(value: Dayjs | null): string | null {
  if (!value?.isValid()) {
    return null;
  }

  return value.format(TIME_FORMAT);
}

type WorkTimePickerProps = {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  dataQa: string;
};

export function WorkTimePicker({
  value,
  disabled,
  onChange,
  dataQa,
}: WorkTimePickerProps) {
  return (
    <TimePicker
      value={toDayjsTime(value)}
      format={TIME_FORMAT}
      allowClear={false}
      needConfirm={false}
      showNow={false}
      disabled={disabled}
      data-qa={dataQa}
      style={{ width: "100%" }}
      onChange={(next) => {
        const formatted = fromDayjsTime(next);

        if (formatted) {
          onChange(formatted);
        }
      }}
    />
  );
}
