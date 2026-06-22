import { StackIcon } from "@phosphor-icons/react";
import { Button, Dropdown, type MenuProps } from "antd";
import { useTranslation } from "react-i18next";

type InstagramPostCommentTemplatesDropdownProps = {
  items: MenuProps["items"];
  onMenuClick: MenuProps["onClick"];
  onOpenChange: (open: boolean) => void;
};

export const InstagramPostCommentTemplatesDropdown = ({
  items,
  onMenuClick,
  onOpenChange,
}: InstagramPostCommentTemplatesDropdownProps) => {
  const { t } = useTranslation();

  return (
    <Dropdown
      trigger={["click"]}
      placement="topLeft"
      menu={{
        items,
        onClick: onMenuClick,
      }}
      onOpenChange={onOpenChange}
    >
      <Button variant="outlined" icon={<StackIcon size={16} />}>
        {t("instagram.template")}
      </Button>
    </Dropdown>
  );
};
