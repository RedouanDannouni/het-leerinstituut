"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Asset, AssetKind, Block, BlockType } from "@/lib/lessons/types";
import { BlockWrapper } from "./BlockWrapper";
import { BlockInserter } from "./BlockInserter";

export function BlockList({
  blocks,
  errorsByBlock,
  onChangeBlock,
  onInsertAt,
  onDuplicate,
  onDelete,
  onReorder,
  onRequestAsset,
}: {
  blocks: Block[];
  errorsByBlock: Record<string, string[]>;
  onChangeBlock: (block: Block) => void;
  onInsertAt: (index: number, type: BlockType) => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
  onReorder: (from: number, to: number) => void;
  onRequestAsset: (kinds: AssetKind[], apply: (asset: Asset) => void) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = blocks.findIndex((block) => block.id === active.id);
    const to = blocks.findIndex((block) => block.id === over.id);
    if (from >= 0 && to >= 0) onReorder(from, to);
  };

  return (
    <div className="block-list">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block, index) => (
            <div key={block.id}>
              <BlockInserter onInsert={(type) => onInsertAt(index, type)} />
              <BlockWrapper
                block={block}
                errors={errorsByBlock[block.id] ?? []}
                onChange={onChangeBlock}
                onDuplicate={() => onDuplicate(index)}
                onDelete={() => onDelete(index)}
                onRequestAsset={onRequestAsset}
              />
            </div>
          ))}
        </SortableContext>
      </DndContext>
      <div className="block-list-foot">
        <BlockInserter onInsert={(type) => onInsertAt(blocks.length, type)} variant="button" />
      </div>
    </div>
  );
}
