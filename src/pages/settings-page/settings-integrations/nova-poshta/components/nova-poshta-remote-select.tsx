import { Select } from "antd";

import { SelectNotFoundContent } from "./select-not-found-content";

type NovaPoshtaRemoteSelectProps<TOption extends { value: string }> = {
  disabled?: boolean;
  failed: boolean;
  loading: boolean;
  minSearchLength: number;
  options: TOption[];
  placeholder: string;
  search: string;
  onChange: (value: string, option?: TOption | TOption[]) => void;
  onSearch: (value: string) => void;
};

export function NovaPoshtaRemoteSelect<TOption extends { value: string }>({
  disabled = false,
  failed,
  loading,
  minSearchLength,
  options,
  placeholder,
  search,
  onChange,
  onSearch,
}: NovaPoshtaRemoteSelectProps<TOption>) {
  return (
    <Select<string, TOption>
      disabled={disabled}
      loading={loading}
      options={options}
      placeholder={placeholder}
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
      onChange={onChange}
    />
  );
}
