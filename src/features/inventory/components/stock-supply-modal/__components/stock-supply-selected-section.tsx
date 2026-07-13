import { Alert, Button, Empty, Flex, Input, Typography } from "antd";

import type { SupplyLine } from "../stock-supply-modal.types";
import * as S from "../stock-supply-modal.styled";
import { SupplySelectedLine } from "./supply-selected-line";

const { Text } = Typography;

type StockSupplySelectedSectionProps = {
  t: ReturnType<typeof import("react-i18next").useTranslation>["t"];
  selectedLines: SupplyLine[];
  comment: string;
  submitError: string | null;
  onCommentChange: (value: string) => void;
  onClear: () => void;
  onUpdateLine: (
    variantId: number,
    patch: Partial<Omit<SupplyLine, "variant">>,
  ) => void;
  onRemoveLine: (variantId: number) => void;
};

export const StockSupplySelectedSection = ({
  t,
  selectedLines,
  comment,
  submitError,
  onCommentChange,
  onClear,
  onUpdateLine,
  onRemoveLine,
}: StockSupplySelectedSectionProps) => (
  <S.SupplyColumn>
    <Flex align="center" justify="space-between" gap={12}>
      <Text strong>
        {t("products.stockSupply.inSupply")}{" "}
        <S.CountPill>{selectedLines.length}</S.CountPill>
      </Text>
      {selectedLines.length > 0 ? (
        <Button type="link" size="small" onClick={onClear}>
          {t("products.stockSupply.clear")}
        </Button>
      ) : null}
    </Flex>

    <S.SelectedHeader>
      <span>{t("products.stockSupply.variantColumn")}</span>
      <span>{t("products.stockSupply.availableColumn")}</span>
      <span>{t("products.stockSupply.quantityColumn")}</span>
      <span>{t("products.stockSupply.buyPriceColumn")}</span>
      <span />
    </S.SelectedHeader>

    <Flex vertical style={{ minHeight: 70, flex: "0 0 auto" }}>
      {selectedLines.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("products.stockSupply.emptySelected")}
        />
      ) : (
        selectedLines.map((line) => (
          <SupplySelectedLine
            key={line.variant.id}
            line={line}
            onUpdate={onUpdateLine}
            onRemove={onRemoveLine}
          />
        ))
      )}
    </Flex>

    <Flex vertical gap={8}>
      <Text>{t("products.stockSupply.commentLabel")}</Text>
      <Input.TextArea
        value={comment}
        rows={3}
        placeholder={t("products.stockSupply.commentPlaceholder")}
        onChange={(event) => onCommentChange(event.target.value)}
      />
    </Flex>

    {submitError && <Alert type="error" title={submitError} showIcon />}
  </S.SupplyColumn>
);
