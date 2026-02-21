
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  BarChart3, Users, DollarSign, Bug, MessageSquare,
  Search, ShieldCheck, LogOut, ChevronRight,
  TrendingUp, Star, Filter, Download as DownloadIcon,
  Crown, Activity, Globe, ShieldAlert, CheckCircle2,
  Clock, ArrowUpRight, ArrowDownRight, LayoutDashboard,
  Database, UserCheck
} from 'lucide-react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { cn } from '@/lib/utils';


// --- MOCK DATA FOR THE UI DEMO ---
const MOCK_USERS = Array.from({ length: 20 }, (_, i) => ({
  id: `user-${i}`,
  name: i % 3 === 0 ? "Rahul Sharma" : (i % 2 === 0 ? "Ananya Iyer" : "Vikram Mehta"),
  email: `user${i}@university.edu.in`,
  plan: i % 4 === 0 ? 'elite_pro' : (i % 3 === 0 ? 'pro' : 'free'),
  joinDate: subDays(new Date(), i * 2).toISOString(),
  lastActive: subDays(new Date(), i).toISOString(),
  status: 'active'
}));

const MOCK_REVENUE = eachDayOfInterval({
  start: subDays(new Date(), 14),
  end: new Date()
}).map((day, i) => ({
  date: format(day, 'MMM d'),
  amount: Math.floor(Math.random() * 5000) + 1000
}));

const MOCK_MESSAGES = [
  { id: 1, from: "Dr. K. S. Rao", subject: "Institutional Partnership Inquiry", type: "Partnership", date: "2h ago", text: "We are interested in integrating Talxify for our final year B.Tech students..." },
  { id: 2, from: "Siddharth Verma", subject: "Payment failure support", type: "Support", date: "5h ago", text: "My payment for the Elite Pro plan was deducted but account is still free." },
  { id: 3, from: "Prof. Meenakshi", subject: "Placement Officer Access", type: "Partnership", date: "1d ago", text: "How can we track our student progress from a centralized dashboard?" }
];

const MOCK_BUGS = [
  { id: 1, user: "Amit G.", title: "AI Voice skipping on mobile", priority: "high", status: "open", date: "3h ago" },
  { id: 2, user: "Nisha P.", title: "PDF Export layout broken", priority: "medium", status: "in-progress", date: "1d ago" },
  { id: 3, user: "Rohan D.", title: "Login loop on Safari", priority: "critical", status: "open", date: "12m ago" }
];

// --- COMPONENTS ---

const StatCard = ({ title, value, icon: Icon, trend, trendType }: any) => (
  <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-xl overflow-hidden relative">
    <div className="absolute top-0 right-0 p-6 opacity-5">
      <Icon size={48} />
    </div>
    <CardHeader className="pb-2">
      <CardTitle className="text-zinc-500 font-bold text-xs uppercase tracking-widest">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-end gap-3">
        <span className="text-3xl font-black text-white italic">{value}</span>
        {trend && (
          <div className={cn(
            "flex items-center text-xs font-bold px-2 py-0.5 rounded-full mb-1",
            trendType === 'up' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
          )}>
            {trendType === 'up' ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
            {trend}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="mb-8">
    <h2 className="text-4xl font-black text-white italic tracking-tight uppercase leading-none">
      {title}
    </h2>
    {subtitle && <p className="text-zinc-500 mt-2 font-medium">{subtitle}</p>}
  </div>
);

const AdminLayout = ({ children, activeTab, setActiveTab, onLogout }: any) => {
  const menuItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'users', label: 'User Database', icon: Users },
    { id: 'subscriptions', label: 'Financials & Subs', icon: DollarSign },
    { id: 'support', label: 'Contact Inquiries', icon: MessageSquare },
    { id: 'bugs', label: 'Bug Reports', icon: Bug },
  ];

  return (
    <div className="flex min-h-screen bg-black text-zinc-300 font-sans selection:bg-red-500/30">
      {/* Sidebar */}
      <aside className="w-80 border-r border-white/5 flex flex-col p-6 sticky top-0 h-screen bg-zinc-950/50 backdrop-blur-2xl">
        <div className="flex items-center gap-4 mb-12 px-2 group cursor-pointer">
          <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center shadow-[0_0_20px_rgba(230,57,70,0.3)] group-hover:scale-110 transition-transform duration-500">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black italic tracking-tighter text-white uppercase leading-none">ZAIDMIN</span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-red-500 mt-1">Imperial Command</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 border font-bold group",
                activeTab === item.id
                  ? "bg-red-600 text-white border-red-500 shadow-[0_10px_20px_rgba(230,57,70,0.15)]"
                  : "text-zinc-500 border-transparent hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={20} className={cn("transition-transform duration-300", activeTab === item.id ? "scale-110" : "group-hover:translate-x-1")} />
              <span className="text-sm uppercase tracking-tight">{item.label}</span>
              {activeTab === item.id && <ChevronRight size={14} className="ml-auto opacity-50" />}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-top border-white/5">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-zinc-500 hover:text-red-500 hover:bg-red-500/5 transition-all duration-300 font-bold group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className="text-sm uppercase tracking-tight">System Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto max-w-7xl">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs uppercase font-extrabold tracking-widest text-zinc-500">System Status: Online / Optimal</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <Input
                className="bg-zinc-900/50 border-white/5 pl-12 rounded-full w-80 focus:ring-red-500/50 h-11"
                placeholder="Search command..."
              />
            </div>
            <div className="flex items-center gap-4 border-l border-white/10 pl-6">
              <div className="text-right flex flex-col">
                <span className="text-xs font-black text-white uppercase italic leading-none">Commander Zaid</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase mt-1">Full Access</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/5 p-0.5">
                <div className="w-full h-full rounded-[10px] bg-red-600 flex items-center justify-center font-black italic text-white text-xs">ZM</div>
              </div>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

// --- SUB-SECTIONS ---

const DashboardView = () => (
  <div className="space-y-12">
    <SectionTitle title="Overview" subtitle="Real-time performance metrics and growth monitoring." />

    <div className="grid grid-cols-4 gap-6">
      <StatCard title="Total Revenue" value="₹1.42L" icon={DollarSign} trend="+12.5%" trendType="up" />
      <StatCard title="Active Users" value="2,840" icon={Users} trend="+42" trendType="up" />
      <StatCard title="Elite Conversions" value="18%" icon={Crown} trend="+2.3%" trendType="up" />
      <StatCard title="System Bugs" value="04" icon={Bug} trend="-2" trendType="down" />
    </div>

    <div className="grid grid-cols-3 gap-8">
      <Card className="col-span-2 bg-zinc-950 border-white/5 rounded-[2.5rem] p-8">
        <CardHeader className="px-0 pt-0 mb-8 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-black italic text-white uppercase tracking-tighter">Revenue Trajectory</CardTitle>
            <CardDescription className="text-zinc-500 font-medium">Daily income streams from pro subscriptions.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="rounded-full bg-white/5 border-white/10 text-[10px] font-black uppercase italic">Week</Button>
            <Button size="sm" variant="ghost" className="rounded-full text-[10px] font-black uppercase italic text-zinc-500">Month</Button>
          </div>
        </CardHeader>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_REVENUE}>
              <defs>
                <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f1f1f" />
              <XAxis dataKey="date" stroke="#52525b" fontSize={11} axisLine={false} tickLine={false} dy={10} />
              <YAxis stroke="#52525b" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '16px', color: '#fff' }}
                itemStyle={{ color: '#ef4444', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="amount" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#revenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="bg-zinc-950 border-white/5 rounded-[2.5rem] p-8">
        <CardHeader className="px-0 pt-0 mb-6">
          <CardTitle className="text-2xl font-black italic text-white uppercase tracking-tighter">Growth Logs</CardTitle>
          <CardDescription className="text-zinc-500 font-medium">Recent platform activities.</CardDescription>
        </CardHeader>
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4 items-start pb-6 border-b border-white/5 last:border-0">
              <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-500 shrink-0">
                <UserCheck size={18} />
              </div>
              <div>
                <p className="text-sm font-black text-white italic uppercase">{i % 2 === 0 ? "New Elite User" : "New Affiliate Lead"}</p>
                <p className="text-xs text-zinc-500 font-medium mt-1">User subscribed to Lifetime Plan.</p>
                <span className="text-[10px] text-zinc-700 font-bold uppercase mt-2 block">{i * 12}m ago</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

const UserListView = () => (
  <div className="space-y-12">
    <div className="flex justify-between items-end">
      <SectionTitle title="User Matrix" subtitle="Management of the global Talxify user base." />
      <div className="flex gap-4 mb-8">
        <Button variant="outline" className="rounded-full bg-white/5 border-white/10 font-black italic uppercase text-xs h-12 px-6">
          <DownloadIcon size={14} className="mr-2" /> Export CSV
        </Button>
      </div>
    </div>

    <Card className="bg-zinc-950 border-white/5 rounded-[2.5rem] overflow-hidden">
      <Table>
        <TableHeader className="bg-zinc-900/50">
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="font-black italic uppercase text-zinc-500 h-16 pl-8">Access Level</TableHead>
            <TableHead className="font-black italic uppercase text-zinc-500">Identity / Email</TableHead>
            <TableHead className="font-black italic uppercase text-zinc-500">Join Date</TableHead>
            <TableHead className="font-black italic uppercase text-zinc-500">Last Action</TableHead>
            <TableHead className="font-black italic uppercase text-zinc-500 text-right pr-8">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_USERS.map((user) => (
            <TableRow key={user.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
              <TableCell className="pl-8 h-20">
                <Badge className={cn(
                  "font-black italic uppercase text-[10px] px-3 py-1 rounded-full",
                  user.plan === 'elite_pro' ? "bg-red-600 text-white" : (user.plan === 'pro' ? "bg-zinc-100 text-black" : "bg-zinc-800 text-zinc-400")
                )}>
                  {user.plan.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-white font-black italic uppercase tracking-tight">{user.name}</span>
                  <span className="text-zinc-500 text-xs font-medium">{user.email}</span>
                </div>
              </TableCell>
              <TableCell className="text-zinc-400 font-medium text-sm">{format(new Date(user.joinDate), 'MMM d, yyyy')}</TableCell>
              <TableCell className="text-zinc-400 font-medium text-sm">2h ago</TableCell>
              <TableCell className="text-right pr-8">
                <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white group-hover:bg-red-600/10 group-hover:text-red-500 rounded-xl">
                  <Activity size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  </div>
);

const SupportView = ({ type }: { type: 'inquiries' | 'bugs' }) => (
  <div className="space-y-12">
    <SectionTitle
      title={type === 'inquiries' ? "Intelligence Inbox" : "Threat Monitoring"}
      subtitle={type === 'inquiries' ? "Partner and user contact submissions." : "User reported system malfunctions and bugs."}
    />

    <div className="grid grid-cols-1 gap-4">
      {(type === 'inquiries' ? MOCK_MESSAGES : MOCK_BUGS).map((item: any) => (
        <Card key={item.id} className="bg-zinc-950 border-white/5 rounded-[2rem] p-8 hover:border-red-500/30 transition-all group overflow-hidden relative">
          {type === 'bugs' && item.priority === 'critical' && (
            <div className="absolute top-0 right-0 px-8 py-2 bg-red-600 text-white text-[10px] font-black italic uppercase tracking-[0.3em] rotate-45 translate-x-10 translate-y-4">Critical</div>
          )}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Badge className="bg-red-600/10 text-red-500 font-black italic uppercase text-[10px] border border-red-500/20">{type === 'inquiries' ? item.type : item.status}</Badge>
              <span className="text-zinc-500 font-bold text-xs uppercase tracking-widest">{item.date}</span>
            </div>
            <Button variant="ghost" className="rounded-full text-zinc-500 hover:text-white font-black italic uppercase text-[10px]">Resolve</Button>
          </div>
          <h3 className="text-xl font-black text-white italic uppercase tracking-tight mb-2">{type === 'inquiries' ? item.subject : item.title}</h3>
          <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-2xl">
            {type === 'inquiries' ? item.text : `Reported by ${item.user}. This issue is currently affecting user experience in production environment.`}
          </p>
          <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-2">
            <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Source:</span>
            <span className="text-[10px] font-black text-white uppercase italic">{type === 'inquiries' ? item.from : item.user}</span>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

// --- MAIN PAGE GATEKEEPER ---

export default function ZaidminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (credentials.username === 'admin' && credentials.password === 'talxify-admin-2026') {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Invalid Access Credentials. Guard alerted.');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 selection:bg-red-500/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(230,57,70,0.1),transparent_50%)]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg relative z-10"
        >
          <Card className="bg-zinc-950/80 border-white/10 backdrop-blur-3xl p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
            {/* Glowing Scanner Line */}
            <motion.div
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              className="absolute left-0 right-0 h-[1px] bg-red-500/50 shadow-[0_0_15px_rgba(230,57,70,0.5)] z-20 pointer-events-none"
            />

            <div className="text-center mb-10">
              <div className="w-20 h-20 rounded-3xl bg-red-600 mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(230,57,70,0.4)] mb-8">
                <ShieldCheck size={40} className="text-white" />
              </div>
              <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none mb-3">COMMAND CENTER</h1>
              <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.4em]">Biometric Access Required</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-4">Imperial ID</Label>
                <Input
                  type="text"
                  value={credentials.username}
                  onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                  className="bg-white/5 border-white/10 rounded-2xl h-14 pl-6 text-white text-lg focus:ring-red-500/50 focus:border-red-500"
                  placeholder="Username"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-4">Access Key</Label>
                <Input
                  type="password"
                  value={credentials.password}
                  onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                  className="bg-white/5 border-white/10 rounded-2xl h-14 pl-6 text-white text-lg focus:ring-red-500/50 focus:border-red-500"
                  placeholder="••••••••••••"
                />
              </div>

              {error && (
                <p className="text-red-500 text-xs font-black uppercase italic tracking-tight text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 h-16 rounded-2xl font-black italic uppercase text-lg tracking-tight shadow-[0_15px_30px_rgba(230,57,70,0.3)] group mt-4">
                Verify Identity
                <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-[10px] font-bold uppercase text-zinc-700 tracking-[0.1em]">Talxify Internal Infrastructure v4.2.0</p>
              <p className="text-[10px] font-bold text-zinc-800 mt-2 uppercase">Hint (Demo): admin / talxify-admin-2026</p>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <AdminLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={() => setIsLoggedIn(false)}
    >
      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'users' && <UserListView />}
      {activeTab === 'subscriptions' && (
        <div className="space-y-12">
          <SectionTitle title="Financial Control" subtitle="Subscription revenue flow and active financial logs." />
          <div className="grid grid-cols-3 gap-6">
            <StatCard title="Monthly Recurring" value="₹84,200" icon={Activity} trend="+8%" trendType="up" />
            <StatCard title="Institutional Deals" value="12" icon={Globe} trend="+2" trendType="up" />
            <StatCard title="Refund Rate" value="0.2%" icon={ShieldAlert} trend="-0.1%" trendType="down" />
          </div>
          <Card className="bg-zinc-950 border-white/5 rounded-[2.5rem] overflow-hidden p-8">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="font-black italic uppercase text-zinc-500">Transaction ID</TableHead>
                  <TableHead className="font-black italic uppercase text-zinc-500">Identity</TableHead>
                  <TableHead className="font-black italic uppercase text-zinc-500">Amount</TableHead>
                  <TableHead className="font-black italic uppercase text-zinc-500">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5].map(i => (
                  <TableRow key={i} className="border-white/5 hover:bg-white/[0.01]">
                    <TableCell className="font-mono text-xs text-zinc-500 uppercase">TXN_948274{i}</TableCell>
                    <TableCell>
                      <div className="font-black italic uppercase text-white tracking-tight">Ananya Iyer</div>
                    </TableCell>
                    <TableCell className="font-black italic uppercase text-red-500">₹1,299</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-green-500 font-bold uppercase text-[10px]">
                        <CheckCircle2 size={12} /> Success
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
      {activeTab === 'support' && <SupportView type="inquiries" />}
      {activeTab === 'bugs' && <SupportView type="bugs" />}
    </AdminLayout>
  );
}

