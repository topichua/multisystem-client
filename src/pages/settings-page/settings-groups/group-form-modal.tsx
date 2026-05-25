import { Form, Modal } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { useTranslation } from 'react-i18next';

import type { ConversationGroup } from '@/features/conversation-groups/model/conversation-group.types';

import { GroupFormFields, type GroupFormValues } from './group-form-fields';

export type { GroupFormValues };

type GroupFormModalProps = {
  open: boolean;
  editingGroup: ConversationGroup | null;
  groups: ConversationGroup[];
  form: FormInstance<GroupFormValues>;
  saveLoading: boolean;
  onCancel: () => void;
  onOk: () => Promise<void>;
};

export const GroupFormModal = ({
  open,
  editingGroup,
  groups,
  form,
  saveLoading,
  onCancel,
  onOk,
}: GroupFormModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      key={editingGroup?.id ?? 'create'}
      title={editingGroup ? t('groups.modalEditTitle') : t('groups.modalCreateTitle')}
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      confirmLoading={saveLoading}
      destroyOnHidden
      okText={t('groups.modalOk')}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        <GroupFormFields groups={groups} editingGroupId={editingGroup?.id} />
      </Form>
    </Modal>
  );
};
