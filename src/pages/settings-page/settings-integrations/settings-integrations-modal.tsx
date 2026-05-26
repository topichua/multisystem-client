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

export type AddIntegrationType =
  | "instagram"
  | "telegram"
  | "whatsapp"
  | "nova-poshta"
  | "tiktok"
  | "prom";

type AddIntegrationItem = {
  type: AddIntegrationType;
  title: string;
  description: string;
  icon: React.ReactNode;
};

type AddIntegrationGroup = {
  title: string;
  items: AddIntegrationItem[];
};

type AddIntegrationModalProps = {
  open: boolean;
  onCancel: () => void;
  onSelectIntegration: (type: AddIntegrationType) => Promise<void> | void;
};

const INTEGRATION_GROUPS: AddIntegrationGroup[] = [
  {
    title: "Social networks and messengers",
    items: [
      {
        type: "instagram",
        title: "Instagram",
        description: "Connect Instagram account",
        icon: <InstagramOutlined />,
      },
      {
        type: "telegram",
        title: "Telegram",
        description: "Connect Telegram bot",
        icon: <SendOutlined />,
      },
      {
        type: "whatsapp",
        title: "WhatsApp",
        description: "Connect WhatsApp Business",
        icon: <WhatsAppOutlined />,
      },
    ],
  },
  {
    title: "Delivery",
    items: [
      {
        type: "nova-poshta",
        title: "Nova Poshta",
        description: "Connect warehouse and delivery settings",
        icon: <TruckOutlined />,
      },
    ],
  },
  {
    title: "Other services",
    items: [
      {
        type: "tiktok",
        title: "TikTok",
        description: "Connect TikTok account",
        icon: <MessageOutlined />,
      },
      {
        type: "prom",
        title: "Prom",
        description: "Connect Prom store",
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
  const [loadingType, setLoadingType] = useState<AddIntegrationType | null>(
    null,
  );

  const handleSelectIntegration = useCallback(
    async (type: AddIntegrationType) => {
      setLoadingType(type);

      try {
        await onSelectIntegration(type);
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
            Add integration
          </Typography.Title>

          <Typography.Text type="secondary">
            Select the service you want to connect
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
            key={group.title}
            direction="vertical"
            size={12}
            style={{ width: "100%" }}
          >
            <Typography.Title level={5} style={{ margin: 0 }}>
              {group.title}
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
                          <Typography.Text strong>{item.title}</Typography.Text>

                          <Typography.Paragraph
                            type="secondary"
                            style={{ margin: 0, fontSize: 12 }}
                          >
                            {item.description}
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
          Didn&apos;t find the required service?{" "}
          <Button
            type="link"
            size="small"
            icon={<ApiOutlined />}
            style={{ padding: 0 }}
          >
            Suggest integration
          </Button>
        </Typography.Text>
      </Space>
    </Modal>
  );
};
