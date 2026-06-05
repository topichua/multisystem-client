import { ListBulletsIcon, TextTIcon } from "@phosphor-icons/react";
import { Form, Input, Modal } from "antd";
import type { FormInstance } from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import { CHARACTERISTIC_NAME_MAX_LENGTH } from "../products-characteristics.constants";
import type { CharacteristicCreateFormValues } from "../controllers/use-products-characteristics-layout-controller";

const TypeCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const TypeCardButton = styled.button<{ $selected: boolean }>`
  width: 100%;
  padding: 12px 26px;
  border: 1px solid
    ${({ $selected, theme }) =>
      $selected
        ? theme.colors.functional.border.selected
        : theme.colors.functional.border.split};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.functional.text.primary};
  cursor: pointer;
  position: relative;
  text-align: left;

  &:hover,
  &:focus-visible {
    border-color: ${({ theme }) => theme.colors.functional.border.selected};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.functional.border.selected};
    outline-offset: 2px;
  }
`;

const TypeCardContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const TypeIconBox = styled.span<{ $selected: boolean }>`
  border-radius: 8px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  color: ${({ $selected, theme }) =>
    $selected
      ? theme.colors.functional.text.inverted
      : theme.colors.functional.text.primary};
  color: ${({ $selected, theme }) =>
    $selected
      ? theme.colors.semantic.primary
      : theme.colors.functional.text.primary};
`;

const TypeTextStack = styled.span`
  display: flex;
  min-width: 0;
  flex-direction: column;
  /* gap: 2px; */
`;

const TypeTitle = styled.span`
  font-weight: 600;
  font-size: 16px;
  line-height: 22px;
`;

const TypeDescription = styled.span`
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: 13px;
  line-height: 18px;
`;

const TypeRadioMark = styled.span<{ $selected: boolean }>`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid
    ${({ $selected, theme }) =>
      $selected
        ? theme.colors.semantic.primary
        : theme.colors.functional.border.split};

  &::after {
    content: "";
    position: absolute;
    inset: 3px;
    border-radius: 50%;
    background: ${({ $selected, theme }) =>
      $selected ? theme.colors.semantic.primary : "transparent"};
  }
`;

type CharacteristicCreateModalProps = {
  form: FormInstance<CharacteristicCreateFormValues>;
  open: boolean;
  confirmLoading: boolean;
  onCancel: () => void;
  onCreate: () => Promise<void>;
};

type CharacteristicTypeCardsProps = {
  value?: CharacteristicCreateFormValues["type"];
  onChange?: (value: CharacteristicCreateFormValues["type"]) => void;
};

const CharacteristicTypeCards = ({
  value,
  onChange,
}: CharacteristicTypeCardsProps) => {
  const { t } = useTranslation();
  const selectedType = value ?? "options";
  const options: Array<{
    value: CharacteristicCreateFormValues["type"];
    title: string;
    description: string;
    icon: ReactNode;
  }> = [
    {
      value: "text",
      title: t("characteristics.typeText"),
      description: t("characteristics.typeTextDescription", {
        defaultValue: "Free text input",
      }),
      icon: <TextTIcon size={24} />,
    },
    {
      value: "options",
      title: t("characteristics.typeOptions"),
      description: t("characteristics.typeOptionsDescription", {
        defaultValue: "Prepared values",
      }),
      icon: <ListBulletsIcon size={24} />,
    },
  ];

  return (
    <TypeCardsGrid>
      {options.map((option) => {
        const selected = selectedType === option.value;

        return (
          <TypeCardButton
            key={option.value}
            type="button"
            $selected={selected}
            aria-pressed={selected}
            onClick={() => onChange?.(option.value)}
          >
            <TypeCardContent>
              <TypeIconBox $selected={selected}>{option.icon}</TypeIconBox>
              <TypeTextStack>
                <TypeTitle>{option.title}</TypeTitle>
                <TypeDescription>{option.description}</TypeDescription>
              </TypeTextStack>
            </TypeCardContent>
            <TypeRadioMark $selected={selected} aria-hidden />
          </TypeCardButton>
        );
      })}
    </TypeCardsGrid>
  );
};

export const CharacteristicCreateModal = ({
  form,
  open,
  confirmLoading,
  onCancel,
  onCreate,
}: CharacteristicCreateModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      title={t("characteristics.modalCreateTitle")}
      open={open}
      onCancel={onCancel}
      onOk={onCreate}
      okText={t("characteristics.okCreate")}
      confirmLoading={confirmLoading}
      destroyOnHidden
      width={450}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="label"
          label={t("characteristics.name")}
          rules={[
            {
              required: true,
              whitespace: true,
              message: t("characteristics.nameRequired"),
            },
            {
              max: CHARACTERISTIC_NAME_MAX_LENGTH,
              message: t("characteristics.nameTooLong"),
            },
          ]}
        >
          <Input placeholder={t("characteristics.namePlaceholder")} />
        </Form.Item>

        <Form.Item
          name="type"
          label={t("characteristics.type")}
          rules={[
            { required: true, message: t("characteristics.typeRequired") },
          ]}
        >
          <CharacteristicTypeCards />
        </Form.Item>
      </Form>
    </Modal>
  );
};
