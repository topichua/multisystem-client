import { Button, Flex, Typography } from "antd";

const { Text } = Typography;

type MessageFailureActionsProps = {
  error?: string;
  resendLabel: string;
  onResend: () => void;
};

export const MessageFailureActions = ({
  error,
  resendLabel,
  onResend,
}: MessageFailureActionsProps) => (
  <Flex align="center" gap={8} wrap="wrap" style={{ marginTop: 8 }}>
    {error != null && error !== "" && (
      <Text type="danger" style={{ fontSize: 12 }}>
        {error}
      </Text>
    )}

    <Button type="link" size="small" onClick={onResend}>
      {resendLabel}
    </Button>
  </Flex>
);
