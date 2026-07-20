import { CheckIcon } from "@phosphor-icons/react";
import { Tooltip } from "antd";
import { useMemo } from "react";

import { COLOR_PRESETS } from "./color-presets";

const normalizeColor = (color: string): string => color.trim().toLowerCase();

export type PresetColorPickerProps = {
  value?: string | null;
  onChange?: (color: string) => void;
  presets?: readonly string[];
  ariaLabel: string;
  columns?: number;
};

export const PresetColorPicker = ({
  value,
  onChange,
  presets: presetValues = COLOR_PRESETS,
  ariaLabel,
  columns,
}: PresetColorPickerProps) => {
  const presets = useMemo(() => {
    const base = [...presetValues];

    if (
      value != null &&
      value !== "" &&
      !base.some((color) => normalizeColor(color) === normalizeColor(value))
    ) {
      return [value, ...base];
    }

    return base;
  }, [presetValues, value]);

  return (
    <div
      role="listbox"
      aria-label={ariaLabel}
      style={{
        display: columns != null ? "grid" : "flex",
        flexWrap: columns != null ? undefined : "wrap",
        gridTemplateColumns:
          columns != null ? `repeat(${columns}, 28px)` : undefined,
        gap: 10,
      }}
    >
      {presets.map((hex) => {
        const selected =
          value != null && normalizeColor(value) === normalizeColor(hex);

        return (
          <Tooltip key={hex} title={hex}>
            <button
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => onChange?.(hex)}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                padding: 0,
                borderRadius: "50%",
                background: hex,
                border: "2px solid rgba(0, 0, 0, 0.12)",
                cursor: "pointer",
                flexShrink: 0,
                boxSizing: "border-box",
              }}
            >
              {selected && (
                <CheckIcon
                  size={16}
                  weight="bold"
                  color="#ffffff"
                  style={{
                    flexShrink: 0,
                    filter: "drop-shadow(0 1px 1px rgba(0, 0, 0, 0.55))",
                  }}
                  aria-hidden
                />
              )}
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
};
