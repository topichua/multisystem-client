import { DownloadSimpleIcon } from "@phosphor-icons/react";
import {
  Button,
  Checkbox,
  Flex,
  Modal,
  Radio,
  Tag,
  Typography,
  theme,
} from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";

import type { OrderExportFormat } from "@/features/exports/model/export.types";
import { ordersApi } from "@/features/orders/api/orders-api";
import { useOrdersStore } from "@/features/orders/model/use-orders-store";

const { Text, Title } = Typography;

export type OrdersExportScope = "all" | "filtered";

export type OrdersExportFormValues = {
  scope: OrdersExportScope;
  format: OrderExportFormat;
  includeLineDetails: boolean;
};

type OrdersExportModalProps = {
  open: boolean;
  submitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: OrdersExportFormValues) => void;
};

const sectionLabelStyle: CSSProperties = {
  fontSize: 12,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

export const OrdersExportModal = observer(
  ({
    open,
    submitting = false,
    onCancel,
    onSubmit,
  }: OrdersExportModalProps) => {
    const { t } = useTranslation();
    const { token } = theme.useToken();
    const ordersStore = useOrdersStore();

    const hasActiveFilters =
      Boolean(ordersStore.listKeyword) ||
      ordersStore.appliedNonKeywordFilterCount > 0;

    const filteredTotal = ordersStore.total;
    const [allTotal, setAllTotal] = useState<number | null>(null);
    const [scope, setScope] = useState<OrdersExportScope>("filtered");
    const [format, setFormat] = useState<OrderExportFormat>("xlsx");
    const [includeLineDetails, setIncludeLineDetails] = useState(true);

    useEffect(() => {
      if (!open) {
        return;
      }

      setScope(hasActiveFilters ? "filtered" : "all");
      setFormat("xlsx");
      setIncludeLineDetails(true);
    }, [open, hasActiveFilters]);

    useEffect(() => {
      if (!open) {
        return;
      }

      if (!hasActiveFilters) {
        setAllTotal(filteredTotal);
        return;
      }

      let cancelled = false;
      setAllTotal(null);

      void ordersApi
        .list({ page: 1, pageSize: 1 })
        .then((response) => {
          if (!cancelled) {
            setAllTotal(response.total);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setAllTotal(filteredTotal);
          }
        });

      return () => {
        cancelled = true;
      };
    }, [open, hasActiveFilters, filteredTotal]);

    const selectedCount =
      scope === "all" ? (allTotal ?? filteredTotal) : filteredTotal;

    const optionStyle = (selected: boolean): CSSProperties => ({
      display: "flex",
      alignItems: "flex-start",
      width: "100%",
      marginInlineEnd: 0,
      padding: "12px 14px",
      borderRadius: token.borderRadiusLG,
      border: `1px solid ${selected ? token.colorPrimary : token.colorBorder}`,
      background: selected ? token.colorPrimaryBg : token.colorBgContainer,
    });

    return (
      <Modal
        destroyOnHidden
        centered
        open={open}
        title={t("orders.exportModal.title")}
        closable={!submitting}
        keyboard={!submitting}
        mask={{ closable: !submitting }}
        onCancel={onCancel}
        width={480}
        data-qa="orders-export-modal"
        footer={
          <Flex gap={8} justify="flex-end">
            <Button disabled={submitting} onClick={onCancel}>
              {t("orders.exportModal.cancel")}
            </Button>
            <Button
              type="primary"
              loading={submitting}
              disabled={selectedCount <= 0}
              icon={<DownloadSimpleIcon size={16} />}
              data-qa="orders-export-submit"
              onClick={() => onSubmit({ scope, format, includeLineDetails })}
            >
              {t("orders.exportModal.submit", { count: selectedCount })}
            </Button>
          </Flex>
        }
      >
        <Flex vertical gap={20}>
          <Text type="secondary">{t("orders.exportModal.description")}</Text>

          <Flex vertical gap={8}>
            <Text type="secondary" style={sectionLabelStyle}>
              {t("orders.exportModal.scopeSection")}
            </Text>
            <Radio.Group
              value={scope}
              onChange={(event) =>
                setScope(event.target.value as OrdersExportScope)
              }
              style={{ width: "100%" }}
            >
              <Flex vertical gap={8}>
                <Radio value="all" style={optionStyle(scope === "all")}>
                  <Flex
                    align="center"
                    justify="space-between"
                    gap={12}
                    style={{ flex: 1, minWidth: 0 }}
                  >
                    <span>{t("orders.exportModal.scopeAll")}</span>
                    <Text type="secondary">
                      {allTotal ?? (hasActiveFilters ? "…" : filteredTotal)}
                    </Text>
                  </Flex>
                </Radio>
                <Radio
                  value="filtered"
                  style={optionStyle(scope === "filtered")}
                >
                  <Flex
                    align="center"
                    justify="space-between"
                    gap={12}
                    style={{ flex: 1, minWidth: 0 }}
                  >
                    <span>{t("orders.exportModal.scopeFiltered")}</span>
                    <Text type="secondary">{filteredTotal}</Text>
                  </Flex>
                </Radio>
              </Flex>
            </Radio.Group>
          </Flex>

          <Flex vertical gap={8}>
            <Text type="secondary" style={sectionLabelStyle}>
              {t("orders.exportModal.formatSection")}
            </Text>
            <Radio.Group
              value={format}
              onChange={(event) =>
                setFormat(event.target.value as OrderExportFormat)
              }
              style={{ width: "100%" }}
            >
              <Flex vertical gap={8}>
                <Radio value="xlsx" style={optionStyle(format === "xlsx")}>
                  <Flex vertical gap={2}>
                    <Flex align="center" gap={8} wrap="wrap">
                      <Title level={5} style={{ margin: 0 }}>
                        {t("orders.exportModal.formatXlsx")}
                      </Title>
                      <Tag color="purple" style={{ margin: 0 }}>
                        {t("orders.exportModal.formatRecommended")}
                      </Tag>
                    </Flex>
                    <Text type="secondary">
                      {t("orders.exportModal.formatXlsxHint")}
                    </Text>
                  </Flex>
                </Radio>
                <Radio value="csv" style={optionStyle(format === "csv")}>
                  <Flex vertical gap={2}>
                    <Title level={5} style={{ margin: 0 }}>
                      {t("orders.exportModal.formatCsv")}
                    </Title>
                    <Text type="secondary">
                      {t("orders.exportModal.formatCsvHint")}
                    </Text>
                  </Flex>
                </Radio>
              </Flex>
            </Radio.Group>
          </Flex>

          <Flex vertical gap={8}>
            <Text type="secondary" style={sectionLabelStyle}>
              {t("orders.exportModal.contentSection")}
            </Text>
            <Checkbox
              checked={includeLineDetails}
              onChange={(event) => setIncludeLineDetails(event.target.checked)}
            >
              {t("orders.exportModal.includeLineDetails")}
            </Checkbox>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t("orders.exportModal.contentHint")}
            </Text>
          </Flex>
        </Flex>
      </Modal>
    );
  },
);
