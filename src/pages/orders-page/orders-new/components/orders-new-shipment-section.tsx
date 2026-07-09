import { CaretDownIcon, CubeIcon, InfoIcon } from "@phosphor-icons/react";
import { Button, Flex, Form, InputNumber, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { drawerKey } from "../orders-new.constants";
import * as S from "../orders-new-page.styled";
import { SectionHeading } from "./section-heading";

const { Text } = Typography;

type OrdersNewShipmentSectionProps = {
  declaredValue: number | null;
  onDeclaredValueChange: (value: number | null) => void;
  onToggle: () => void;
  open: boolean;
};

export function OrdersNewShipmentSection({
  declaredValue,
  onDeclaredValueChange,
  onToggle,
  open,
}: OrdersNewShipmentSectionProps) {
  const { t } = useTranslation();

  return (
    <S.SectionCard>
      <S.CardHeader justify="space-between" align="center" gap={12}>
        <SectionHeading icon={<CubeIcon size={18} />}>
          {t("orders.create.shipment.title")}
        </SectionHeading>
        <Button type="link" size="small" onClick={onToggle}>
          {open
            ? t("orders.create.shipment.collapse")
            : t("orders.create.shipment.configure")}
          <CaretDownIcon
            size={16}
            weight="bold"
            style={{
              transform: open ? "rotate(180deg)" : undefined,
            }}
          />
        </Button>
      </S.CardHeader>

      {open && (
        <S.ShipmentParamsBody>
          <S.ShipmentGrid>
            <Form.Item label={t("orders.create.shipment.weight")}>
              <InputNumber
                min={0}
                controls={false}
                addonAfter={t("orders.create.shipment.grams")}
                placeholder={t("orders.create.shipment.weightPlaceholder")}
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item label={t("orders.create.shipment.places")}>
              <InputNumber
                min={1}
                precision={0}
                controls={false}
                defaultValue={1}
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item label={t("orders.create.shipment.length")}>
              <InputNumber
                min={0}
                controls={false}
                addonAfter={t("orders.create.shipment.centimeters")}
                placeholder="—"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item label={t("orders.create.shipment.width")}>
              <InputNumber
                min={0}
                controls={false}
                addonAfter={t("orders.create.shipment.centimeters")}
                placeholder="—"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item label={t("orders.create.shipment.height")}>
              <InputNumber
                min={0}
                controls={false}
                addonAfter={t("orders.create.shipment.centimeters")}
                placeholder="—"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item label={t("orders.create.shipment.declaredValue")}>
              <InputNumber
                min={0}
                controls={false}
                addonAfter={t(drawerKey("uah"))}
                value={declaredValue}
                placeholder="0"
                style={{ width: "100%" }}
                onChange={(value) =>
                  onDeclaredValueChange(
                    typeof value === "number" ? value : null,
                  )
                }
              />
            </Form.Item>
          </S.ShipmentGrid>
          <Flex align="center" gap={6} style={{ marginTop: 12 }}>
            <InfoIcon size={14} />
            <Text type="secondary">{t("orders.create.shipment.hint")}</Text>
          </Flex>
        </S.ShipmentParamsBody>
      )}
    </S.SectionCard>
  );
}
