"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { Bot, Code, LayoutGrid, MessageSquare, BarChart, Settings } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/interview", label: "Mock Interview", icon: MessageSquare },
    { href: "/coding", label: "Coding Practice", icon: Code },
    { href: "/performance", label: "Performance", icon: BarChart },
  ];

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
              const isEnabled = item.href === '/dashboard';
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
          <div className="flex items-center gap-3 rounded-lg bg-muted p-2.5">
             <Avatar className="h-10 w-10 border-2 border-primary">
              <AvatarImage src="https://placehold.co/40x40.png" alt="User avatar" data-ai-hint="person avatar" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-semibold">John Doe</p>
              <p className="text-xs text-muted-foreground">Pro Member</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4"/>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
            <div className="flex-1" />
            {/* Future elements like search or notifications can go here */}
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
