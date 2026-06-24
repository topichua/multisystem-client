import { Badge, theme } from "antd";

export const FilterLabel = ({
  label,
  count,
}: {
  label: string;
  count: number;
}) => {
  const { token } = theme.useToken();

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      {label}
      <Badge count={count} size="medium" color={token.colorPrimary} showZero />
    </span>
  );
};
