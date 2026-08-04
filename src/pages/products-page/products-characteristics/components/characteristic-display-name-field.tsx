import { Flex, Input, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { CHARACTERISTIC_NAME_MAX_LENGTH } from "../products-characteristics.constants";

const { Text } = Typography;

type CharacteristicDisplayNameFieldProps = {
  value: string;
  placeholder: string;
  loading?: boolean;
  onChange: (value: string) => void;
  onBlur?: () => void;
};

export const CharacteristicDisplayNameField = ({
  value,
  placeholder,
  loading = false,
  onChange,
  onBlur,
}: CharacteristicDisplayNameFieldProps) => {
  const { t } = useTranslation();

  return (
    <Flex align="center" gap={16} wrap="wrap">
      <Text strong style={{ flex: "0 1 auto" }}>
        {t("characteristics.displayName")}
      </Text>

      <Input
        value={value}
        placeholder={placeholder}
        maxLength={CHARACTERISTIC_NAME_MAX_LENGTH}
        disabled={loading}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        onPressEnter={(event) => event.currentTarget.blur()}
        style={{ flex: "1 1 240px", minWidth: 0 }}
      />
    </Flex>
  );
};
