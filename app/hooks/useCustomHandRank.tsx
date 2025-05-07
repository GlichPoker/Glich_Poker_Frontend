"use client";
import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "@/components/main/sortableItem";

const defaultOrder = [
  "HIGHCARD",
  "ONEPAIR",
  "TWOPAIR",
  "THREEOFKIND",
  "STRAIGHT",
  "FLUSH",
  "FULLHOUSE",
  "FOUROFKIND",
  "STRAIGHTFLUSH",
  "ROYALFLUSH"
];

export const useCustomHandRank = () => {
  const [customOrder, setCustomOrder] = useState<string[]>(defaultOrder);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const DraggableList = () => (
    <div className="mb-4 p-2 border border-gray-700 rounded">
      <p className="text-white font-semibold mb-2">Custom Hand Rank Order:<span className="text-xs text-gray-400 italic !ml-5">
        (Top = Weakest, Bottom = Strongest)
      </span></p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (active.id !== over?.id) {
            const oldIndex = customOrder.indexOf(active.id as string);
            const newIndex = customOrder.indexOf(over?.id as string);
            setCustomOrder(arrayMove(customOrder, oldIndex, newIndex));
          }
        }}
      >
        <SortableContext
          items={customOrder}
          strategy={verticalListSortingStrategy}
        >
          {customOrder.map((rank) => (
            <SortableItem key={rank} id={rank} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );

  return { customOrder, DraggableList };
};