import type { HTMLAttributes } from "react";
import styled from "styled-components";

export const DEFAULT_ROLE_DOT_SIZE = 10;

type DotProps = {
  $color: string;
  $size: number;
};

const Dot = styled.span<DotProps>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  flex: 0 0 auto;
  background: ${({ $color }) => $color};
`;

export type RoleDotProps = Omit<HTMLAttributes<HTMLSpanElement>, "color"> & {
  color: string;
  size?: number;
};

export const RoleDot = ({
  color,
  size = DEFAULT_ROLE_DOT_SIZE,
  ...props
}: RoleDotProps) => <Dot {...props} $color={color} $size={size} />;
