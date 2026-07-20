import { TrashIcon } from "@phosphor-icons/react";
import { Alert, Button, Popconfirm } from "antd";
import { useTranslation } from "react-i18next";

type CategoryDangerZoneProps = {
  deleteBlockedByApi: boolean;
  deleteLoading: boolean;
  onDelete: () => Promise<void>;
  deleteDataQa?: string;
  mobileLayout?: boolean;
};

export const CategoryDangerZone = ({
  deleteBlockedByApi,
  deleteLoading,
  onDelete,
  deleteDataQa,
  mobileLayout = false,
}: CategoryDangerZoneProps) => {
  const { t } = useTranslation();

  return (
    <>
      {deleteBlockedByApi && (
        <Alert
          type="error"
          showIcon
          title={t("categories.deleteBlockedHasChildrenTitle")}
          description={t("categories.deleteBlockedHasChildren")}
          closable
        />
      )}

      <Popconfirm
        title={t("categories.deleteConfirm")}
        description={t("categories.deleteWarning")}
        okText={t("categories.delete")}
        okButtonProps={{ danger: true }}
        onConfirm={() => void onDelete()}
      >
        <Button
          danger
          type={mobileLayout ? "default" : "text"}
          block={mobileLayout}
          icon={<TrashIcon size={18} />}
          loading={deleteLoading}
          data-qa={deleteDataQa}
          aria-label={t("categories.mobile.deleteCategoryAria")}
          style={
            mobileLayout
              ? undefined
              : { alignSelf: "flex-start", paddingInline: 0 }
          }
        >
          {t("categories.deleteCategory")}
        </Button>
      </Popconfirm>
    </>
  );
};
