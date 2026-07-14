import { InfoIcon, PackageIcon } from "@phosphor-icons/react";
import { Col, Flex, Form, InputNumber, Row, Tooltip } from "antd";
import { useTranslation } from "react-i18next";

import * as S from "../../settings-integrations.styled";

type ReservePackagingFieldsProps = {
  columnBreakpoint?: "sm" | "md";
};

export function ReservePackagingFields({
  columnBreakpoint = "sm",
}: ReservePackagingFieldsProps) {
  const { t } = useTranslation();
  const columnProps =
    columnBreakpoint === "md" ? { md: 12 as const } : { sm: 12 as const };

  return (
    <S.NovaPoshtaFormSection>
      <Flex gap={4} vertical>
        <S.NovaPoshtaSectionTitle>
          <PackageIcon size={16} />
          <span>
            {t("integrations.novaPoshtaWizard.sections.reservePackaging")}
          </span>
          <Tooltip
            title={t("integrations.novaPoshtaWizard.reservePackagingNote")}
          >
            <InfoIcon size={16} />
          </Tooltip>
        </S.NovaPoshtaSectionTitle>
      </Flex>

      <Row gutter={12}>
        <Col xs={24} {...columnProps}>
          <Form.Item
            label={t(
              "integrations.novaPoshtaWizard.fields.defaultWeightKg.label",
            )}
            name="default_weight_kg"
          >
            <InputNumber
              min={0}
              step={0.1}
              precision={2}
              controls={false}
              placeholder={t(
                "integrations.novaPoshtaWizard.fields.defaultWeightKg.placeholder",
              )}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Col>

        <Col xs={24} {...columnProps}>
          <Form.Item
            label={t(
              "integrations.novaPoshtaWizard.fields.defaultLengthCm.label",
            )}
            name="default_length_cm"
          >
            <InputNumber
              min={0}
              precision={0}
              controls={false}
              placeholder={t(
                "integrations.novaPoshtaWizard.fields.defaultLengthCm.placeholder",
              )}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Col>

        <Col xs={24} {...columnProps}>
          <Form.Item
            label={t(
              "integrations.novaPoshtaWizard.fields.defaultWidthCm.label",
            )}
            name="default_width_cm"
          >
            <InputNumber
              min={0}
              precision={0}
              controls={false}
              placeholder={t(
                "integrations.novaPoshtaWizard.fields.defaultWidthCm.placeholder",
              )}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Col>

        <Col xs={24} {...columnProps}>
          <Form.Item
            label={t(
              "integrations.novaPoshtaWizard.fields.defaultHeightCm.label",
            )}
            name="default_height_cm"
          >
            <InputNumber
              min={0}
              precision={0}
              controls={false}
              placeholder={t(
                "integrations.novaPoshtaWizard.fields.defaultHeightCm.placeholder",
              )}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Col>
      </Row>
    </S.NovaPoshtaFormSection>
  );
}
