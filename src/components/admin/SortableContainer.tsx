'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export { arrayMove };

interface SortableListProps<T extends { id: string | number }> {
  items: T[];
  onReorder: (newItems: T[]) => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Universal Sortable List wrapper using @dnd-kit.
 */
export function SortableList<T extends { id: string | number }>({
  items,
  onReorder,
  children,
  className = '',
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => String(item.id) === String(active.id));
      const newIndex = items.findIndex((item) => String(item.id) === String(over.id));
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(items, oldIndex, newIndex).map((item, idx) => ({
          ...item,
          order: idx + 1,
        }));
        onReorder(reordered);
      }
    }
  };

  const itemIds = React.useMemo(() => items.map((i) => String(i.id)), [items]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div className={cn('space-y-3', className)}>{children}</div>
      </SortableContext>
    </DndContext>
  );
}

interface SortableItemProps {
  id: string | number;
  children: (props: {
    dragHandleProps: any;
    isDragging: boolean;
  }) => React.ReactNode;
  className?: string;
}

/**
 * Individual Sortable Item with drag handles and smooth translation.
 */
export function SortableItem({ id, children, className = '' }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(id) });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    position: 'relative',
    zIndex: isDragging ? 50 : undefined,
  };

  const dragHandleProps = {
    ...attributes,
    ...listeners,
  };

  return (
    <div ref={setNodeRef} style={style} className={className}>
      {children({ dragHandleProps, isDragging })}
    </div>
  );
}

/**
 * Accessible, beautifully-styled Drag & Drop Grip Handle icon.
 */
export function DragHandle({
  dragHandleProps,
  className = '',
  title = 'برای تغییر ترتیب بکشید و رها کنید',
}: {
  dragHandleProps: any;
  className?: string;
  title?: string;
}) {
  return (
    <div
      {...dragHandleProps}
      title={title}
      className={cn(
        'cursor-grab active:cursor-grabbing p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors flex items-center justify-center shrink-0 touch-none select-none',
        className
      )}
    >
      <GripVertical className="w-4 h-4" />
    </div>
  );
}
