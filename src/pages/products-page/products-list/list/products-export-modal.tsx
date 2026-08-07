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

import type { ProductExportFormat } from "@/features/exports/model/export.types";
import { productsApi } from "@/features/products/api/products-api";
import { useProductsStore } from "@/features/products/model/use-products-store";

const { Text, Title } = Typography;

export type ProductsExportScope = "all" | "filtered";

export type ProductsExportFormValues = {
  scope: ProductsExportScope;
  format: ProductExportFormat;
  includeAllFields: boolean;
};

type ProductsExportModalProps = {
  open: boolean;
  submitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: ProductsExportFormValues) => void;
};

const sectionLabelStyle: CSSProperties = {
  fontSize: 12,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

export const ProductsExportModal = observer(
  ({
    open,
    submitting = false,
    onCancel,
    onSubmit,
  }: ProductsExportModalProps) => {
    const { t } = useTranslation();
    const { token } = theme.useToken();
    const productsStore = useProductsStore();

    const hasActiveFilters = productsStore.hasActiveListFilters;
    const filteredTotal = productsStore.total;
    const [allTotal, setAllTotal] = useState<number | null>(null);
    const [scope, setScope] = useState<ProductsExportScope>("filtered");
    const [format, setFormat] = useState<ProductExportFormat>("xlsx");
    const [includeAllFields, setIncludeAllFields] = useState(true);

    useEffect(() => {
      if (!open) {
        return;
      }

      setScope(hasActiveFilters ? "filtered" : "all");
      setFormat("xlsx");
      setIncludeAllFields(true);
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

      void productsApi
        .list({ sort: "created_desc", page: 1, pageSize: 1 })
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
        title={t("products.exportModal.title")}
        closable={!submitting}
        keyboard={!submitting}
        mask={{ closable: !submitting }}
        onCancel={onCancel}
        width={480}
        data-qa="products-export-modal"
        footer={
          <Flex gap={8} justify="flex-end">
            <Button disabled={submitting} onClick={onCancel}>
              {t("products.exportModal.cancel")}
            </Button>
            <Button
              type="primary"
              loading={submitting}
              disabled={selectedCount <= 0}
              icon={<DownloadSimpleIcon size={16} />}
              data-qa="products-export-submit"
              onClick={() => onSubmit({ scope, format, includeAllFields })}
            >
              {t("products.exportModal.submit", { count: selectedCount })}
            </Button>
          </Flex>
        }
      >
        <Flex vertical gap={20}>
          <Flex vertical gap={8}>
            <Text type="secondary" style={sectionLabelStyle}>
              {t("products.exportModal.scopeSection")}
            </Text>
            <Radio.Group
              value={scope}
              onChange={(event) =>
                setScope(event.target.value as ProductsExportScope)
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
                    <span>{t("products.exportModal.scopeAll")}</span>
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
                    <span>{t("products.exportModal.scopeFiltered")}</span>
                    <Text type="secondary">{filteredTotal}</Text>
                  </Flex>
                </Radio>
              </Flex>
            </Radio.Group>
          </Flex>

          <Flex vertical gap={8}>
            <Text type="secondary" style={sectionLabelStyle}>
              {t("products.exportModal.formatSection")}
            </Text>
            <Radio.Group
              value={format}
              onChange={(event) =>
                setFormat(event.target.value as ProductExportFormat)
              }
              style={{ width: "100%" }}
            >
              <Flex vertical gap={8}>
                <Radio value="xlsx" style={optionStyle(format === "xlsx")}>
                  <Flex vertical gap={2}>
                    <Flex align="center" gap={8} wrap="wrap">
                      <Title level={5} style={{ margin: 0 }}>
                        {t("products.exportModal.formatXlsx")}
                      </Title>
                      <Tag color="purple" style={{ margin: 0 }}>
                        {t("products.exportModal.formatRecommended")}
                      </Tag>
                    </Flex>
                    <Text type="secondary">
                      {t("products.exportModal.formatXlsxHint")}
                    </Text>
                  </Flex>
                </Radio>
                <Radio value="csv" style={optionStyle(format === "csv")}>
                  <Flex vertical gap={2}>
                    <Title level={5} style={{ margin: 0 }}>
                      {t("products.exportModal.formatCsv")}
                    </Title>
                    <Text type="secondary">
                      {t("products.exportModal.formatCsvHint")}
                    </Text>
                  </Flex>
                </Radio>
              </Flex>
            </Radio.Group>
          </Flex>

          <Flex vertical gap={8}>
            <Text type="secondary" style={sectionLabelStyle}>
              {t("products.exportModal.contentSection")}
            </Text>
            <Checkbox
              checked={includeAllFields}
              onChange={(event) => setIncludeAllFields(event.target.checked)}
            >
              {t("products.exportModal.includeAllFields")}
            </Checkbox>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t("products.exportModal.contentHint")}
            </Text>
          </Flex>
        </Flex>
      </Modal>
    );
  },
);
