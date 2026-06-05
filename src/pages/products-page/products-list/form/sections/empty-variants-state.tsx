import { PlusIcon } from "@phosphor-icons/react";
import { Button, Flex, Typography, theme } from "antd";
import { useTranslation } from "react-i18next";

const { Text } = Typography;

type EmptyVariantsStateProps = {
  onAddManualVariant: () => void;
};

export function EmptyVariantsState({
  onAddManualVariant,
}: EmptyVariantsStateProps) {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  return (
    <Flex
      vertical
      align="center"
      justify="center"
      gap={16}
      style={{
        padding: 32,
        border: `1px dashed ${token.colorBorder}`,
        borderRadius: token.borderRadius,
        background: token.colorFillQuaternary,
      }}
    >
      <Text type="secondary" style={{ textAlign: "center" }}>
        {t("products.variantsForm.empty")}
      </Text>

      <Button icon={<PlusIcon />} onClick={onAddManualVariant}>
        {t("products.variantAddCta")}
      </Button>
    </Flex>
  );
}
