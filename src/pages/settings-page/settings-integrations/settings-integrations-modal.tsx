import {
  ApiOutlined,
  CloseOutlined,
  InstagramOutlined,
  MessageOutlined,
  SendOutlined,
  ShopOutlined,
  TruckOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Col,
  Flex,
  Modal,
  Row,
  Space,
  Spin,
  Typography,
} from "antd";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { openIntegrationAuthWindow } from "@/features/integrations/open-integration-auth";

export type AddIntegrationType =
  | "instagram"
  | "telegram"
  | "whatsapp"
  | "nova-poshta"
  | "tiktok"
  | "prom";

type AddIntegrationItem = {
  type: AddIntegrationType;
  titleKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
};

type AddIntegrationGroup = {
  titleKey: string;
  items: AddIntegrationItem[];
};

type AddIntegrationModalProps = {
  open: boolean;
  onCancel: () => void;
  onSelectIntegration: (
    type: AddIntegrationType,
    authWindow: Window | null,
  ) => Promise<void> | void;
};

const INTEGRATION_GROUPS: AddIntegrationGroup[] = [
  {
    titleKey: "integrations.modal.groupSocial",
    items: [
      {
        type: "instagram",
        titleKey: "integrations.modal.items.instagram.title",
        descriptionKey: "integrations.modal.items.instagram.description",
        icon: <InstagramOutlined />,
      },
      {
        type: "telegram",
        titleKey: "integrations.modal.items.telegram.title",
        descriptionKey: "integrations.modal.items.telegram.description",
        icon: <SendOutlined />,
      },
      {
        type: "whatsapp",
        titleKey: "integrations.modal.items.whatsapp.title",
        descriptionKey: "integrations.modal.items.whatsapp.description",
        icon: <WhatsAppOutlined />,
      },
    ],
  },
  {
    titleKey: "integrations.modal.groupDelivery",
    items: [
      {
        type: "nova-poshta",
        titleKey: "integrations.modal.items.novaPoshta.title",
        descriptionKey: "integrations.modal.items.novaPoshta.description",
        icon: <TruckOutlined />,
      },
    ],
  },
  {
    titleKey: "integrations.modal.groupOther",
    items: [
      {
        type: "tiktok",
        titleKey: "integrations.modal.items.tiktok.title",
        descriptionKey: "integrations.modal.items.tiktok.description",
        icon: <MessageOutlined />,
      },
      {
        type: "prom",
        titleKey: "integrations.modal.items.prom.title",
        descriptionKey: "integrations.modal.items.prom.description",
        icon: <ShopOutlined />,
      },
    ],
  },
];

export const AddIntegrationModal = ({
  open,
  onCancel,
  onSelectIntegration,
}: AddIntegrationModalProps) => {
  const { t } = useTranslation();
  const [loadingType, setLoadingType] = useState<AddIntegrationType | null>(
    null,
  );

  const handleSelectIntegration = useCallback(
    async (type: AddIntegrationType) => {
      setLoadingType(type);
      const authWindow = openIntegrationAuthWindow();

      try {
        await onSelectIntegration(type, authWindow);
      } finally {
        setLoadingType(null);
      }
    },
    [onSelectIntegration],
  );

  const isLoading = loadingType !== null;

  return (
    <Modal
      title={
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {t("integrations.modal.title")}
          </Typography.Title>

          <Typography.Text type="secondary">
            {t("integrations.modal.subtitle")}
          </Typography.Text>
        </div>
      }
      open={open}
      footer={null}
      width={760}
      closeIcon={<CloseOutlined />}
      onCancel={onCancel}
      destroyOnHidden
    >
      <Space
        direction="vertical"
        size={32}
        style={{ width: "100%", marginTop: 24 }}
      >
        {INTEGRATION_GROUPS.map((group) => (
          <Space
            key={group.titleKey}
            direction="vertical"
            size={12}
            style={{ width: "100%" }}
          >
            <Typography.Title level={5} style={{ margin: 0 }}>
              {t(group.titleKey)}
            </Typography.Title>

            <Row gutter={[12, 12]}>
              {group.items.map((item) => (
                <Col key={item.type} xs={24} sm={12} md={8}>
                  <Spin spinning={loadingType === item.type}>
                    <Card
                      hoverable
                      size="small"
                      onClick={() => {
                        if (!isLoading) {
                          void handleSelectIntegration(item.type);
                        }
                      }}
                    >
                      <Flex align="center" gap={12}>
                        <Avatar size={40} shape="square" icon={item.icon} />

                        <div>
                          <Typography.Text strong>
                            {t(item.titleKey)}
                          </Typography.Text>

                          <Typography.Paragraph
                            type="secondary"
                            style={{ margin: 0, fontSize: 12 }}
                          >
                            {t(item.descriptionKey)}
                          </Typography.Paragraph>
                        </div>
                      </Flex>
                    </Card>
                  </Spin>
                </Col>
              ))}
            </Row>
          </Space>
        ))}

        <Typography.Text type="secondary">
          {t("integrations.modal.suggestPrefix")}{" "}
          <Button
            type="link"
            size="small"
            icon={<ApiOutlined />}
            style={{ padding: 0 }}
          >
            {t("integrations.modal.suggestCta")}
          </Button>
        </Typography.Text>
      </Space>
    </Modal>
  );
};
