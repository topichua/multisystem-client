import { Alert } from "antd";

type InstagramMediaAlertsProps = {
  mediaError?: string | null;
  productReferencesError?: string | null;
};

export const InstagramMediaAlerts = ({
  mediaError,
  productReferencesError,
}: InstagramMediaAlertsProps) => (
  <>
    {mediaError && (
      <Alert
        type="error"
        showIcon
        title={mediaError}
        style={{ marginBottom: 16 }}
      />
    )}

    {productReferencesError && (
      <Alert
        type="warning"
        showIcon
        title={productReferencesError}
        style={{ marginBottom: 16 }}
      />
    )}
  </>
);
