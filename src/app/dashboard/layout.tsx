
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
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
} from "@/components/ui/sidebar";
import { Bot, Code, LayoutGrid, MessageSquare, BarChart, Settings, History, Search, User, LogOut, Gem, LifeBuoy, Sun, Moon, Briefcase, CalendarDays } from "lucide-react";
import type { StoredActivity, QuizResult, UserData } from "@/lib/types";
import { formatDistanceToNow, format } from 'date-fns';
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { getActivity, getUserData } from "@/lib/firebase-service";
import { ThemeProvider } from "@/components/theme-provider";

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


  const fetchUserData = useCallback(async () => {
    if (user) {
        setIsActivityLoading(true);
        const data = await getUserData(user.uid);
        setUserData(data);
        setIsActivityLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchUserData();
    }
  }, [user, loading, router, fetchUserData]);


  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/dashboard/portfolio", label: "Portfolio", icon: User },
    { href: "/dashboard/performance", label: "Performance", icon: BarChart },
  ];
  
  const recentActivity = userData?.activity?.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) || [];

  const filteredActivity = recentActivity.filter(item =>
    item.type === 'quiz' ?
    (item.details.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item as QuizResult).difficulty.toLowerCase().includes(searchQuery.toLowerCase())) :
    (item.details.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.details.role && item.details.role.toLowerCase().includes(searchQuery.toLowerCase())))
  );
  
  if (loading || !user || !userData) {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
    );
  }

  const subscriptionStatus = userData?.subscription?.plan ? 
    `${userData.subscription.plan.charAt(0).toUpperCase() + userData.subscription.plan.slice(1)} Plan` :
    'Free Plan';

  const isFreePlan = !userData.subscription || userData.subscription.plan === 'free';

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
           <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Bot size={28} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-headline font-bold">Talxify</h1>
              <span className="text-xs -mt-1 text-muted-foreground">AI Job Assistant</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => {
              const isEnabled = item.href === '/dashboard' || item.href === '/dashboard/portfolio' || item.href === '/dashboard/performance';
              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                  >
                    <Link href={isEnabled ? item.href : '#'} className={!isEnabled ? "pointer-events-none text-muted-foreground/70" : ""}>
                      <item.icon />
                      {item.label}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <div className="p-2">
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
                          <Link href={item.type === 'quiz' ? `/dashboard/coding-quiz/analysis?id=${item.id}` : `/dashboard/mock-interview/analysis?id=${item.id}`} className="cursor-pointer">
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/10 text-primary rounded-full p-2">
                                    {item.type === 'quiz' ? <Code className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm capitalize">{item.details.topic} {item.type === 'quiz' ? 'Quiz' : 'Interview'}</p>
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
    <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
    >
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </ThemeProvider>
  )
}
