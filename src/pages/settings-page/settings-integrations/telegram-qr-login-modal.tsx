import { XIcon } from "@phosphor-icons/react";
import {
  Badge,
  Button,
  Flex,
  Image,
  Modal,
  Spin,
  Typography,
  theme,
} from "antd";
import { Trans, useTranslation } from "react-i18next";

import { TelegramLogoIcon } from "@/components/icons/telegram/telegram-logo-icon";

export type TelegramQrLoginModalStatus =
  | "idle"
  | "loading"
  | "waiting"
  | "expired"
  | "error";

type TelegramQrLoginModalProps = {
  open: boolean;
  qrImageUrl: string | null;
  status: TelegramQrLoginModalStatus;
  onCancel: () => void;
  onRetry: () => void;
};

const statusToneByStatus: Record<
  TelegramQrLoginModalStatus,
  "secondary" | "warning" | "danger"
> = {
  idle: "secondary",
  loading: "secondary",
  waiting: "secondary",
  expired: "warning",
  error: "danger",
};

const badgeStatusByStatus: Record<
  TelegramQrLoginModalStatus,
  "processing" | "warning" | "error"
> = {
  idle: "processing",
  loading: "processing",
  waiting: "processing",
  expired: "warning",
  error: "error",
};

const statusKeyByStatus: Record<TelegramQrLoginModalStatus, string> = {
  idle: "integrations.telegramQr.status.loading",
  loading: "integrations.telegramQr.status.loading",
  waiting: "integrations.telegramQr.status.waiting",
  expired: "integrations.telegramQr.status.expired",
  error: "integrations.telegramQr.status.error",
};

export function TelegramQrLoginModal({
  open,
  qrImageUrl,
  status,
  onCancel,
  onRetry,
}: TelegramQrLoginModalProps) {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const showQrImage = qrImageUrl && status !== "loading";
  const showRetry = status === "expired" || status === "error";
  const statusTone = statusToneByStatus[status];

  return (
    <Modal
      centered
      closeIcon={<XIcon />}
      destroyOnHidden
      footer={null}
      open={open}
      title={null}
      width={510}
      onCancel={onCancel}
    >
      <Flex
        vertical
        align="center"
        gap={16}
        style={{
          paddingBlockStart: token.paddingSM,
          paddingBlockEnd: token.paddingXXS,
          paddingInline: token.paddingXS,
          textAlign: "center",
        }}
      >
        <TelegramLogoIcon size={56} />

        <Flex vertical align="center" gap={8}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {t("integrations.telegramQr.title")}
          </Typography.Title>
          <Typography.Text
            type="secondary"
            style={{
              fontSize: token.fontSizeLG,
              lineHeight: token.lineHeightLG,
            }}
          >
            {t("integrations.telegramQr.subtitle")}
          </Typography.Text>
        </Flex>

        <Flex
          align="center"
          justify="center"
          style={{
            width: "min(248px, 100%)",
            aspectRatio: "1",
            padding: token.padding,
            border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
            borderRadius: token.borderRadiusLG,
            background: token.colorWhite,
            opacity: status === "expired" ? 0.45 : 1,
          }}
        >
          {showQrImage ? (
            <Image
              preview={false}
              src={qrImageUrl}
              alt={t("integrations.telegramQr.imageAlt")}
              width="100%"
              height="100%"
              style={{ objectFit: "contain" }}
            />
          ) : (
            <Spin />
          )}
        </Flex>

        <ol
          style={{
            width: "min(390px, 100%)",
            marginBlock: `${token.marginXXS}px 0`,
            paddingInlineStart: 22,
            color: token.colorTextSecondary,
            fontSize: token.fontSizeLG,
            lineHeight: token.lineHeightLG,
            textAlign: "left",
          }}
        >
          <li>
            <Typography.Text type="secondary">
              <Trans
                i18nKey="integrations.telegramQr.steps.openTelegram"
                components={{ strong: <strong /> }}
              />
            </Typography.Text>
          </li>
          <li>
            <Typography.Text type="secondary">
              <Trans
                i18nKey="integrations.telegramQr.steps.openDevices"
                components={{ strong: <strong /> }}
              />
            </Typography.Text>
          </li>
          <li>
            <Typography.Text type="secondary">
              <Trans
                i18nKey="integrations.telegramQr.steps.connectDevice"
                components={{ strong: <strong /> }}
              />
            </Typography.Text>
          </li>
        </ol>

        <Flex align="center" justify="center" gap={8} style={{ minHeight: 32 }}>
          {status === "loading" || status === "idle" ? (
            <>
              <Spin size="small" />
              <Typography.Text type="secondary">
                {t(statusKeyByStatus[status])}
              </Typography.Text>
            </>
          ) : (
            <Badge
              status={badgeStatusByStatus[status]}
              text={
                <Typography.Text type={statusTone}>
                  {t(statusKeyByStatus[status])}
                </Typography.Text>
              }
            />
          )}
        </Flex>

        {showRetry ? (
          <Button type="primary" onClick={onRetry}>
            {t("integrations.telegramQr.retry")}
          </Button>
        ) : null}
      </Flex>
    </Modal>
  );
}
