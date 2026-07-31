import { css, keyframes } from "styled-components";

import {
  PRODUCT_VARIANT_SCROLL_HIGHLIGHT_CLASS,
  PRODUCT_VARIANT_SCROLL_HIGHLIGHT_DURATION,
} from "./scroll-to-product-variant";

const highlightTopBottom = keyframes`
  0%,
  100% {
    box-shadow:
      inset 0 2px 0 0 transparent,
      inset 0 -2px 0 0 transparent;
  }
  12%,
  70% {
    box-shadow:
      inset 0 2px 0 0 var(--product-variant-highlight-color),
      inset 0 -2px 0 0 var(--product-variant-highlight-color);
  }
`;

const highlightFirstCell = keyframes`
  0%,
  100% {
    box-shadow:
      inset 2px 0 0 0 transparent,
      inset 0 2px 0 0 transparent,
      inset 0 -2px 0 0 transparent;
  }
  12%,
  70% {
    box-shadow:
      inset 2px 0 0 0 var(--product-variant-highlight-color),
      inset 0 2px 0 0 var(--product-variant-highlight-color),
      inset 0 -2px 0 0 var(--product-variant-highlight-color);
  }
`;

const highlightLastCell = keyframes`
  0%,
  100% {
    box-shadow:
      inset -2px 0 0 0 transparent,
      inset 0 2px 0 0 transparent,
      inset 0 -2px 0 0 transparent;
  }
  12%,
  70% {
    box-shadow:
      inset -2px 0 0 0 var(--product-variant-highlight-color),
      inset 0 2px 0 0 var(--product-variant-highlight-color),
      inset 0 -2px 0 0 var(--product-variant-highlight-color);
  }
`;

const highlightOnlyCell = keyframes`
  0%,
  100% {
    box-shadow: inset 0 0 0 2px transparent;
  }
  12%,
  70% {
    box-shadow: inset 0 0 0 2px var(--product-variant-highlight-color);
  }
`;

const highlightCard = keyframes`
  0%,
  100% {
    box-shadow: 0 0 0 2px transparent;
  }
  12%,
  70% {
    box-shadow: 0 0 0 2px var(--product-variant-highlight-color);
  }
`;

/** One continuous rounded border around an Ant Design table row. */
export const productVariantTableRowHighlightCss = css`
  --product-variant-highlight-color: ${({ theme }) =>
    theme.colors.functional.link.hover};

  .ant-table-tbody > tr.${PRODUCT_VARIANT_SCROLL_HIGHLIGHT_CLASS} > td {
    animation: ${highlightTopBottom}
      ${PRODUCT_VARIANT_SCROLL_HIGHLIGHT_DURATION} ease-out forwards;
  }

  .ant-table-tbody
    > tr.${PRODUCT_VARIANT_SCROLL_HIGHLIGHT_CLASS}
    > td:first-child {
    border-top-left-radius: ${({ theme }) => theme.radius.semiLarge};
    border-bottom-left-radius: ${({ theme }) => theme.radius.semiLarge};
    animation: ${highlightFirstCell}
      ${PRODUCT_VARIANT_SCROLL_HIGHLIGHT_DURATION} ease-out forwards;
  }

  .ant-table-tbody
    > tr.${PRODUCT_VARIANT_SCROLL_HIGHLIGHT_CLASS}
    > td:last-child {
    border-top-right-radius: ${({ theme }) => theme.radius.semiLarge};
    border-bottom-right-radius: ${({ theme }) => theme.radius.semiLarge};
    animation: ${highlightLastCell} ${PRODUCT_VARIANT_SCROLL_HIGHLIGHT_DURATION}
      ease-out forwards;
  }

  .ant-table-tbody
    > tr.${PRODUCT_VARIANT_SCROLL_HIGHLIGHT_CLASS}
    > td:first-child:last-child {
    border-radius: ${({ theme }) => theme.radius.semiLarge};
    animation: ${highlightOnlyCell} ${PRODUCT_VARIANT_SCROLL_HIGHLIGHT_DURATION}
      ease-out forwards;
  }
`;

/** Rounded border pulse for a standalone variant card. */
export const productVariantCardHighlightCss = css`
  --product-variant-highlight-color: ${({ theme }) =>
    theme.colors.functional.link.hover};

  &.${PRODUCT_VARIANT_SCROLL_HIGHLIGHT_CLASS} {
    animation: ${highlightCard} ${PRODUCT_VARIANT_SCROLL_HIGHLIGHT_DURATION}
      ease-out forwards;
  }
`;
