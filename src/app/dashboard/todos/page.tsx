
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { KanbanProvider, KanbanColumn, KanbanHeader, KanbanCards, KanbanCard, useKanban } from '@/components/ui/kanban';
import type { TodoItem, Column } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { addTodo, getUserData, updateTodo } from '@/lib/firebase-service';
import { ListChecks, Plus, GripVertical, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const initialColumns: Column[] = [
    { id: 'todo', name: 'To Do', color: '#6B7280' },
    { id: 'inprogress', name: 'In Progress', color: '#F59E0B' },
    { id: 'done', name: 'Done', color: '#10B981' },
];

const NewTaskForm = ({ columnId, onTaskAdded }: { columnId: string, onTaskAdded: () => void }) => {
    const [taskText, setTaskText] = useState('');
    const { user } = useAuth();
    const { toast } = useToast();

    const handleAddTask = async () => {
        if (!taskText.trim() || !user) return;
        try {
            await addTodo(user.uid, taskText, columnId);
            setTaskText('');
            onTaskAdded();
        } catch (e) {
            toast({ title: 'Error', description: 'Failed to add task.', variant: 'destructive'});
        }
    };
    
    return (
        <div className="p-2 space-y-2">
            <Input 
                placeholder="Enter a new task..." 
                value={taskText} 
                onChange={(e) => setTaskText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            />
            <Button onClick={handleAddTask} size="sm" className="w-full">Add Task</Button>
        </div>
    )
}

function TaskCard({ task }: { task: TodoItem }) {
     const { user } = useAuth();
     
     const handleToggleComplete = async (checked: boolean) => {
        if (!user) return;
        await updateTodo(user.uid, task.id, { completed: checked });
     }
     
     return (
        <KanbanCard>
            <CardContent className="p-4 flex items-start gap-3">
                 <Checkbox 
                    checked={task.completed} 
                    onCheckedChange={(checked) => handleToggleComplete(Boolean(checked))}
                    className="mt-1"
                />
                 <div className="flex-1">
                    <p className={cn("font-medium", task.completed && "line-through text-muted-foreground")}>
                        {task.text}
                    </p>
                    {task.createdAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                            Added: {format(new Date(task.createdAt), 'MMM d, yyyy')}
                        </p>
                    )}
                </div>
            </CardContent>
        </KanbanCard>
     )
}


export default function TodosPage() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Record<string, TodoItem[]>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [showNewTaskForm, setShowNewTaskForm] = useState(false);

    const fetchTasks = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        const userData = await getUserData(user.uid);
        const userTodos = userData?.todos || [];

        const groupedTasks = initialColumns.reduce((acc, col) => {
            acc[col.id] = [];
            return acc;
        }, {} as Record<string, TodoItem[]>);
        
        userTodos.forEach(todo => {
            const status = todo.status || 'todo';
            if (!groupedTasks[status]) {
                 groupedTasks[status] = [];
            }
            groupedTasks[status].push(todo);
        });
        
        // Sort tasks within each column by creation date
        for (const colId in groupedTasks) {
            groupedTasks[colId].sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        }

        setTasks(groupedTasks);
        setIsLoading(false);
    }, [user]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);
    
    const handleTasksChange = async (newTasks: Record<string, TodoItem[]>) => {
        setTasks(newTasks);
        if (user) {
            // Find the task that moved and update its status in Firestore
            for (const colId in newTasks) {
                for (const task of newTasks[colId]) {
                    if (task.status !== colId) {
                       await updateTodo(user.uid, task.id, { status: colId as Column['id']});
                       // We can break after one update as dnd-kit handles one move at a time
                       return;
                    }
                }
            }
        }
    }
    
    if (isLoading) {
        return (
             <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
             <CardHeader className="px-0">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                    <ListChecks className="w-6 h-6 text-primary"/>
                    My Prep To-Do List
                </CardTitle>
                <CardDescription>
                    Stay organized and focused on your interview preparation goals. Drag and drop tasks to update their status.
                </CardDescription>
            </CardHeader>
            <div className="mt-6">
                <KanbanProvider columns={initialColumns} tasks={tasks} onTasksChange={handleTasksChange} renderCard={(task) => <TaskCard task={task as TodoItem} />}>
                    {initialColumns.map(column => (
                         <KanbanColumn key={column.id} column={column}>
                            <KanbanHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: column.color }} />
                                        <span className="font-semibold">{column.name}</span>
                                        <Badge variant="secondary" className="ml-1">
                                            {tasks[column.id]?.length || 0}
                                        </Badge>
                                    </div>
                                    {column.id === 'todo' && (
                                        <Button variant="ghost" size="icon" onClick={() => setShowNewTaskForm(!showNewTaskForm)}>
                                            <Plus className="h-5 w-5" />
                                        </Button>
                                    )}
                                </div>
                                {column.id === 'todo' && showNewTaskForm && (
                                    <NewTaskForm columnId={column.id} onTaskAdded={() => { fetchTasks(); setShowNewTaskForm(false); }}/>
                                )}
                            </KanbanHeader>
                            <KanbanCards columnId={column.id} />
                         </KanbanColumn>
                    ))}
                </KanbanProvider>
            </div>
        </main>
    );
}
