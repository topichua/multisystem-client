import styled from "styled-components";

import { GroupColorSwatch } from "./group-select-visuals";

const Row = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const Name = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export type GroupListLabelRowProps = {
  name: string;
  color: string;
};

export const GroupListLabelRow = ({ name, color }: GroupListLabelRowProps) => (
  <Row>
    <GroupColorSwatch color={color} size={10} shape="circle" />
    <Name>{name}</Name>
  </Row>
);
