import styled from "styled-components";

export const MemberWorkStatusDot = styled.span<{ $color: string }>`
  display: block;
  width: 8px;
  height: 8px;
  min-width: 8px;
  max-width: 8px;
  min-height: 8px;
  max-height: 8px;
  flex: 0 0 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;
