import { HeartIcon, XIcon } from "@phosphor-icons/react";
import { Button, Flex, Typography } from "antd";
import type { CSSProperties, MouseEvent } from "react";
import { useTranslation } from "react-i18next";

const { Text } = Typography;

const sectionLabelStyle: CSSProperties = {
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

type ClientWishlistHeaderProps = {
  addOpen: boolean;
  heartColor: string;
  onAdd: (event: MouseEvent<HTMLElement>) => void;
  onClose: (event: MouseEvent<HTMLElement>) => void;
};

export function ClientWishlistHeader({
  addOpen,
  heartColor,
  onAdd,
  onClose,
}: ClientWishlistHeaderProps) {
  const { t } = useTranslation();

  return (
    <Flex
      align="center"
      justify="space-between"
      style={{ width: "100%", paddingRight: 8 }}
    >
      <Flex align="center" gap={8}>
        <HeartIcon size={16} color={heartColor} />

        <Text type="secondary" style={sectionLabelStyle}>
          {t("conversation.clientProfile.wishlist.title")}
        </Text>
      </Flex>

      {addOpen ? (
        <Button
          type="link"
          size="small"
          icon={<XIcon size={14} />}
          style={{ padding: 0, height: "auto" }}
          onClick={onClose}
        >
          {t("conversation.clientProfile.wishlist.close")}
        </Button>
      ) : (
        <Button
          type="link"
          size="small"
          style={{ padding: 0, height: "auto" }}
          onClick={onAdd}
        >
          {t("conversation.clientProfile.wishlist.add")}
        </Button>
      )}
    </Flex>
  );
}
