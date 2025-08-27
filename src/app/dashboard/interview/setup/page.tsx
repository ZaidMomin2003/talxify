
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/auth-context';
import { Briefcase, Loader2, PlayCircle, Building, Wifi, AlertTriangle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { useToast } from '@/hooks/use-toast';
import { checkAndIncrementUsage, getUserData } from '@/lib/firebase-service';
import type { UserData } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function InterviewSetup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('entry-level');
  const [role, setRole] = useState('Software Engineer');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    if (user) {
        getUserData(user.uid).then(setUserData);
    }
    const topicFromParams = searchParams.get('topic');
    if (topicFromParams) {
      setTopic(topicFromParams);
    }
  }, [searchParams, user]);

  const handleStartInterview = async () => {
    if (!user) {
        router.push('/login');
        return;
    }
    if (!topic || !level || !role) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError('');

    try {
        const usageCheck = await checkAndIncrementUsage(user.uid);
        if (!usageCheck.success) {
            toast({ title: "Usage Limit Reached", description: usageCheck.message, variant: "destructive" });
            router.push('/dashboard/pricing');
            setLoading(false);
            return;
        }

        const meetingId = user.uid + "_" + Date.now();
        const params = new URLSearchParams({ topic, level, role });
        if (company) {
            params.append('company', company);
        }
        router.push(`/dashboard/interview/${meetingId}?${params.toString()}`);
    } catch (e) {
        console.error("Failed to start interview session:", e);
        setError('Failed to create an interview session. Please try again.');
        setLoading(false);
    }
  };

  const isFreePlan = !userData?.subscription?.plan || userData.subscription.plan === 'free';

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <Briefcase className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="font-headline text-4xl font-bold">Mock Interview Setup</CardTitle>
            <CardDescription className="text-lg">
              Configure your AI-powered mock interview session.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
                <Wifi className="h-4 w-4" />
                <AlertTitle>Stable Connection Required</AlertTitle>
                <AlertDescription>
                    For the best experience, please ensure you are on a stable internet connection before starting the interview.
                </AlertDescription>
            </Alert>
            {isFreePlan && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Free Plan Limit</AlertTitle>
                    <AlertDescription>
                        Starting this session will use one of your limited AI credits for the free plan.
                    </AlertDescription>
                </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="topic">Interview Topic*</Label>
              <Input
                id="topic"
                placeholder="e.g., JavaScript, System Design"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="company">Target Company (Optional)</Label>
               <div className="relative">
                 <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="company"
                  placeholder="e.g., Google, Amazon, Netflix"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">Specifying a company helps the AI tailor its questions and interview style.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="level">Experience Level*</Label>
                <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger id="level">
                    <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="entry-level">Entry-level</SelectItem>
                    <SelectItem value="mid-level">Mid-level</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    </SelectContent>
                </Select>
                </div>
                <div className="space-y-2">
                <Label htmlFor="role">Job Role*</Label>
                <Input
                    id="role"
                    placeholder="e.g., Frontend Developer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                />
                </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="text-center pt-4">
              <Button onClick={handleStartInterview} size="lg" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
                Start Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function InterviewSetupPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>}>
            <InterviewSetup />
        </Suspense>
    )
}
