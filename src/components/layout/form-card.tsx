import type { CardProps, DividerProps } from "antd";
import { Card, Divider } from "antd";

const formCardStyle = {
  width: "100%",
  maxWidth: 960,
  margin: "0 auto",
} as const;

export function FormCard({ styles, style, ...props }: CardProps) {
  return (
    <Card
      {...props}
      style={{ ...formCardStyle, ...style }}
      styles={{
        body: { padding: 24 },
        ...styles,
      }}
    />
  );
}

export function FormDivider(props: DividerProps) {
  return <Divider style={{ margin: "24px 0" }} {...props} />;
}
