import type { ReactNode } from "react";
import { Typography } from "antd";

const { Text } = Typography;

type SuppliesFilterFieldProps = {
  label: string;
  children: ReactNode;
};

export const SuppliesFilterField = ({
  label,
  children,
}: SuppliesFilterFieldProps) => (
  <div>
    <Text strong style={{ display: "block", marginBottom: 8 }}>
      {label}
    </Text>
    {children}
  </div>
);
