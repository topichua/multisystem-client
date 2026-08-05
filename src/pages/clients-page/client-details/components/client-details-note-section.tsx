import { App, Button, Card, Flex, Input, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import type { Client } from "@/features/clients/model/client.types";
import { useClientsStore } from "@/features/clients/model/use-clients-store";

const { Title } = Typography;
const { TextArea } = Input;

type ClientDetailsNoteSectionProps = {
  client: Client;
  onClientUpdated: (client: Client) => void;
};

export const ClientDetailsNoteSection = observer(
  function ClientDetailsNoteSection({
    client,
    onClientUpdated,
  }: ClientDetailsNoteSectionProps) {
    const { t } = useTranslation();
    const { notification } = App.useApp();
    const clientsStore = useClientsStore();
    const [note, setNote] = useState(client.note ?? "");
    const [saving, setSaving] = useState(false);

    const normalizedDraft = note.trim();
    const normalizedSaved = (client.note ?? "").trim();
    const isDirty = normalizedDraft !== normalizedSaved;

    const handleSave = async () => {
      if (!isDirty) {
        return;
      }

      setSaving(true);

      try {
        const nextNote = normalizedDraft ? normalizedDraft : null;

        await clientsStore.updateClient(client.id, {
          note: nextNote,
        });

        const updated = clientsStore.activeClient;
        if (updated?.id === client.id) {
          onClientUpdated({
            ...updated,
            note: updated.note ?? nextNote,
            avatar_src: updated.avatar_src ?? client.avatar_src,
            orderStats: updated.orderStats ?? client.orderStats,
            links: updated.links ?? client.links,
            instagramUsers:
              updated.instagramUsers.length > 0
                ? updated.instagramUsers
                : client.instagramUsers,
            telegramUsers:
              updated.telegramUsers.length > 0
                ? updated.telegramUsers
                : client.telegramUsers,
          });
        }

        notification.success({ title: t("clients.updateSuccess") });
      } catch (error) {
        notification.error({
          title: getApiErrorMessage(error, t("clients.requestFailed")),
        });
      } finally {
        setSaving(false);
      }
    };

    return (
      <Flex vertical gap={12} data-qa="clients-detail-note">
        <Title level={4} style={{ margin: 0 }}>
          {t("clients.details.noteTitle")}
        </Title>

        <Card>
          <TextArea
            value={note}
            rows={4}
            placeholder={t("clients.details.notePlaceholder")}
            data-qa="clients-detail-note-input"
            onChange={(event) => setNote(event.target.value)}
          />

          <Flex justify="flex-end" style={{ marginTop: 12 }}>
            <Button
              disabled={!isDirty}
              loading={saving || clientsStore.saveLoading}
              data-qa="clients-detail-note-save"
              onClick={() => {
                void handleSave();
              }}
            >
              {t("clients.save")}
            </Button>
          </Flex>
        </Card>
      </Flex>
    );
  },
);
