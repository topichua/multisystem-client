import { Button, Input } from "antd";
import type { ChangeEvent, KeyboardEvent, MouseEvent } from "react";

import { CATEGORY_NAME_MAX_LENGTH } from "../products-categories.constants";
import * as S from "./products-categories-tree.styled";

type CategoryInlineFormRowProps = {
  value: string;
  loading: boolean;
  placeholder: string;
  submitLabel: string;
  cancelLabel: string;
  onChange: (value: string) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
};

export const CategoryInlineFormRow = ({
  value,
  loading,
  placeholder,
  submitLabel,
  cancelLabel,
  onChange,
  onSubmit,
  onCancel,
}: CategoryInlineFormRowProps) => {
  const stopTreeEvent = (
    event: KeyboardEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>,
  ) => {
    event.stopPropagation();
  };

  return (
    <S.CategoryInlineRow onClick={stopTreeEvent} onKeyDown={stopTreeEvent}>
      <Input
        autoFocus
        value={value}
        maxLength={CATEGORY_NAME_MAX_LENGTH}
        placeholder={placeholder}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(event.target.value)
        }
        onPressEnter={() => void onSubmit()}
      />

      <Button
        type="primary"
        loading={loading}
        disabled={value.trim().length === 0}
        onClick={() => void onSubmit()}
      >
        {submitLabel}
      </Button>

      <Button onClick={onCancel}>{cancelLabel}</Button>
    </S.CategoryInlineRow>
  );
};
