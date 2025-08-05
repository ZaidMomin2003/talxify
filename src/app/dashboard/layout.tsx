
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
} from "@/components/ui/sidebar";
import { Bot, Code, LayoutGrid, MessageSquare, BarChart, Settings, History, Search, User, LogOut, Gem, LifeBuoy } from "lucide-react";
import type { QuizResult } from "./coding-quiz/analysis/page";
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [recentActivity, setRecentActivity] = useState<QuizResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  useEffect(() => {
    // This effect runs on the client-side, where localStorage is available.
    if (typeof window !== 'undefined') {
      const storedResults = localStorage.getItem('allQuizResults');
      if (storedResults) {
        setRecentActivity(JSON.parse(storedResults));
      }
    }
  }, [pathname]); // Rerun when path changes to maybe update activity

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/dashboard/portfolio", label: "Portfolio", icon: User },
    { href: "/dashboard/performance", label: "Performance", icon: BarChart },
  ];

  const filteredActivity = recentActivity.filter(item =>
    item.topics.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.difficulty.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (loading || !user) {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Bot size={28} />
            </div>
            <h1 className="text-2xl font-headline font-bold">Talxify</h1>
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
           <div className="p-2 mt-auto">
             <Button asChild className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-lg">
                <Link href="/dashboard/pricing">
                    <Gem className="mr-2 h-4 w-4" />
                    Upgrade to Pro
                </Link>
             </Button>
           </div>
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 rounded-lg bg-muted p-2.5 cursor-pointer hover:bg-accent transition-colors">
                  <Avatar className="h-10 w-10 border-2 border-primary">
                    <AvatarImage src={user.photoURL || "https://placehold.co/40x40.png"} alt="User avatar" data-ai-hint="person avatar" />
                    <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold truncate">{user.displayName || user.email}</p>
                    <p className="text-xs text-muted-foreground">Pro Member</p>
                  </div>
                   <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <Settings className="h-4 w-4"/>
                  </Button>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" align="end" forceMount>
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
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
            <div className="flex-1" />
            
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
                {filteredActivity.length > 0 ? (
                  filteredActivity.map((item) => (
                    <DropdownMenuItem key={item.id} asChild>
                      <Link href={`/dashboard/coding-quiz/analysis?id=${item.id}`} className="cursor-pointer">
                        <div className="flex items-start gap-3">
                            <div className="bg-primary/10 text-primary rounded-full p-2">
                                <Code className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm capitalize">{item.topics} Quiz</p>
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
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
