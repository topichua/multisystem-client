import type { MenuProps } from "antd";
import { Button, Form, Menu } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { getSettingsGroupPath } from "@/app/router/pages-map";
import {
  PaneScrollRegion,
  PaneSectionHeaderStack,
  PaneSectionTitle,
} from "@/components/layout/pane-frame";
import { PaneNavSplitLayout } from "@/components/layout/pane-nav-split-layout";
import type { ConversationGroupWritePayload } from "@/features/conversation-groups/model/conversation-group.types";
import { getManageableConversationGroups } from "@/features/conversation-groups/model/system-groups";
import { useConversationGroupsStore } from "@/features/conversation-groups/model/use-conversation-groups-store";
import { ColorLabelRow } from "@/shared/components/color-label-row/color-label-row";
import { DEFAULT_COLOR_PRESET } from "@/shared/components/preset-color-picker/color-presets";

import { GroupFormModal, type GroupFormValues } from "./group-form-modal";
import { useNotification } from "@/shared/components/notification/use-notification";
import { useIsMobileViewport } from "@/utils/use-media-query";

export const SettingsGroupsLayout = observer(() => {
  const { t } = useTranslation();
  const store = useConversationGroupsStore();
  const navigate = useNavigate();
  const location = useLocation();
  const notification = useNotification();
  const isMobileViewport = useIsMobileViewport();
  const [form] = Form.useForm<GroupFormValues>();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    void store.loadGroups();
  }, [store]);

  const sortedGroups = useMemo(
    () => getManageableConversationGroups(store.groups),
    [store.groups],
  );

  const menuItems: MenuProps["items"] = useMemo(
    () =>
      sortedGroups.map((g) => ({
        key: getSettingsGroupPath(g.id),
        label: <ColorLabelRow name={g.name} color={g.color} />,
      })),
    [sortedGroups],
  );

  const openCreate = useCallback(() => {
    form.setFieldsValue({
      name: "",
      description: "",
      color: DEFAULT_COLOR_PRESET,
    });
    setModalOpen(true);
  }, [form]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    form.resetFields();
  }, [form]);

  const handleModalOk = useCallback(async () => {
    let values: GroupFormValues;
    try {
      values = await form.validateFields();
    } catch {
      return Promise.reject();
    }

    const sort_order = store.nextSortOrder;
    const payload: ConversationGroupWritePayload = {
      name: values.name,
      description: values.description,
      color:
        typeof values.color === "string" ? values.color : String(values.color),
      sort_order,
    };

    try {
      await store.createGroup(payload);
      notification.success({ title: t("groups.created") });
      closeModal();
      if (!isMobileViewport) {
        const created = store.groups.find(
          (g) => g.name.trim() === values.name.trim(),
        );
        if (created) {
          navigate(getSettingsGroupPath(created.id));
        }
      }
    } catch (e) {
      notification.error({
        title: getApiErrorMessage(e, t("groups.createError")),
      });
      return Promise.reject();
    }
  }, [closeModal, form, isMobileViewport, notification, navigate, store, t]);

  const outletContext = {
    onCreateClick: openCreate,
  } satisfies SettingsGroupsOutletContext;

  return (
    <>
      {isMobileViewport ? (
        <Outlet context={outletContext} />
      ) : (
        <PaneNavSplitLayout.Root data-qa="layout-settings-groups-shell">
          <PaneNavSplitLayout.SubSidebar data-qa="layout-settings-groups-sidebar">
            <PaneSectionHeaderStack data-qa="layout-settings-groups-header">
              <PaneSectionTitle>{t("groups.title")}</PaneSectionTitle>
              <Button type="primary" onClick={openCreate}>
                {t("groups.createGroup")}
              </Button>
            </PaneSectionHeaderStack>
            <PaneScrollRegion data-qa="layout-settings-groups-nav-scroll">
              <div data-qa="layout-settings-groups-nav">
                <Menu
                  mode="inline"
                  selectedKeys={[location.pathname]}
                  items={menuItems}
                  onClick={({ key }) => navigate(String(key))}
                  style={{ borderInlineEnd: "none" }}
                />
              </div>
            </PaneScrollRegion>
          </PaneNavSplitLayout.SubSidebar>
          <PaneNavSplitLayout.SubMain data-qa="layout-settings-groups-main">
            <Outlet context={outletContext} />
          </PaneNavSplitLayout.SubMain>
        </PaneNavSplitLayout.Root>
      )}

      <GroupFormModal
        open={modalOpen}
        editingGroup={null}
        groups={store.groups}
        form={form}
        saveLoading={store.saveLoading}
        onCancel={closeModal}
        onOk={handleModalOk}
      />
    </>
  );
});

export type SettingsGroupsOutletContext = {
  onCreateClick: () => void;
};
