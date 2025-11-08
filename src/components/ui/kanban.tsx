
'use client';

import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import {
  DndContext,
  closestCorners,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  Announcements,
  UniqueIdentifier,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { GripVertical } from 'lucide-react';
import type { TodoItem, Column } from '@/lib/types';
import { cn } from '@/lib/utils';


// --- CONTEXT ---
interface KanbanContextType {
  columns: Column[];
  tasks: Record<string, TodoItem[]>;
  activeTask: TodoItem | null;
  renderCard: (task: TodoItem) => ReactNode;
}

const KanbanContext = createContext<KanbanContextType | null>(null);

export const useKanban = () => {
  const context = useContext(KanbanContext);
  if (!context) throw new Error('useKanban must be used within a KanbanProvider');
  return context;
};


// --- PROVIDER ---
interface KanbanProviderProps {
  children: ReactNode;
  columns: Column[];
  tasks: Record<string, TodoItem[]>;
  onTasksChange: (tasks: Record<string, TodoItem[]>) => void;
  renderCard: (task: TodoItem) => ReactNode;
}

export function KanbanProvider({ children, columns, tasks, onTasksChange, renderCard }: KanbanProviderProps) {
  const [activeTask, setActiveTask] = useState<TodoItem | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const findContainer = (id: UniqueIdentifier) => {
    if (id in tasks) {
      return id as string;
    }
    return Object.keys(tasks).find((key) => tasks[key].some(item => item.id === id));
  };

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = Object.values(tasks).flat().find(t => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    const newTasks = { ...tasks };
    const activeItems = newTasks[activeContainer];
    const overItems = newTasks[overContainer];
    const activeIndex = activeItems.findIndex((item) => item.id === activeId);
    const overIndex = overItems.findIndex((item) => item.id === overId);

    const [movedItem] = activeItems.splice(activeIndex, 1);
    movedItem.status = overContainer as Column['id'];
    
    if (overId in newTasks) {
       overItems.push(movedItem);
    } else {
       overItems.splice(overIndex, 0, movedItem);
    }
    
    onTasksChange(newTasks);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
        setActiveTask(null);
        return;
    }

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);

    if (!activeContainer || !overContainer || activeContainer !== overContainer) {
        setActiveTask(null);
        return;
    }

    const activeIndex = tasks[activeContainer].findIndex((task) => task.id === active.id);
    const overIndex = tasks[overContainer].findIndex((task) => task.id === over.id);

    if (activeIndex !== overIndex) {
        const newTasks = {
            ...tasks,
            [activeContainer]: arrayMove(tasks[activeContainer], activeIndex, overIndex)
        };
        onTasksChange(newTasks);
    }
    setActiveTask(null);
  };

  return (
    <KanbanContext.Provider value={{ columns, tasks, onDragStart, onDragEnd, onDragOver, activeTask, renderCard }}>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
        <div className="flex gap-6 items-start">
            {children}
        </div>
        <DragOverlay>
            {activeTask ? renderCard(activeTask) : null}
        </DragOverlay>
      </DndContext>
    </KanbanContext.Provider>
  );
}


// --- KANBAN BOARD & COLUMN ---
interface KanbanColumnProps {
    column: Column;
    children: ReactNode;
}

export function KanbanColumn({ column, children }: KanbanColumnProps) {
  const { tasks } = useKanban();
  const columnTasks = tasks[column.id] || [];
  const taskIds = useMemo(() => columnTasks.map(t => t.id), [columnTasks]);
  
  const { setNodeRef } = useSortable({ id: column.id, data: { type: 'column' }});

  return (
     <div
      ref={setNodeRef}
      className="inline-flex flex-col w-72 min-w-72 max-w-sm rounded-lg bg-muted/50 border"
    >
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </div>
  )
}

interface KanbanHeaderProps {
  children: ReactNode;
}
export function KanbanHeader({ children }: KanbanHeaderProps) {
    return <CardHeader className="p-4 border-b">{children}</CardHeader>
}

interface KanbanCardsProps {
    columnId: string;
}
export function KanbanCards({ columnId }: KanbanCardsProps) {
  const { tasks, renderCard } = useKanban();
  const columnTasks = tasks[columnId] || [];

  return (
    <CardContent className="p-4 space-y-4 min-h-24">
        {columnTasks.map(task => (
             <SortableKanbanCard key={task.id} task={task}>
                {renderCard(task)}
             </SortableKanbanCard>
        ))}
    </CardContent>
  );
}


// --- KANBAN CARD ---
interface SortableKanbanCardProps {
    task: TodoItem;
    children: ReactNode;
}

function SortableKanbanCard({ task, children }: SortableKanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };
  
  if (isDragging) {
    return <div ref={setNodeRef} style={style} className="h-24 bg-primary/10 rounded-lg border-2 border-dashed border-primary" />
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {children}
    </div>
  );
}

export function KanbanCard({ children }: { children: ReactNode }) {
  return (
    <Card className="relative group/card bg-background hover:border-primary/50 transition-colors">
      {children}
      <div className="absolute top-1/2 -translate-y-1/2 right-2 text-muted-foreground/20 group-hover/card:text-muted-foreground transition-colors">
          <GripVertical />
      </div>
    </Card>
  )
}
