import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DotsSixVerticalIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import styled from "styled-components";

const Row = styled.div<{ $isDragging: boolean }>`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  opacity: ${({ $isDragging }) => ($isDragging ? 0.7 : 1)};
  position: relative;
  z-index: ${({ $isDragging }) => ($isDragging ? 1 : "auto")};
`;

const DragHandle = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--ant-color-text-tertiary, rgba(0, 0, 0, 0.45));
  cursor: grab;
  touch-action: none;

  &:hover {
    background: var(--ant-color-bg-text-hover, rgba(0, 0, 0, 0.06));
  }

  &:active {
    cursor: grabbing;
  }
`;

type SortableCharacteristicRowProps = {
  id: number;
  dragLabel: string;
  children: ReactNode;
};

export function SortableCharacteristicRow({
  id,
  dragLabel,
  children,
}: SortableCharacteristicRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <Row
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      $isDragging={isDragging}
    >
      <DragHandle
        type="button"
        aria-label={dragLabel}
        {...attributes}
        {...listeners}
      >
        <DotsSixVerticalIcon size={18} aria-hidden />
      </DragHandle>
      {children}
    </Row>
  );
}
