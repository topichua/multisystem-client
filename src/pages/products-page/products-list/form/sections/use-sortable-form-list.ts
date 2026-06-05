import {
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { FormListFieldData } from "antd/es/form/FormList";

export function useSortableFormListSensors() {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
}

export function moveSortableFormListItem(
  fields: FormListFieldData[],
  move: (from: number, to: number) => void,
  event: DragEndEvent,
): void {
  const { active, over } = event;
  if (over == null || active.id === over.id) {
    return;
  }

  const oldIndex = fields.findIndex((field) => field.key === active.id);
  const newIndex = fields.findIndex((field) => field.key === over.id);
  if (oldIndex < 0 || newIndex < 0) {
    return;
  }

  move(oldIndex, newIndex);
}
