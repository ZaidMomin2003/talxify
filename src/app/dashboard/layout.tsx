

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Bot, Code, LayoutGrid, MessageSquare, BarChart, Settings, History, Search, User, LogOut, Gem, LifeBuoy, Sun, Moon, Briefcase, CalendarDays, BrainCircuit, PlayCircle, X, CheckCircle, Circle, Swords, BookOpen, AlertTriangle, FileText, FlaskConical, Rocket, ListChecks, Plus, Edit } from "lucide-react";
import type { StoredActivity, QuizResult, UserData, InterviewActivity, NoteGenerationActivity, TodoItem } from "@/lib/types";
import { formatDistanceToNow, format } from 'date-fns';
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { getActivity, getUserData, addTodo, updateTodo } from "@/lib/firebase-service";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";


function TodoListPopup({ todos, userId, onDataRefresh }: { todos: TodoItem[], userId: string, onDataRefresh: () => void }) {
    const { toast } = useToast();
    const [newTaskText, setNewTaskText] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [activeTab, setActiveTab] = useState('incomplete');
    
    const handleToggle = async (id: string, currentStatus: boolean) => {
        try {
            await updateTodo(userId, id, { completed: !currentStatus });
            onDataRefresh();
        } catch (error) {
            console.error("Failed to update to-do:", error);
            toast({ title: "Error", description: "Could not update task.", variant: "destructive" });
        }
    };
    
    const handleAddTask = async () => {
        if (newTaskText.trim()) {
             try {
                await addTodo(userId, newTaskText.trim());
                onDataRefresh();
                setNewTaskText('');
                setIsAdding(false);
                setActiveTab('incomplete'); 
            } catch (error) {
                console.error("Failed to add to-do:", error);
                toast({ title: "Error", description: "Could not add task.", variant: "destructive" });
            }
        }
    };
    
    const sortedTodos = useMemo(() => {
        return (todos || []).sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA; // Sort descending
        });
    }, [todos]);

    const incompleteTasks = sortedTodos.filter(item => !item.completed);
    const completedTasks = sortedTodos.filter(item => item.completed);


    return (
        <Dialog>
            <DialogTrigger asChild>
                 <div className="group cursor-pointer rounded-lg bg-gradient-to-br from-primary/10 to-background border border-primary/20 p-4 text-left hover:border-primary transition-all">
                     <div className="flex items-start gap-4">
                         <div className="rounded-lg bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                            <ListChecks className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-semibold text-foreground">My To-Do List</p>
                            <p className="text-xs text-muted-foreground">Stay on track with your prep</p>
                        </div>
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                        <ListChecks className="w-6 h-6 text-primary"/>
                        My Prep To-Do List
                    </DialogTitle>
                    <DialogDescription>
                        Stay organized and focused on your interview preparation goals.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="incomplete">Incomplete</TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                    </TabsList>
                    <TabsContent value="incomplete">
                        <div className="h-[60vh] sm:h-[400px] overflow-y-auto pr-2 space-y-3 mt-4">
                            {incompleteTasks.map(item => (
                                <Card key={item.id} className="p-3">
                                    <div className="flex items-center gap-3">
                                        <Checkbox id={`todo-${item.id}`} checked={item.completed} onCheckedChange={() => handleToggle(item.id, item.completed)} />
                                        <label
                                            htmlFor={`todo-${item.id}`}
                                            className="flex-1 text-sm font-medium cursor-pointer"
                                        >
                                            {item.text}
                                        </label>
                                    </div>
                                </Card>
                            ))}
                            {incompleteTasks.length === 0 && (
                                <div className="text-center text-muted-foreground pt-16">
                                    <p>No pending tasks. Great job!</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="completed">
                         <div className="h-[60vh] sm:h-[400px] overflow-y-auto pr-2 space-y-3 mt-4">
                            {completedTasks.map(item => (
                                <Card key={item.id} className="p-3 bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        <Checkbox id={`todo-${item.id}`} checked={item.completed} onCheckedChange={() => handleToggle(item.id, item.completed)} />
                                        <label
                                            htmlFor={`todo-${item.id}`}
                                            className="flex-1 text-sm font-medium cursor-pointer text-muted-foreground line-through"
                                        >
                                            {item.text}
                                        </label>
                                    </div>
                                </Card>
                            ))}
                             {completedTasks.length === 0 && (
                                <div className="text-center text-muted-foreground pt-16">
                                    <p>No tasks completed yet.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
                
                 <DialogFooter className="pt-4">
                    {isAdding ? (
                        <div className="flex w-full gap-2">
                            <Input 
                                placeholder="Add a new task..." 
                                value={newTaskText} 
                                onChange={(e) => setNewTaskText(e.target.value)}
                                onKeyDown={(e) => { if(e.key === 'Enter') handleAddTask() }}
                                autoFocus
                            />
                            <Button onClick={handleAddTask}>Add</Button>
                            <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)}><X className="h-4 w-4"/></Button>
                        </div>
                    ) : (
                        <Button variant="outline" className="w-full" onClick={() => setIsAdding(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Add New Task
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function GettingStartedList({ activity, onDataRefresh }: { activity: StoredActivity[], onDataRefresh: () => void }) {
    const { user } = useAuth();
    const router = useRouter();

    const hasGeneratedNotes = useMemo(() => activity.some(a => a.type === 'note-generation'), [activity]);
    const hasTakenInterview = useMemo(() => activity.some(a => a.type === 'interview'), [activity]);
    const hasTakenQuiz = useMemo(() => activity.some(a => a.type === 'quiz'), [activity]);
    const canDeployPortfolio = hasTakenInterview && hasTakenQuiz && hasGeneratedNotes;
    

    const checklistItems = [
        { name: "Generate Study Notes", completed: hasGeneratedNotes, href: "/dashboard/arena" },
        { name: "Take an Interview", completed: hasTakenInterview, action: () => handleStartInterview() },
        { name: "Take a Coding Quiz", completed: hasTakenQuiz, href: "/dashboard/coding-gym" },
        { name: "Deploy your Portfolio", completed: canDeployPortfolio, href: "/dashboard/portfolio" }
    ];

    const handleStartInterview = () => {
        if (!user) return;
        const meetingId = user.uid + "_" + Date.now();
        const params = new URLSearchParams({ topic: 'General', role: 'Software Engineer', level: 'entry-level' });
        router.push(`/dashboard/interview/${meetingId}/instructions?${params.toString()}`);
    }


    return (
        <SidebarMenu>
            {checklistItems.map(item => (
                <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                        asChild={!!item.href} 
                        size="sm" 
                        className="justify-start text-muted-foreground hover:text-foreground"
                        onClick={item.action}
                    >
                         {item.href ? (
                            <Link href={item.href}>
                               {item.completed ? 
                                    <CheckCircle className="h-4 w-4 text-green-500" /> : 
                                    <Circle className="h-4 w-4 text-muted-foreground/50" />
                                }
                                <span className={item.completed ? "text-foreground" : ""}>{item.name}</span>
                             </Link>
                         ) : (
                            <button className="w-full h-full flex items-center gap-2">
                                {item.completed ? 
                                    <CheckCircle className="h-4 w-4 text-green-500" /> : 
                                    <Circle className="h-4 w-4 text-muted-foreground/50" />
                                }
                                <span className={item.completed ? "text-foreground" : ""}>{item.name}</span>
                            </button>
                         )}
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    );
}

const guideSteps = [
    {
        icon: Swords,
        title: "1. Complete Daily Arena Challenges",
        description: "Go to the Arena to follow your personalized 60-day plan. Complete daily learning, quizzes, and mock interviews to unlock the next day's content."
    },
    {
        icon: FileText,
        title: "2. Build Your Resume",
        description: "Head to the Resume Builder to create a professional resume. This feature is unlocked for Pro users."
    },
    {
        icon: User,
        title: "3. Craft Your Portfolio",
        description: "Use the Portfolio page to showcase your skills, projects, and achievements. Your activity from the Arena can be automatically included."
    },
    {
        icon: History,
        title: "4. Review Your Activity",
        description: "Click the history icon in the top-right header to see a feed of all your recent activities, including quizzes and interviews."
    },
    {
        icon: AlertTriangle,
        title: "5. Check Weak Concepts",
        description: "Click the alert icon in the header to see a list of your weakest concepts based on your quiz performance, helping you focus your studies."
    },
];

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isActivityLoading, setIsActivityLoading] = useState(true);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);


  const fetchUserData = useCallback(async () => {
    if (user) {
        setIsActivityLoading(true);
        const data = await getUserData(user.uid);
        setUserData(data);
        setIsActivityLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const isLiveInterview = pathSegments[0] === 'dashboard' && (pathSegments[1] === 'interview' || pathSegments[1] === 'draft') && pathSegments.length === 3;
    setIsSidebarVisible(!isLiveInterview);
  }, [pathname]);

  const weakConcepts = useMemo(() => {
    if (!userData || !userData.activity) return [];

    const conceptScores: { [topic: string]: { totalScore: number; count: number } } = {};

    // Process quiz results
    const quizResults = userData.activity.filter(
        (item): item is QuizResult => item.type === 'quiz' && item.analysis && item.analysis.length > 0
    );

    quizResults.forEach(result => {
        if (!result.analysis || result.analysis.length === 0) return;
        const averageQuizScore = result.analysis.reduce((sum, a) => sum + a.score, 0) / result.analysis.length;
        
        const topics = result.topics.split(',').map(t => t.trim().toLowerCase());
        topics.forEach(topic => {
            if (!conceptScores[topic]) {
                conceptScores[topic] = { totalScore: 0, count: 0 };
            }
            conceptScores[topic].totalScore += averageQuizScore * 100;
            conceptScores[topic].count += 1;
        });
    });

    // Process interview results
    const interviewResults = userData.activity.filter(
        (item): item is InterviewActivity => item.type === 'interview' && item.analysis?.crackingChance !== undefined
    );

    interviewResults.forEach(result => {
        const topic = result.details.topic.toLowerCase();
        if (!conceptScores[topic]) {
            conceptScores[topic] = { totalScore: 0, count: 0 };
        }
        conceptScores[topic].totalScore += result.analysis!.crackingChance;
        conceptScores[topic].count += 1;
    });

    return Object.entries(conceptScores)
        .map(([topic, data]) => ({
            topic,
            score: Math.round(data.totalScore / data.count)
        }))
        .filter(item => item.score < 70)
        .sort((a, b) => a.score - b.score)
        .slice(0, 5);
        
  }, [userData]);

  const allGettingStartedCompleted = useMemo(() => {
    if (!userData || !userData.activity) return false;
    const activity = userData.activity;
    const hasGeneratedNotes = activity.some(a => a.type === 'note-generation');
    const hasTakenInterview = activity.some(a => a.type === 'interview');
    const hasTakenQuiz = activity.some(a => a.type === 'quiz');
    const canDeployPortfolio = hasTakenInterview && hasTakenQuiz && hasGeneratedNotes;
    return hasGeneratedNotes && hasTakenInterview && hasTakenQuiz && canDeployPortfolio;
  }, [userData]);


  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchUserData();
    }
  }, [user, loading, router, fetchUserData]);
  

  if (!isSidebarVisible) {
    return <main className="flex-1 w-full h-screen overflow-hidden">{children}</main>;
  }


  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/dashboard/arena", label: "Arena", icon: Swords },
    { href: "/dashboard/levelup", label: "Level Up", icon: Rocket, isPro: true },
    { href: "/dashboard/resume-builder", label: "Resume Builder", icon: FileText, isFree: true, isTesting: true },
    { href: "/dashboard/portfolio", label: "Portfolio Builder", icon: User, isPro: true },
  ];
  
  const recentActivity = userData?.activity?.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) || [];

  const filteredActivity = recentActivity.filter(item => {
    const query = searchQuery.toLowerCase();
    if (item.details.topic.toLowerCase().includes(query)) return true;
    if (item.type.toLowerCase().replace(/-/g, ' ').includes(query)) return true;

    switch(item.type) {
        case 'quiz':
            const quizItem = item as QuizResult;
            return quizItem.difficulty.toLowerCase().includes(query) || 
                   quizItem.details.score?.toString().toLowerCase().includes(query);
        case 'interview':
            const interviewItem = item as InterviewActivity;
            return interviewItem.details.role?.toLowerCase().includes(query) || 
                   interviewItem.details.level?.toLowerCase().includes(query);
        case 'note-generation':
             // The main topic search already covers this.
            return false;
        default:
            return false;
    }
  });

  const getActivityIcon = (type: StoredActivity['type']) => {
    switch (type) {
        case 'quiz': return <Code className="h-4 w-4" />;
        case 'interview': return <Briefcase className="h-4 w-4" />;
        case 'note-generation': return <BookOpen className="h-4 w-4" />;
        default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getActivityTitle = (item: StoredActivity) => {
    switch (item.type) {
        case 'quiz': 
            const quizItem = item as QuizResult;
            if (quizItem.details.difficulty === 'Izanami Mode') {
                return `Code Izanami: ${item.details.topic}`;
            }
            return `${item.details.topic} Quiz`;
        case 'interview': return `${item.details.topic} Interview`;
        case 'note-generation': return `Notes for ${item.details.topic}`;
        default: return 'Completed an activity';
    }
  }

  const getActivityLink = (item: StoredActivity) => {
    switch (item.type) {
      case 'quiz':
        return `/dashboard/coding-quiz/analysis?id=${item.id}`;
      case 'note-generation':
        return `/dashboard/arena/notes?topic=${encodeURIComponent(item.details.topic)}`;
      case 'interview':
        return `/dashboard/interview/${item.id}/results`;
      default:
        return '#'; 
    }
  };
  
  if (loading || !user || !userData) {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
    );
  }

  const { plan, endDate } = userData.subscription || {};
  const isExpired = endDate ? new Date() > new Date(endDate) : false;
  const isFreePlan = !plan || plan === 'free' || isExpired;

  const subscriptionStatus = isExpired ? 'Expired' : (plan ? `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan` : 'Free Plan');
  
  
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
           <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-purple-500 to-blue-500 text-primary-foreground shadow-lg animate-vivid-gradient [background-size:200%_200%]">
                <Bot size={28} />
            </div>
            <div className="flex flex-col">
                <h1 className="text-2xl font-bold tracking-tighter">Talxify</h1>
                <span className="text-xs -mt-1 text-muted-foreground">AI Job Assistant</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                    <div className="ml-auto flex items-center gap-2">
                        {(item as any).isTesting && (
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <FlaskConical className="w-4 h-4 text-yellow-500" />
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                <p>Under Testing</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                        {(item as any).isFree && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                            <Gem className="w-4 h-4 text-green-500" />
                            </TooltipTrigger>
                            <TooltipContent side="right">
                            <p>Forever Free</p>
                            </TooltipContent>
                        </Tooltip>
                        )}
                        {(item as any).isPro && !isFreePlan && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                            <Gem className="w-4 h-4 text-primary" />
                            </TooltipTrigger>
                            <TooltipContent side="right">
                            <p>Pro Feature</p>
                            </TooltipContent>
                        </Tooltip>
                        )}
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <SidebarSeparator />
          <SidebarGroup>
            {allGettingStartedCompleted ? (
                 <TodoListPopup todos={userData.todos || []} userId={user.uid} onDataRefresh={fetchUserData} />
            ) : (
                 <GettingStartedList activity={userData.activity || []} onDataRefresh={fetchUserData} />
            )}
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
           <div className="p-2 space-y-2">
            <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
              <DialogTrigger asChild>
                 <div className="hidden md:block group cursor-pointer rounded-lg border-2 border-dashed border-border p-4 text-center hover:border-primary hover:bg-primary/5 transition-all">
                    <div className="flex justify-center mb-2">
                        <div className="rounded-full bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                            <Rocket className="h-6 w-6" />
                        </div>
                    </div>
                    <p className="font-semibold text-foreground">How to use Talxify</p>
                    <p className="text-xs text-muted-foreground">A quick step-by-step guide</p>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Getting Started with Talxify</DialogTitle>
                    <DialogDescription>Follow these steps to make the most of the platform.</DialogDescription>
                </DialogHeader>
                 <div className="my-6 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                    {guideSteps.map(step => (
                        <div key={step.title} className="flex items-start gap-4">
                            <div className="bg-primary/10 text-primary rounded-lg p-2 mt-0.5">
                                <step.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-foreground">{step.title}</p>
                                <p className="text-sm text-muted-foreground">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
              </DialogContent>
            </Dialog>
            
            {isFreePlan ? (
                 <Button asChild className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-lg">
                    <Link href="/dashboard/pricing">
                        <Gem className="mr-2 h-4 w-4" />
                        Upgrade to Pro
                    </Link>
                 </Button>
            ) : (
                <div className="rounded-lg bg-gradient-to-br from-purple-900 via-primary to-blue-800 p-4 text-center text-primary-foreground shadow-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Gem className="h-5 w-5" />
                        <p className="text-lg font-bold">Pro Member</p>
                    </div>
                    {userData.subscription.endDate && (
                        <p className="text-xs text-primary-foreground/80">
                            Expires on {format(new Date(userData.subscription.endDate), 'MMM d, yyyy')}
                        </p>
                    )}
                </div>
            )}
           </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 rounded-lg bg-muted p-2.5 cursor-pointer hover:bg-accent transition-colors">
                  <Avatar className="h-10 w-10 border-2 border-primary">
                    <AvatarImage src={user.photoURL || undefined} alt="User avatar" />
                    <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold truncate">{user.displayName || user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{subscriptionStatus}</p>
                  </div>
                   <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <Settings className="h-4 w-4"/>
                  </Button>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 mb-2" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/support">
                    <LifeBuoy className="mr-2 h-4 w-4" />
                    <span>Support</span>
                  </Link>
                </DropdownMenuItem>
                 <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center">
                      {theme === 'light' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                      <span>Theme</span>
                    </div>
                    <Switch
                      checked={theme === 'dark'}
                      onCheckedChange={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 md:hidden">
              <Bot className="h-6 w-6 text-primary" />
              <span className="font-bold">Talxify</span>
            </div>
            
            <div className="flex flex-1 items-center justify-end gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <span className="sr-only">View weak concepts</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Weakest Areas (Scores {"<"} 70%)</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {isActivityLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                    ) : weakConcepts.length > 0 ? (
                      weakConcepts.map((concept) => (
                        <DropdownMenuItem key={concept.topic}>
                          <div className="flex justify-between items-center w-full">
                            <span className="capitalize font-medium">{concept.topic}</span>
                            <Badge variant={concept.score < 50 ? 'destructive' : 'secondary'}>{concept.score}%</Badge>
                          </div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        <BrainCircuit className="w-6 h-6 mb-2 mx-auto"/>
                        No weak concepts found. Keep up the great work!
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <History className="h-5 w-5" />
                      <span className="sr-only">View recent activity</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Recent Activity</DropdownMenuLabel>
                    <div className="p-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search activity..." 
                          className="pl-8" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    {isActivityLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                    ) : filteredActivity.length > 0 ? (
                      filteredActivity.slice(0, 5).map((item) => (
                        <DropdownMenuItem key={item.id} asChild>
                          <Link href={getActivityLink(item)} className="cursor-pointer">
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/10 text-primary rounded-full p-2">
                                    {getActivityIcon(item.type)}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm capitalize">{getActivityTitle(item)}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No recent activity found.
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="md:hidden">
                  <SidebarTrigger />
                </div>
            </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The ThemeProvider is now in the root layout, 
    // so it doesn't need to be here.
    <DashboardLayoutContent>{children}</DashboardLayoutContent>
  )
}
