import { Button, Card, Flex, Typography, theme } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { MessageTemplateVariable } from "@/features/message-templates/model/message-template.types";
import { groupTemplateVariables } from "@/features/message-templates/model/message-template.utils";

const { Text } = Typography;

type TemplateVariablesPickerProps = {
  variables: MessageTemplateVariable[];
  onInsert: (placeholder: string) => void;
};

export const TemplateVariablesPicker = ({
  variables,
  onInsert,
}: TemplateVariablesPickerProps) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const groups = useMemo(() => groupTemplateVariables(variables), [variables]);

  if (groups.length === 0) {
    return null;
  }

  return (
    <Flex vertical gap={12} data-qa="template-variables-picker">
      <Text strong>{t("templates.variables.title")}</Text>
      <Card
        style={{ backgroundColor: token.colorFillAlter }}
        styles={{
          body: { padding: 12, backgroundColor: token.colorFillAlter },
        }}
      >
        <Flex vertical gap={12}>
          {groups.map((group) => (
            <Flex key={group.key} vertical gap={8}>
              <Text type="secondary">
                {t(`templates.variables.groups.${group.key}`, {
                  defaultValue: group.key,
                })}
              </Text>
              <Flex wrap gap={8}>
                {group.variables.map((variable) => (
                  <Button
                    key={variable.key}
                    size="small"
                    data-qa={`template-variable-${variable.key}`}
                    onClick={() => onInsert(variable.placeholder)}
                  >
                    {t(`templates.variables.keys.${variable.key}`, {
                      defaultValue: variable.key,
                    })}
                  </Button>
                ))}
              </Flex>
            </Flex>
          ))}
        </Flex>
      </Card>
    </Flex>
  );
};
