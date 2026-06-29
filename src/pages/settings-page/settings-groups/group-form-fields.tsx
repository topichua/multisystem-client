import { Form, Input } from "antd";
import { useTranslation } from "react-i18next";

import type {
  ConversationGroup,
  ConversationGroupWritePayload,
} from "@/features/conversation-groups/model/conversation-group.types";
import { PresetColorPicker } from "@/shared/components/preset-color-picker/preset-color-picker";
import { useIsMobileViewport } from "@/utils/use-media-query";

import { isDuplicateGroupName } from "./group-name-validation";

export type GroupFormValues = Pick<
  ConversationGroupWritePayload,
  "name" | "description" | "color"
>;

type GroupFormFieldsProps = {
  groups: ConversationGroup[];
  editingGroupId?: number | null;
};

export const GroupFormFields = ({
  groups,
  editingGroupId,
}: GroupFormFieldsProps) => {
  const { t } = useTranslation();
  const isMobileViewport = useIsMobileViewport();

  return (
    <>
      <Form.Item
        name="name"
        label={t("groups.fieldName")}
        rules={[
          { required: true, message: t("groups.nameRequired") },
          {
            validator: async (_, value: string) => {
              if (value == null || String(value).trim() === "") {
                return;
              }

              if (
                isDuplicateGroupName(value, groups, editingGroupId ?? undefined)
              ) {
                throw new Error(t("groups.duplicateName"));
              }
            },
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="description"
        label={t("groups.fieldDescription")}
        rules={[{ required: true }]}
      >
        <Input.TextArea rows={3} />
      </Form.Item>
      <Form.Item
        name="color"
        label={t("groups.fieldColor")}
        rules={[{ required: true, message: t("groups.pickColor") }]}
      >
        <PresetColorPicker
          ariaLabel={t("groups.colorPickerAria")}
          columns={isMobileViewport ? 5 : undefined}
        />
      </Form.Item>
    </>
  );
};
