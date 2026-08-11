import { CheckIcon } from "@phosphor-icons/react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Flex,
  Row,
  Spin,
  Typography,
  theme,
} from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { characteristicsApi } from "@/features/characteristics/api/characteristics-api";
import type { CharacteristicLibraryGroup } from "@/features/characteristics/model/characteristic.types";
import { useCharacteristicsStore } from "@/features/characteristics/model/use-characteristics-store";
import { useNotification } from "@/shared/components/notification/use-notification";

import { LIBRARY_GROUP_ICONS } from "./characteristic-library.constants";

const { Title, Paragraph, Text } = Typography;

type CharacteristicsLibraryGroupsSetupProps = {
  onBack: () => void;
};

export const CharacteristicsLibraryGroupsSetup = ({
  onBack,
}: CharacteristicsLibraryGroupsSetupProps) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const store = useCharacteristicsStore();
  const notification = useNotification();

  const [groups, setGroups] = useState<CharacteristicLibraryGroup[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setLoadError(false);

      try {
        const library = await characteristicsApi.getLibrary();
        if (cancelled) {
          return;
        }

        setGroups(
          [...library.groups].sort(
            (left, right) => left.sortOrder - right.sortOrder,
          ),
        );
      } catch {
        if (!cancelled) {
          setLoadError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleGroup = (groupKey: string) => {
    setSelectedKeys((current) =>
      current.includes(groupKey)
        ? current.filter((key) => key !== groupKey)
        : [...current, groupKey],
    );
  };

  const handleSubmit = async () => {
    if (selectedKeys.length === 0 || submitting) {
      return;
    }

    setSubmitting(true);

    try {
      const installedCount = await store.installLibraryGroups(selectedKeys);

      notification.success({
        title: t("characteristics.library.setupSuccess", {
          count: installedCount,
        }),
      });
    } catch (error) {
      notification.error({
        title: getApiErrorMessage(
          error,
          t("characteristics.library.installFailed"),
        ),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Flex
      vertical
      align="center"
      justify="center"
      flex={1}
      style={{ minHeight: 0, overflow: "auto", padding: 32 }}
      data-qa="layout-products-characteristics-library-setup"
    >
      <Flex vertical align="center" gap={24} style={{ width: "100%", maxWidth: 720 }}>
        <Flex vertical align="center" style={{ textAlign: "center" }}>
          <Title level={4} style={{ margin: 0 }}>
            {t("characteristics.library.setupTitle")}
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 0, maxWidth: 480 }}>
            {t("characteristics.library.setupDescription")}
          </Paragraph>
        </Flex>

        {loading ? (
          <Spin />
        ) : loadError ? (
          <Alert
            type="error"
            showIcon
            description={t("characteristics.library.loadFailed")}
          />
        ) : (
          <Row gutter={[12, 12]} style={{ width: "100%" }}>
            {groups.map((group) => {
              const selected = selectedKeys.includes(group.key);

              return (
                <Col key={group.key} xs={24} sm={12} md={8}>
                  <Card
                    hoverable
                    size="small"
                    onClick={() => toggleGroup(group.key)}
                    style={{
                      borderColor: selected
                        ? token.colorPrimary
                        : token.colorBorderSecondary,
                      background: selected
                        ? token.colorPrimaryBg
                        : token.colorBgContainer,
                    }}
                  >
                    <Flex vertical align="center" gap={8}>
                      <Flex justify="flex-end" style={{ width: "100%" }}>
                        <Checkbox checked={selected} style={{ pointerEvents: "none" }} />
                      </Flex>
                      <Text style={{ fontSize: 36, lineHeight: 1 }}>
                        {LIBRARY_GROUP_ICONS[group.icon] ?? "📦"}
                      </Text>
                      <Text strong>{group.label}</Text>
                    </Flex>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}

        <Flex gap={8} wrap="wrap" justify="center">
          <Button onClick={onBack} disabled={submitting}>
            {t("characteristics.library.setupBack")}
          </Button>
          <Button
            type="primary"
            icon={<CheckIcon size={16} />}
            loading={submitting}
            disabled={selectedKeys.length === 0 || loading || loadError}
            onClick={() => {
              void handleSubmit();
            }}
          >
            {t("characteristics.library.setupSubmit", {
              count: selectedKeys.length,
            })}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};
