import styled from "styled-components";

const Row = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const Swatch = styled.span<{
  $color: string;
  $shape: "circle" | "square";
  $size: number;
}>`
  display: inline-block;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: ${({ $shape, $size }) =>
    $shape === "circle" ? "50%" : $size > 12 ? "4px" : "2px"};
  background: ${({ $color }) => $color};
  border: 1px solid rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
`;

const Name = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export type ColorLabelRowProps = {
  color: string;
  name: string;
  shape?: "circle" | "square";
  swatchSize?: number;
};

export const ColorLabelRow = ({
  color,
  name,
  shape = "circle",
  swatchSize = 10,
}: ColorLabelRowProps) => (
  <Row>
    <Swatch $color={color} $shape={shape} $size={swatchSize} />
    <Name>{name}</Name>
  </Row>
);
