import { ClockIcon, SparkleIcon, XIcon } from "@phosphor-icons/react";
import {
  Button,
  Flex,
  Form,
  Input,
  Modal,
  Select,
  Spin,
  TimePicker,
  Typography,
} from "antd";
import axios from "axios";
import dayjs, { type Dayjs } from "dayjs";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { conversationsApi } from "@/features/conversations/api/conversations-api";
import { useConversationsStore } from "@/features/conversations/model/use-conversations-store";
import { useMessageTemplatesStore } from "@/features/message-templates/model/use-message-templates-store";
import { useNotification } from "@/shared/components/notification/use-notification";
import {
  combineDateAndTime,
  formatApiDate,
  getFollowUpDayKeys,
  startOfNextMinute,
} from "@/utils/date-time";

import { ConversationFollowUpDayPicker } from "./conversation-follow-up-day-picker";

const { Text } = Typography;

const TIME_FORMAT = "HH:mm";

type FollowUpFormValues = {
  dayKey: string;
  time: Dayjs;
  templateId?: number;
  message: string;
};

type ConversationFollowUpModalProps = {
  open: boolean;
  conversationId: string | undefined;
  onClose: () => void;
};

export const ConversationFollowUpModal = observer(
  ({ open, conversationId, onClose }: ConversationFollowUpModalProps) => {
    const { t } = useTranslation();
    const notification = useNotification();
    const conversationsStore = useConversationsStore();
    const templatesStore = useMessageTemplatesStore();
    const [form] = Form.useForm<FollowUpFormValues>();
    const [anchor, setAnchor] = useState(() => dayjs());
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [renderingTemplate, setRenderingTemplate] = useState(false);

    const dayKey = Form.useWatch("dayKey", form);
    const conversationNumericId = Number(conversationId);
    const hasConversationId = Number.isFinite(conversationNumericId);

    const templateOptions = useMemo(
      () =>
        [...templatesStore.templates]
          .sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
          )
          .map((template) => ({
            value: template.id,
            label: template.name,
          })),
      [templatesStore.templates],
    );

    const disabledTime = useCallback(() => {
      if (dayKey !== formatApiDate(anchor.startOf("day"))) {
        return {};
      }

      const now = dayjs();

      return {
        disabledHours: () =>
          Array.from({ length: now.hour() }, (_, hour) => hour),
        disabledMinutes: (hour: number) =>
          hour !== now.hour()
            ? []
            : Array.from({ length: now.minute() + 1 }, (_, minute) => minute),
      };
    }, [anchor, dayKey]);

    const snapTimeIfPast = useCallback(
      (nextDayKey: string, time: Dayjs | undefined) => {
        if (!time?.isValid()) {
          return startOfNextMinute(dayjs());
        }

        const scheduledAt = combineDateAndTime(nextDayKey, time);

        return scheduledAt.isBefore(dayjs())
          ? startOfNextMinute(dayjs())
          : time;
      },
      [],
    );

    useEffect(() => {
      if (!open) {
        return;
      }

      const nextAnchor = dayjs();
      const defaultDayKey = formatApiDate(nextAnchor.startOf("day"));

      setAnchor(nextAnchor);
      setIsEditing(false);
      form.setFieldsValue({
        dayKey: defaultDayKey,
        time: startOfNextMinute(nextAnchor),
        templateId: undefined,
        message: "",
      });

      if (templatesStore.listType !== "chat" && !templatesStore.listLoading) {
        void templatesStore.loadTemplates({ type: "chat" });
      }

      if (!hasConversationId) {
        return;
      }

      let cancelled = false;

      setLoading(true);

      void conversationsApi
        .getFollowUp(conversationNumericId)
        .then((existing) => {
          if (cancelled || existing == null) {
            return;
          }

          const scheduledAt = dayjs(existing.scheduledAt);
          const allowedDays = getFollowUpDayKeys(nextAnchor);
          const existingDayKey = formatApiDate(scheduledAt);
          const nextDayKey = allowedDays.includes(existingDayKey)
            ? existingDayKey
            : defaultDayKey;

          form.setFieldsValue({
            dayKey: nextDayKey,
            time: snapTimeIfPast(nextDayKey, scheduledAt),
            templateId: existing.templateId ?? undefined,
            message: existing.message,
          });
          setIsEditing(true);
        })
        .catch((error: unknown) => {
          if (
            cancelled ||
            (axios.isAxiosError(error) && error.response?.status === 404)
          ) {
            return;
          }

          notification.error({
            title: getApiErrorMessage(
              error,
              t("conversation.followUp.loadError"),
            ),
          });
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });

      return () => {
        cancelled = true;
      };
    }, [
      conversationNumericId,
      form,
      hasConversationId,
      notification,
      open,
      snapTimeIfPast,
      t,
      templatesStore,
    ]);

    useEffect(() => {
      if (!open || !dayKey) {
        return;
      }

      const time = form.getFieldValue("time") as Dayjs | undefined;
      const nextTime = snapTimeIfPast(dayKey, time);

      if (!time || !nextTime.isSame(time, "minute")) {
        form.setFieldValue("time", nextTime);
      }
    }, [dayKey, form, open, snapTimeIfPast]);

    const handleTemplateChange = async (templateId: number | null) => {
      if (templateId == null || !hasConversationId) {
        return;
      }

      setRenderingTemplate(true);

      try {
        const text = await templatesStore.renderTemplate(templateId, {
          conversationId: conversationNumericId,
        });

        if (text == null) {
          notification.error({
            title: t("composer.renderTemplateError"),
          });
          return;
        }

        form.setFieldValue("message", text);
      } catch (error) {
        notification.error({
          title: getApiErrorMessage(error, t("composer.renderTemplateError")),
        });
      } finally {
        setRenderingTemplate(false);
      }
    };

    const handleOk = async () => {
      const values = await form.validateFields();
      const scheduledAt = combineDateAndTime(values.dayKey, values.time);

      if (scheduledAt.isBefore(dayjs())) {
        form.setFields([
          {
            name: "time",
            errors: [t("conversation.followUp.timeInPast")],
          },
        ]);
        return Promise.reject();
      }

      if (!hasConversationId) {
        return Promise.reject();
      }

      setSaving(true);

      try {
        await conversationsStore.saveConversationFollowUp(
          String(conversationNumericId),
          {
            scheduledAt: scheduledAt.toISOString(),
            message: values.message.trim(),
            ...(values.templateId != null
              ? { templateId: values.templateId }
              : {}),
            cancelOnReply: true,
          },
          isEditing,
        );

        notification.success({
          title: t("conversation.followUp.saveSuccess"),
        });
        onClose();
      } catch (error) {
        notification.error({
          title: getApiErrorMessage(
            error,
            t("conversation.followUp.saveError"),
          ),
        });
        return Promise.reject();
      } finally {
        setSaving(false);
      }
    };

    return (
      <Modal
        centered
        closeIcon={<XIcon />}
        confirmLoading={saving}
        destroyOnHidden
        open={open}
        width={560}
        okText={t("conversation.followUp.submit")}
        cancelText={t("conversation.followUp.cancel")}
        okButtonProps={{ disabled: loading || !hasConversationId }}
        title={
          <Flex align="center" gap={8}>
            <ClockIcon size={18} />
            {t("conversation.followUp.modalTitle")}
          </Flex>
        }
        onCancel={onClose}
        onOk={() => handleOk()}
      >
        <Spin spinning={loading}>
          <Text type="secondary">{t("conversation.followUp.hint")}</Text>

          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            style={{ marginTop: 16 }}
          >
            <Form.Item
              name="dayKey"
              label={t("conversation.followUp.dayLabel")}
              rules={[{ required: true }]}
            >
              <ConversationFollowUpDayPicker anchor={anchor} />
            </Form.Item>

            <Form.Item
              name="time"
              label={t("conversation.followUp.timeLabel")}
              rules={[{ required: true }]}
            >
              <TimePicker
                allowClear={false}
                disabledTime={disabledTime}
                format={TIME_FORMAT}
                needConfirm={false}
                showNow={false}
                style={{ width: "100%" }}
                data-qa="layout-conversation-follow-up-time"
              />
            </Form.Item>

            <Flex vertical gap={8} style={{ marginBottom: 8 }}>
              <Text>{t("conversation.followUp.messageLabel")}</Text>

              <Button
                block
                disabled
                htmlType="button"
                color="primary"
                variant="filled"
                icon={<SparkleIcon size={16} />}
                data-qa="layout-conversation-follow-up-ai"
                style={{
                  height: "auto",
                  padding: "12px 16px",
                  justifyContent: "flex-start",
                }}
              >
                <Flex vertical align="start">
                  <Text>{t("conversation.followUp.aiGenerate")}</Text>
                  <Text
                    type="secondary"
                    style={{ fontSize: 12, whiteSpace: "normal" }}
                  >
                    {t("conversation.followUp.aiGenerateHint")}
                  </Text>
                </Flex>
              </Button>

              <Flex align="center" gap={8}>
                <Text type="secondary" style={{ whiteSpace: "nowrap" }}>
                  {t("conversation.followUp.orChooseTemplate")}
                </Text>
                <Form.Item name="templateId" noStyle>
                  <Select
                    allowClear
                    loading={templatesStore.listLoading || renderingTemplate}
                    options={templateOptions}
                    placeholder={t("conversation.followUp.templatePlaceholder")}
                    style={{ flex: 1, minWidth: 0 }}
                    data-qa="layout-conversation-follow-up-template"
                    onChange={(next) => {
                      void handleTemplateChange(next ?? null);
                    }}
                  />
                </Form.Item>
              </Flex>
            </Flex>

            <Form.Item
              name="message"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: t("conversation.followUp.messageRequired"),
                },
              ]}
            >
              <Input.TextArea
                autoSize={{ minRows: 4, maxRows: 8 }}
                placeholder={t("conversation.followUp.messagePlaceholder")}
                data-qa="layout-conversation-follow-up-message"
              />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    );
  },
);
