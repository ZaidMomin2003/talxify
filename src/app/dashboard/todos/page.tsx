
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { KanbanProvider, KanbanColumn, KanbanHeader, KanbanCards, KanbanCard } from '@/components/ui/kanban';
import type { TodoItem, Column } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { addTodo, getUserData, updateTodosBatch } from '@/lib/firebase-service';
import { ListChecks, Plus, GripVertical, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

const initialColumns: Column[] = [
    { id: 'todo', name: 'To Do', color: '#6B7280' },
    { id: 'inprogress', name: 'In Progress', color: '#F59E0B' },
    { id: 'done', name: 'Done', color: '#10B981' },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const NewTaskForm = ({ columnId, onTaskAdded, onCancel }: { columnId: string, onTaskAdded: () => void, onCancel: () => void }) => {
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
            toast({ title: 'Error', description: 'Failed to add task.', variant: 'destructive' });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 space-y-4 bg-white/5 rounded-2xl border border-white/10 mb-4"
        >
            <Input
                placeholder="What needs to be done?"
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                className="bg-black/20 border-white/5 h-12 rounded-xl focus:ring-primary/20"
                autoFocus
            />
            <div className="flex gap-2">
                <Button onClick={handleAddTask} size="sm" className="flex-1 rounded-xl font-bold uppercase tracking-widest text-[10px]">Add Mission</Button>
                <Button onClick={onCancel} variant="ghost" size="sm" className="rounded-xl font-bold uppercase tracking-widest text-[10px]">Cancel</Button>
            </div>
        </motion.div>
    )
}

function TaskCard({ task }: { task: TodoItem }) {
    const { user } = useAuth();

    const handleToggleComplete = async (checked: boolean) => {
        if (!user) return;
        // Logic for toggling completion could be added here if needed
    }

    return (
        <KanbanCard>
            <div className="p-4 flex items-start gap-4 bg-black/20 backdrop-blur-sm border border-white/5 rounded-2xl hover:border-primary/30 transition-all group/task">
                <Checkbox
                    checked={task.completed}
                    onCheckedChange={(checked) => handleToggleComplete(Boolean(checked))}
                    className="mt-1 border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <div className="flex-1 overflow-hidden">
                    <p className={cn(
                        "font-bold text-sm tracking-tight transition-all",
                        task.completed ? "line-through text-muted-foreground/50" : "text-white/90 group-hover/task:text-primary"
                    )}>
                        {task.text}
                    </p>
                    {task.createdAt && (
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mt-2 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-primary/40" />
                            {format(new Date(task.createdAt), 'MMM d, yyyy')}
                        </p>
                    )}
                </div>
            </div>
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
            groupedTasks[colId].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
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
            const allTasks = Object.values(newTasks).flat();
            await updateTodosBatch(user.uid, allTasks);
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-4">
                <div className="relative mb-8">
                    <div className="h-24 w-24 rounded-3xl border-2 border-primary/20 animate-spin" />
                    <ListChecks className="h-12 w-12 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Accessing <span className="text-primary">Missions</span></h2>
            </div>
        )
    }

    return (
        <main className="flex-1 p-4 sm:p-6 lg:p-10 bg-background/50 relative overflow-x-hidden min-h-screen flex flex-col">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

            <motion.div
                className="max-w-7xl mx-auto w-full space-y-8 relative z-10 flex-1 flex flex-col"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <motion.div variants={itemVariants} className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 border border-primary/20 mb-2">
                            <ListChecks className="w-8 h-8 text-primary" />
                        </motion.div>
                        <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-black tracking-tight italic uppercase text-white leading-none">
                            Mission <span className="text-primary">Log</span>
                        </motion.h1>
                        <motion.p variants={itemVariants} className="max-w-2xl text-muted-foreground text-lg font-medium">
                            Strategic task management for your industrial preparation journey.
                        </motion.p>
                    </div>

                    <motion.div variants={itemVariants}>
                        <Button
                            onClick={() => setShowNewTaskForm(true)}
                            className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] italic shadow-lg shadow-primary/20 group hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            New Mission
                            <Plus className="ml-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
                        </Button>
                    </motion.div>
                </div>

                <div className="flex-1 min-h-0">
                    <ScrollArea className="w-full h-full">
                        <div className="inline-block min-w-full align-top pb-10">
                            <KanbanProvider columns={initialColumns} tasks={tasks} onTasksChange={handleTasksChange} renderCard={(task) => <TaskCard task={task as TodoItem} />}>
                                {initialColumns.map(column => (
                                    <motion.div
                                        key={column.id}
                                        variants={itemVariants}
                                        className="h-full"
                                    >
                                        <KanbanColumn column={column}>
                                            <div className="w-80 flex flex-col h-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                                                <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-2 w-2 rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" style={{ backgroundColor: column.color }} />
                                                        <span className="font-black italic uppercase tracking-widest text-xs text-white/90">{column.name}</span>
                                                        <Badge className="bg-white/10 text-white/60 hover:bg-white/20 border-none px-2 h-5 text-[10px] font-bold rounded-lg pointer-events-none">
                                                            {tasks[column.id]?.length || 0}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="flex-1 overflow-y-auto min-h-[400px] p-4">
                                                    {column.id === 'todo' && showNewTaskForm && (
                                                        <NewTaskForm
                                                            columnId={column.id}
                                                            onTaskAdded={() => { fetchTasks(); setShowNewTaskForm(false); }}
                                                            onCancel={() => setShowNewTaskForm(false)}
                                                        />
                                                    )}
                                                    <KanbanCards columnId={column.id} />
                                                </div>
                                            </div>
                                        </KanbanColumn>
                                    </motion.div>
                                ))}
                            </KanbanProvider>
                        </div>
                    </ScrollArea>
                </div>
            </motion.div>
        </main>
    );
}
