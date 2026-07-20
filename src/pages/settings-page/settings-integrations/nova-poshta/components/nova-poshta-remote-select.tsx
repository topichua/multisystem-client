import { Select } from "antd";

import { SelectNotFoundContent } from "./select-not-found-content";

type NovaPoshtaRemoteSelectProps<TOption extends { value: string }> = {
  disabled?: boolean;
  failed: boolean;
  id?: string;
  loading: boolean;
  minSearchLength: number;
  options: TOption[];
  placeholder: string;
  search: string;
  value?: string;
  onBlur?: () => void;
  onChange: (value: string, option?: TOption | TOption[]) => void;
  onSearch: (value: string) => void;
};

export function NovaPoshtaRemoteSelect<TOption extends { value: string }>({
  disabled = false,
  failed,
  id,
  loading,
  minSearchLength,
  options,
  placeholder,
  search,
  value,
  onBlur,
  onChange,
  onSearch,
}: NovaPoshtaRemoteSelectProps<TOption>) {
  return (
    <Select<string, TOption>
      disabled={disabled}
      id={id}
      loading={loading}
      options={options}
      placeholder={placeholder}
      value={value}
      showSearch={{
        filterOption: false,
        searchValue: search,
        onSearch,
      }}
      notFoundContent={
        <SelectNotFoundContent
          failed={failed}
          loading={loading}
          minSearchLength={minSearchLength}
        />
      }
      onBlur={onBlur}
      onChange={onChange}
    />
  );
}
