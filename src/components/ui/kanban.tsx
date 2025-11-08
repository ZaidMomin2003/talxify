
'use client';

import React, { createContext, useContext, useMemo, useState, ReactNode, useEffect } from 'react';
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
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, GripVertical } from 'lucide-react';
import type { TodoItem, Column } from '@/lib/types';
import { cn } from '@/lib/utils';


// --- CONTEXT ---
interface KanbanContextType {
  columns: Column[];
  tasks: Record<string, TodoItem[]>;
  onDragEnd: (event: DragEndEvent) => void;
  onDragOver: (event: DragOverEvent) => void;
  onDragStart: (event: DragStartEvent) => void;
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
  const tasksId = useMemo(() => {
    return Object.values(tasks).flat().map(t => t.id);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );
  
  function findColumn(taskId: string) {
    if (!taskId) return null;
    for (const [columnId, taskItems] of Object.entries(tasks)) {
      if (taskItems.some(t => t.id === taskId)) {
        return columnId;
      }
    }
    return null;
  }

  function onDragStart(event: DragStartEvent) {
    const { active } = event;
    const task = Object.values(tasks).flat().find(t => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
        setActiveTask(null);
        return;
    }
    
    const originalColumnId = findColumn(active.id as string);
    const newColumnId = findColumn(over.id as string) || over.id as string;
    
    if (!originalColumnId || !newColumnId || originalColumnId === newColumnId) {
        setActiveTask(null);
        return;
    }
    
    const newTasks = { ...tasks };
    const taskToMove = newTasks[originalColumnId].find(t => t.id === active.id);

    if (taskToMove) {
        newTasks[originalColumnId] = newTasks[originalColumnId].filter(t => t.id !== active.id);
        
        // Find insert position
        const overTaskIndex = newTasks[newColumnId].findIndex(t => t.id === over.id);
        
        if (overTaskIndex !== -1) {
            newTasks[newColumnId].splice(overTaskIndex, 0, { ...taskToMove, status: newColumnId as Column['id']});
        } else {
            // If dropping on a column, not a task, add to the end
            newTasks[newColumnId].push({ ...taskToMove, status: newColumnId as Column['id']});
        }

        onTasksChange(newTasks);
    }
    
    setActiveTask(null);
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;

    const originalColumn = findColumn(activeId);
    const overColumn = findColumn(overId);

    if (!originalColumn || !overColumn || originalColumn === overColumn) {
        return;
    }
    
    const newTasks = { ...tasks };
    const taskToMove = newTasks[originalColumn].find(t => t.id === activeId);

    if (taskToMove) {
        newTasks[originalColumn] = newTasks[originalColumn].filter(t => t.id !== activeId);
        
        const overIndex = newTasks[overColumn].findIndex(t => t.id === overId);
        newTasks[overColumn].splice(overIndex, 0, { ...taskToMove, status: overColumn as Column['id']});
        
        onTasksChange(newTasks);
    }
  }


  return (
    <KanbanContext.Provider value={{ columns, tasks, onDragStart, onDragEnd, onDragOver, activeTask, renderCard }}>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver}>
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
  
  const { setNodeRef, isOver } = useSortable({ id: column.id, data: { type: 'column' }});

  return (
     <div
      ref={setNodeRef}
      className={cn("inline-flex flex-col w-72 min-w-72 max-w-sm rounded-lg bg-muted/50 border",
        isOver && "ring-2 ring-primary"
      )}
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
