import { Spin } from "antd";

type CenteredSpinnerProps = {
  minHeight?: number | string;
  size?: "small" | "default" | "large";
};

export function CenteredSpinner({
  minHeight = 240,
  size,
}: CenteredSpinnerProps) {
  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        justifyContent: "center",
        minHeight,
        width: "100%",
      }}
    >
      <Spin size={size} />
    </div>
  );
}
