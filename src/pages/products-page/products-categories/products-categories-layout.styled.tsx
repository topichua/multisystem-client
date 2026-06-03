import styled from "styled-components";

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
`;

export const CategoryNavIcon = styled.div<{ $active: boolean }>`
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  color: ${({ $active }) => ($active ? "#6f55d9" : "#8c8c8c")};
  background: ${({ $active }) => ($active ? "#eee9ff" : "#f5f5f5")};
`;
