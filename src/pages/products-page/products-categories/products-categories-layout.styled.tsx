import styled from "styled-components";

import { BRAND_PRIMARY } from "@/styled/brand";

export const CategoryNavItem = styled.button<{ $active: boolean }>`
  width: 100%;
  padding: 12px;
  border: 0;
  border-radius: 8px;
  background: ${({ $active }) => ($active ? "#f4f1ff" : "transparent")};
  cursor: pointer;
  text-align: left;
  margin-bottom: 4px;

  &:hover {
    background: ${({ $active }) => ($active ? "#f4f1ff" : "#f5f5f5")};
  }

  &:focus-visible {
    outline: 2px solid ${BRAND_PRIMARY};
    outline-offset: 2px;
  }
`;

export const CategoryNavIcon = styled.div<{ $active: boolean }>`
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  color: ${({ $active }) => ($active ? BRAND_PRIMARY : "#8c8c8c")};
  background: ${({ $active }) => ($active ? "#eee9ff" : "#f5f5f5")};
`;
