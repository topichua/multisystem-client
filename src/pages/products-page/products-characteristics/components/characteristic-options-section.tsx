import { PencilSimpleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import {
  Badge,
  Button,
  Divider,
  Empty,
  Flex,
  Input,
  Popconfirm,
  Space,
  Typography,
} from "antd";
import { useTranslation } from "react-i18next";

import type { CharacteristicOption } from "@/features/characteristics/model/characteristic.types";

import { CHARACTERISTIC_OPTION_VALUE_MAX_LENGTH } from "../products-characteristics.constants";
import * as S from "../product-characteristic-detail-view.styled";

const { Title, Text } = Typography;

type CharacteristicValueFormRowProps = {
  value: string;
  placeholder?: string;
  submitLabel: string;
  cancelLabel: string;
  loading: boolean;
  onChange: (value: string) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
};

const CharacteristicValueFormRow = ({
  value,
  placeholder,
  submitLabel,
  cancelLabel,
  loading,
  onChange,
  onSubmit,
  onCancel,
}: CharacteristicValueFormRowProps) => (
  <S.CharacteristicValueFormRow>
    <Input
      autoFocus
      value={value}
      placeholder={placeholder}
      maxLength={CHARACTERISTIC_OPTION_VALUE_MAX_LENGTH}
      onChange={(event) => onChange(event.target.value)}
      onPressEnter={() => void onSubmit()}
    />
    <Button type="primary" loading={loading} onClick={() => void onSubmit()}>
      {submitLabel}
    </Button>
    <Button onClick={onCancel}>{cancelLabel}</Button>
  </S.CharacteristicValueFormRow>
);

type CharacteristicOptionCreateState = {
  isAdding: boolean;
  value: string;
  onChange: (value: string) => void;
  onOpen: () => void;
  onCancel: () => void;
  onCreate: () => Promise<void>;
};

type CharacteristicOptionRenameState = {
  optionId: number | null;
  value: string;
  onChange: (value: string) => void;
  onOpen: (optionId: number, value: string) => void;
  onCancel: () => void;
  onSave: (optionId: number) => Promise<void>;
};

type CharacteristicOptionsSectionProps = {
  options: CharacteristicOption[];
  create: CharacteristicOptionCreateState;
  rename: CharacteristicOptionRenameState;
  saveLoading: boolean;
  optionDeleteLoadingId: number | null;
  onDeleteOption: (optionId: number) => Promise<void>;
};

export const CharacteristicOptionsSection = ({
  options,
  create,
  rename,
  saveLoading,
  optionDeleteLoadingId,
  onDeleteOption,
}: CharacteristicOptionsSectionProps) => {
  const { t } = useTranslation();
  const optionsCount = options.length;

  return (
    <>
      <Flex justify="space-between" align="center" gap={16} wrap="wrap">
        <Space size={8} align="center">
          <Title level={5} style={{ margin: 0 }}>
            {t("characteristics.values")}
          </Title>
          <Badge
            count={optionsCount}
            color="rgba(0, 0, 0, 0.06)"
            style={{ color: "rgba(0, 0, 0, 0.65)" }}
            showZero
          />
        </Space>

        {!create.isAdding ? (
          <Button icon={<PlusIcon />} onClick={create.onOpen}>
            {t("characteristics.addValue")}
          </Button>
        ) : null}
      </Flex>

      {create.isAdding ? (
        <CharacteristicValueFormRow
          value={create.value}
          placeholder={t("characteristics.valueNamePlaceholder")}
          submitLabel={t("characteristics.addValueSubmit")}
          cancelLabel={t("characteristics.addValueCancel")}
          loading={saveLoading}
          onChange={create.onChange}
          onSubmit={create.onCreate}
          onCancel={create.onCancel}
        />
      ) : null}

      {options.length > 0 ? (
        <Flex vertical>
          {options.map((option, index) => (
            <div key={option.optionId}>
              {index > 0 ? <Divider style={{ margin: 0 }} /> : null}
              <S.CharacteristicOptionRow>
                {rename.optionId === option.optionId ? (
                  <CharacteristicValueFormRow
                    value={rename.value}
                    submitLabel={t("characteristics.saveChanges")}
                    cancelLabel={t("characteristics.cancel")}
                    loading={saveLoading}
                    onChange={rename.onChange}
                    onSubmit={() => rename.onSave(option.optionId)}
                    onCancel={rename.onCancel}
                  />
                ) : (
                  <Flex
                    align="center"
                    justify="space-between"
                    gap={16}
                    style={{ width: "100%" }}
                  >
                    <Flex gap={2} vertical style={{ minWidth: 0 }}>
                      <Text strong ellipsis={{ tooltip: option.label }}>
                        {option.label}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {t("characteristics.optionUsage", {
                          productCount: option.productCount,
                          productVariantCount: option.productVariantCount,
                          defaultValue:
                            "{{productCount}} products · {{productVariantCount}} variants",
                        })}
                      </Text>
                    </Flex>

                    <Space size={4}>
                      <Button
                        type="text"
                        icon={<PencilSimpleIcon size={18} />}
                        aria-label={t("characteristics.renameValue")}
                        onClick={() =>
                          rename.onOpen(option.optionId, option.label)
                        }
                      />
                      <Popconfirm
                        title={t("characteristics.deleteValueConfirm")}
                        description={t("characteristics.deleteWarning")}
                        okText={t("characteristics.delete")}
                        okButtonProps={{ danger: true }}
                        onConfirm={() => void onDeleteOption(option.optionId)}
                      >
                        <Button
                          type="text"
                          danger
                          icon={<TrashIcon size={18} />}
                          loading={optionDeleteLoadingId === option.optionId}
                          aria-label={t("characteristics.deleteValue")}
                        />
                      </Popconfirm>
                    </Space>
                  </Flex>
                )}
              </S.CharacteristicOptionRow>
            </div>
          ))}
        </Flex>
      ) : null}

      {options.length === 0 && !create.isAdding ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("characteristics.noValues")}
        />
      ) : null}

      <Text type="secondary">{t("characteristics.deleteValueNote")}</Text>
    </>
  );
};
