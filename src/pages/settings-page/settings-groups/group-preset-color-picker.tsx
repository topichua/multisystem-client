import { CheckIcon } from '@phosphor-icons/react';
import { Tooltip } from 'antd';
import { useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { GROUP_COLOR_PRESETS } from './group-color-presets';

const norm = (c: string) => c.trim().toLowerCase();

type GroupPresetColorPickerProps = {
  value?: string;
  onChange?: (color: string) => void;
};

export const GroupPresetColorPicker = ({ value, onChange }: GroupPresetColorPickerProps) => {
  const { t } = useTranslation();
  const presets = useMemo(() => {
    const base = [...GROUP_COLOR_PRESETS];
    if (value != null && value !== '' && !base.some((c) => norm(c) === norm(value))) {
      return [value, ...base];
    }
    return base;
  }, [value]);

  return (
    <div
      role="listbox"
      aria-label={t('groups.colorPickerAria')}
      style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}
    >
      {presets.map((hex) => {
        const selected = value != null && norm(value) === norm(hex);

        return (
          <Tooltip key={hex} title={hex}>
            <button
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => onChange?.(hex)}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                padding: 0,
                borderRadius: '50%',
                background: hex,
                border: '2px solid rgba(0, 0, 0, 0.12)',
                cursor: 'pointer',
                flexShrink: 0,
                boxSizing: 'border-box',
              }}
            >
              {selected ? (
                <CheckIcon
                  size={16}
                  weight="bold"
                  color="#ffffff"
                  style={{
                    flexShrink: 0,
                    filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.55))',
                  }}
                  aria-hidden
                />
              ) : null}
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
};
