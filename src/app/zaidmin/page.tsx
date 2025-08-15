
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bot, DollarSign, Users, ShoppingCart, Loader2, LogIn, AlertTriangle } from 'lucide-react';
import type { UserData } from '@/lib/types';
import { getAllUsers } from '@/lib/firebase-service';
import { format, subDays, eachDayOfInterval } from 'date-fns';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/90 backdrop-blur-sm p-4 rounded-lg border border-border shadow-lg">
        <p className="label text-muted-foreground">{`${label}`}</p>
        <div style={{ color: payload[0].color }} className="flex items-center gap-2 font-semibold">
          Revenue: ₹{payload[0].value.toLocaleString()}
        </div>
      </div>
    );
  }
  return null;
};

const AdminDashboard = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
        const allUsers = await getAllUsers();
        setUsers(allUsers);
    } catch (error) {
        console.error("Failed to fetch users:", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const { totalRevenue, totalSales, totalUsers, revenueData } = useMemo(() => {
    if (!users || users.length === 0) {
        return { totalRevenue: 0, totalSales: 0, totalUsers: 0, revenueData: [] };
    }

    let revenue = 0;
    const proUsers = users.filter(u => u.subscription && u.subscription.plan !== 'free');
    const sales = proUsers.length;
    const userCount = users.length;

    const dailyRevenue = new Map<string, number>();

    proUsers.forEach(user => {
        const price = user.subscription.plan === 'monthly' ? 1299 : 12990;
        revenue += price;
        if(user.subscription.startDate) {
            const date = format(new Date(user.subscription.startDate), 'MMM d');
            dailyRevenue.set(date, (dailyRevenue.get(date) || 0) + price);
        }
    });

    const last30Days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
    const chartData = last30Days.map(day => {
        const formattedDate = format(day, 'MMM d');
        return {
            name: formattedDate,
            revenue: dailyRevenue.get(formattedDate) || 0,
        };
    });

    return { totalRevenue: revenue, totalSales: sales, totalUsers: userCount, revenueData: chartData };
  }, [users]);
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="text-muted-foreground">Fetching admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
            <div className="flex items-center gap-2 text-lg font-semibold md:text-base">
                <Bot className="h-6 w-6 text-primary" />
                <span>Talxify Admin</span>
            </div>
        </nav>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Based on all-time subscription sales</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{totalSales.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Number of subscriptions sold</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total registered users on the platform</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>Revenue from sales in the last 30 days.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#colorRevenue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>The last 5 users who signed up.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-8">
              {users.slice(-5).reverse().map((user, index) => (
                <div className="flex items-center gap-4" key={index}>
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">{user.portfolio.personalInfo.name}</p>
                    <p className="text-sm text-muted-foreground">{user.portfolio.personalInfo.email}</p>
                  </div>
                  <div className="ml-auto font-medium">
                    <Badge variant={user.subscription.plan !== 'free' ? 'default' : 'secondary'} className="capitalize">{user.subscription.plan}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>A complete list of all registered users.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Join Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...users].reverse().map((user, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="font-medium">{user.portfolio.personalInfo.name}</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        {user.portfolio.personalInfo.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.subscription.plan !== 'free' ? 'default' : 'secondary'} className="capitalize">{user.subscription.plan}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {user.subscription.startDate ? format(new Date(user.subscription.startDate), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};


export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setError('');

        setTimeout(() => {
            if (username === 'zaid' && password === 'admin') {
                setIsAuthenticated(true);
            } else {
                setError('Invalid username or password.');
            }
            setIsLoggingIn(false);
        }, 1000);
    };

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-muted/40">
                <Card className="w-full max-w-sm shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <Bot size={32} />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold font-headline">Admin Access</CardTitle>
                        <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                            {error && (
                                <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}
                            <Button type="submit" className="w-full" disabled={isLoggingIn}>
                                {isLoggingIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                                Sign In
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <AdminDashboard />;
}
