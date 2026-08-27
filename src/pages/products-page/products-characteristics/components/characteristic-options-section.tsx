import {
  ArchiveIcon,
  ArrowClockwiseIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import {
  Badge,
  Button,
  Card,
  Empty,
  Flex,
  Input,
  List,
  Popconfirm,
  Space,
  Tag,
  Typography,
} from "antd";
import { useTranslation } from "react-i18next";

import type { CharacteristicOption } from "@/features/characteristics/model/characteristic.types";

import { CHARACTERISTIC_OPTION_VALUE_MAX_LENGTH } from "../products-characteristics.constants";

const { Text, Title } = Typography;

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

type CharacteristicOptionListItemProps = {
  option: CharacteristicOption;
  rename: CharacteristicOptionRenameState;
  saveLoading: boolean;
  archiveLoading: boolean;
  deleteLoading: boolean;
  onArchive: (optionId: number) => void;
  onUnarchive: (optionId: number) => Promise<void>;
  onDelete: (optionId: number) => Promise<void>;
};

type CharacteristicOptionsSectionProps = {
  options: CharacteristicOption[];
  create: CharacteristicOptionCreateState;
  rename: CharacteristicOptionRenameState;
  saveLoading: boolean;
  optionArchiveLoadingId: number | null;
  optionDeleteLoadingId: number | null;
  onArchiveOption: (optionId: number) => void;
  onUnarchiveOption: (optionId: number) => Promise<void>;
  onDeleteOption: (optionId: number) => Promise<void>;
  addOptionDataQa?: string;
  getOptionItemDataQa?: (optionId: number) => string;
};

export const CharacteristicOptionsSection = ({
  options,
  create,
  rename,
  saveLoading,
  optionArchiveLoadingId,
  optionDeleteLoadingId,
  onArchiveOption,
  onUnarchiveOption,
  onDeleteOption,
  addOptionDataQa,
  getOptionItemDataQa,
}: CharacteristicOptionsSectionProps) => {
  const { t } = useTranslation();

  const hasOptions = options.length > 0;
  const showEmptyState = !hasOptions && !create.isAdding;

  return (
    <Card>
      <Flex vertical gap={16}>
        <Flex justify="space-between" align="center" gap={16} wrap="wrap">
          <Space size={8} align="center">
            <Title level={5} style={{ margin: 0 }}>
              {t("characteristics.values")}
            </Title>

            <Badge count={options.length} showZero color="lightgray" />
          </Space>

          {!create.isAdding && (
            <Button
              icon={<PlusIcon />}
              data-qa={addOptionDataQa}
              aria-label={t("characteristics.mobile.addOptionAria")}
              onClick={create.onOpen}
            >
              {t("characteristics.addValue")}
            </Button>
          )}
        </Flex>

        {create.isAdding && (
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
        )}

        {hasOptions && (
          <List
            size="small"
            split
            dataSource={options}
            renderItem={(option) => (
              <List.Item
                key={option.optionId}
                style={{ paddingBlock: 12 }}
                data-qa={getOptionItemDataQa?.(option.optionId)}
              >
                <CharacteristicOptionListItem
                  option={option}
                  rename={rename}
                  saveLoading={saveLoading}
                  archiveLoading={optionArchiveLoadingId === option.optionId}
                  deleteLoading={optionDeleteLoadingId === option.optionId}
                  onArchive={onArchiveOption}
                  onUnarchive={onUnarchiveOption}
                  onDelete={onDeleteOption}
                />
              </List.Item>
            )}
          />
        )}

        {showEmptyState && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("characteristics.noValues")}
          />
        )}

        <Text type="secondary">{t("characteristics.deleteValueNote")}</Text>
      </Flex>
    </Card>
  );
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
  <Flex align="center" gap={8} wrap={false} style={{ width: "100%" }}>
    <Input
      autoFocus
      value={value}
      placeholder={placeholder}
      maxLength={CHARACTERISTIC_OPTION_VALUE_MAX_LENGTH}
      style={{ flex: 1, minWidth: 0 }}
      onChange={(event) => onChange(event.target.value)}
      onPressEnter={() => {
        if (!loading) {
          void onSubmit();
        }
      }}
    />

    <Button disabled={loading} onClick={onCancel} style={{ flexShrink: 0 }}>
      {cancelLabel}
    </Button>

    <Button
      type="primary"
      loading={loading}
      onClick={() => void onSubmit()}
      style={{ flexShrink: 0 }}
    >
      {submitLabel}
    </Button>
  </Flex>
);

const CharacteristicOptionListItem = ({
  option,
  rename,
  saveLoading,
  archiveLoading,
  deleteLoading,
  onArchive,
  onUnarchive,
  onDelete,
}: CharacteristicOptionListItemProps) => {
  const { t } = useTranslation();

  const isEditing = rename.optionId === option.optionId;
  const isArchived = option.archivedAt != null;

  if (isEditing) {
    return (
      <CharacteristicValueFormRow
        value={rename.value}
        submitLabel={t("characteristics.saveChanges")}
        cancelLabel={t("characteristics.cancel")}
        loading={saveLoading}
        onChange={rename.onChange}
        onSubmit={() => rename.onSave(option.optionId)}
        onCancel={rename.onCancel}
      />
    );
  }

  return (
    <Flex
      align="center"
      justify="space-between"
      gap={16}
      style={{ width: "100%" }}
    >
      <Flex vertical gap={2} style={{ flex: 1, minWidth: 0 }}>
        <Flex align="center" gap={8} wrap="wrap">
          <Text
            strong={!isArchived}
            type={isArchived ? "secondary" : undefined}
            ellipsis={{ tooltip: option.label }}
          >
            {option.label}
          </Text>

          {isArchived && (
            <Tag style={{ marginInlineEnd: 0 }}>
              {t("characteristics.archivedBadge")}
            </Tag>
          )}
        </Flex>

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
          icon={<PencilSimpleIcon />}
          aria-label={t("characteristics.renameValue")}
          onClick={() => rename.onOpen(option.optionId, option.label)}
        />

        <Button
          type="text"
          icon={isArchived ? <ArrowClockwiseIcon /> : <ArchiveIcon />}
          loading={archiveLoading}
          aria-label={
            isArchived
              ? t("characteristics.unarchiveValue")
              : t("characteristics.archiveValue")
          }
          onClick={() => {
            if (isArchived) {
              void onUnarchive(option.optionId);
              return;
            }

            onArchive(option.optionId);
          }}
        />

        <Popconfirm
          title={t("characteristics.deleteValueConfirm")}
          description={t("characteristics.deleteWarning")}
          okText={t("characteristics.delete")}
          okButtonProps={{ danger: true }}
          onConfirm={() => onDelete(option.optionId)}
        >
          <Button
            type="text"
            danger
            icon={<TrashIcon />}
            loading={deleteLoading}
            aria-label={t("characteristics.deleteValue")}
          />
        </Popconfirm>
      </Space>
    </Flex>
  );
};
