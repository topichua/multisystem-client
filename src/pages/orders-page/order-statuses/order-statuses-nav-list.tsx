import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DotsSixVerticalIcon } from '@phosphor-icons/react';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { GroupListLabelRow } from '@/features/conversation-groups/components/group-list-label-row';
import type { OrderStatus } from '@/features/orders/model/order.types';
import { formatOrderStatusName } from '@/features/orders/utils/format-order-status-name';

const NavList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const NavItem = styled.li<{ $selected: boolean; $isDragging: boolean }>`
  display: flex;
  align-items: stretch;
  margin: 4px 8px;
  border-radius: 8px;
  background: ${({ $selected }) =>
    $selected
      ? 'var(--ant-menu-item-selected-bg, var(--ant-color-primary-bg, #e6f4ff))'
      : 'transparent'};
  opacity: ${({ $isDragging }) => ($isDragging ? 0.65 : 1)};
  box-shadow: ${({ $isDragging }) =>
    $isDragging ? 'var(--ant-box-shadow-secondary, 0 2px 8px rgba(0, 0, 0, 0.12))' : 'none'};

  &:hover {
    background: ${({ $selected }) =>
      $selected
        ? 'var(--ant-menu-item-selected-bg, var(--ant-color-primary-bg, #e6f4ff))'
        : 'var(--ant-color-bg-text-hover, rgba(0, 0, 0, 0.06))'};
  }
`;

const DragHandle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 28px;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 8px 0 0 8px;
  background: transparent;
  color: var(--ant-color-text-tertiary, rgba(0, 0, 0, 0.45));
  cursor: grab;
  touch-action: none;

  &:active {
    cursor: grabbing;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  min-height: 40px;
  margin: 0;
  padding: 0 12px 0 0;
  border: none;
  border-radius: 0 8px 8px 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;
`;

type SortableOrderStatusNavItemProps = {
  status: OrderStatus;
  selected: boolean;
  disabled: boolean;
  onSelect: (statusId: number) => void;
};

const SortableOrderStatusNavItem = ({
  status,
  selected,
  disabled,
  onSelect,
}: SortableOrderStatusNavItemProps) => {
  const { t } = useTranslation();
  const displayName = formatOrderStatusName(
    status.name,
    status.isDefault,
    t('orderStatuses.defaultLabel'),
  );
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: status.id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <NavItem
      ref={setNodeRef}
      style={style}
      role="listitem"
      data-status-id={status.id}
      data-qa={`order-status-nav-item-${status.id}`}
      $selected={selected}
      $isDragging={isDragging}
    >
      <DragHandle
        type="button"
        aria-label={t('orderStatuses.dragHandleAria')}
        disabled={disabled}
        {...attributes}
        {...listeners}
      >
        <DotsSixVerticalIcon size={18} aria-hidden />
      </DragHandle>
      <NavButton
        type="button"
        aria-current={selected ? 'page' : undefined}
        onClick={() => onSelect(status.id)}
      >
        <GroupListLabelRow name={displayName} color={status.color} />
      </NavButton>
    </NavItem>
  );
};

export type OrderStatusesNavListProps = {
  statuses: OrderStatus[];
  selectedStatusId: number | null;
  reorderDisabled?: boolean;
  onSelect: (statusId: number) => void;
  onReorder: (ids: number[]) => void;
};

export const OrderStatusesNavList = ({
  statuses,
  selectedStatusId,
  reorderDisabled = false,
  onSelect,
  onReorder,
}: OrderStatusesNavListProps) => {
  const statusIds = useMemo(() => statuses.map((status) => status.id), [statuses]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over == null || active.id === over.id) {
        return;
      }

      const oldIndex = statuses.findIndex((status) => status.id === active.id);
      const newIndex = statuses.findIndex((status) => status.id === over.id);
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) {
        return;
      }

      const next = [...statuses];
      const [moved] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, moved);

      onReorder(next.map((status) => status.id));
    },
    [onReorder, statuses],
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={statusIds} strategy={verticalListSortingStrategy}>
        <NavList role="list" data-qa="order-statuses-nav-list">
          {statuses.map((status) => (
            <SortableOrderStatusNavItem
              key={status.id}
              status={status}
              selected={selectedStatusId === status.id}
              disabled={reorderDisabled}
              onSelect={onSelect}
            />
          ))}
        </NavList>
      </SortableContext>
    </DndContext>
  );
};
