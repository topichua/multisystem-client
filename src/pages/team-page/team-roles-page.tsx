import { PlusIcon } from '@phosphor-icons/react';
import type { MenuProps } from 'antd';
import {
  Button,
  Empty,
  Form,
  Input,
  Menu,
  Modal,
  Spin,
  Typography,
  message,
} from 'antd';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router';

import { getApiErrorMessage } from '@/api/get-api-error-message';
import { getTeamRolePath } from '@/app/router/pages-map';
import {
  PaneScrollRegion,
  PaneSectionHeaderStack,
  PaneSectionTitle,
} from '@/components/layout/pane-frame';
import { PaneNavSplitLayout } from '@/components/layout/pane-nav-split-layout';
import { useWorkspaceRolesStore } from '@/features/workspace-roles/model/use-workspace-roles-store';
import { slugifyAscii } from '@/utils/slugify';

const { Text } = Typography;

type TeamCreateRoleFormValues = {
  name: string;
};

export const TeamRolesPage = observer(() => {
  const { t } = useTranslation();
  const store = useWorkspaceRolesStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [messageApi, contextHolder] = message.useMessage();
  const [createForm] = Form.useForm<TeamCreateRoleFormValues>();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    void store.loadInitialData();
  }, [store]);

  const menuItems: MenuProps['items'] = useMemo(
    () =>
      store.sortedRoles.map((role) => ({
        key: getTeamRolePath(role.id),
        label: role.name,
      })),
    [store.sortedRoles],
  );

  const selectedKey = useMemo(
    () =>
      store.roles.some((role) => location.pathname === getTeamRolePath(role.id))
        ? location.pathname
        : '',
    [location.pathname, store.roles],
  );

  const showInitialLoader = store.listLoading && store.roles.length === 0;

  const openCreateModal = useCallback(() => {
    createForm.setFieldsValue({ name: '' });
    setCreateModalOpen(true);
  }, [createForm]);

  const closeCreateModal = useCallback(() => {
    setCreateModalOpen(false);
    createForm.resetFields();
  }, [createForm]);

  const handleCreateRole = useCallback(async () => {
    let values: TeamCreateRoleFormValues;
    try {
      values = await createForm.validateFields();
    } catch {
      return;
    }

    const name = values.name.trim();
    const slug = slugifyAscii(name);

    if (!slug) {
      messageApi.error(t('team.roleSlugGenerationError'));
      return;
    }

    try {
      await store.createRole({
        name,
        slug,
        permissions: ['orders.read'],
        permissionOptions: {
          'orders.visibility': 'mine',
        },
      });
      messageApi.success(t('team.roleCreated'));
      closeCreateModal();

      const created = store.roles.find((role) => role.slug === slug);
      if (created) {
        navigate(getTeamRolePath(created.id));
      }
    } catch (e) {
      messageApi.error(getApiErrorMessage(e, t('team.roleCreateError')));
    }
  }, [closeCreateModal, createForm, messageApi, navigate, store, t]);

  return (
    <>
      {contextHolder}
      <PaneNavSplitLayout.Root data-qa="layout-team-roles-shell">
        <PaneNavSplitLayout.SubSidebar data-qa="layout-team-roles-sidebar">
          <PaneSectionHeaderStack data-qa="layout-team-roles-header">
            <PaneSectionTitle>{t('team.rolesTitle')}</PaneSectionTitle>
            <Button
              type="primary"
              icon={<PlusIcon size={16} />}
              onClick={openCreateModal}
            >
              {t('team.createRole')}
            </Button>
          </PaneSectionHeaderStack>
          <PaneScrollRegion data-qa="layout-team-roles-nav-scroll">
            {store.listError && (
              <Text type="danger" style={{ display: 'block', margin: 8 }}>
                {store.listError}
              </Text>
            )}
            {showInitialLoader ? (
              <Spin style={{ margin: 16 }} />
            ) : store.roles.length > 0 ? (
              <div data-qa="layout-team-roles-nav">
                <Menu
                  mode="inline"
                  selectedKeys={selectedKey ? [selectedKey] : []}
                  items={menuItems}
                  onClick={({ key }) => navigate(String(key))}
                  style={{ borderInlineEnd: 'none' }}
                />
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t('team.rolesEmpty')}
                style={{ marginTop: 24 }}
              />
            )}
          </PaneScrollRegion>
        </PaneNavSplitLayout.SubSidebar>
        <PaneNavSplitLayout.SubMain data-qa="layout-team-roles-main">
          <Outlet />
        </PaneNavSplitLayout.SubMain>
      </PaneNavSplitLayout.Root>

      <Modal
        title={t('team.createRoleTitle')}
        open={createModalOpen}
        onCancel={closeCreateModal}
        onOk={() => void handleCreateRole()}
        confirmLoading={store.saveLoading}
        okText={t('team.createRoleSubmit')}
        destroyOnHidden
      >
        <Form form={createForm} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item
            name="name"
            label={t('team.roleName')}
            rules={[
              {
                required: true,
                whitespace: true,
                message: t('team.roleNameRequired'),
              },
            ]}
          >
            <Input autoFocus />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
});
