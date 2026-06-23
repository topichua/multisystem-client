import type { TagProps as AntdTagProps } from "antd";
import { Tag as AntdTag } from "antd";
import styled, { css } from "styled-components";

type SemanticTagColor = "success" | "error";

const semanticColorStyles: Record<SemanticTagColor, ReturnType<typeof css>> = {
  success: css`
    color: ${({ theme }) => theme.colors.functional.text.success}!important;
    background-color: ${({ theme }) =>
      theme.colors.functional.background.success}!important;
  `,
  error: css`
    color: ${({ theme }) => theme.colors.functional.text.error}!important;
    background-color: ${({ theme }) =>
      theme.colors.functional.background.error}!important;
  `,
};

const isSemanticTagColor = (
  color: AntdTagProps["color"],
): color is SemanticTagColor => color === "success" || color === "error";

export const TagRoot = styled(AntdTag)`
  && {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 28px;
    margin-inline-end: 0;
    padding: 2px 12px;
    border-color: transparent;
    border-radius: 999px;
    font-size: ${({ theme }) => theme.fontSize.base};
    font-weight: 700;
    line-height: 1.2;
    white-space: nowrap;
    letter-spacing: 0.3px;

    ${({ color }) =>
      isSemanticTagColor(color) ? semanticColorStyles[color] : undefined}
  }
`;
