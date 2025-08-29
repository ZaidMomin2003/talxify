
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Briefcase, PlayCircle, Loader2, Building, RefreshCw, AlertTriangle } from 'lucide-react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { checkAndIncrementUsage, getRetakeCount, incrementRetakeCount } from '@/lib/firebase-service';

const MAX_RETAKES = 3;

function Instructions() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const interviewId = params.interviewId as string;
  const initialTopic = searchParams.get('topic') || '';

  const [topic, setTopic] = useState(initialTopic);
  const [level, setLevel] = useState(searchParams.get('level') || 'entry-level');
  const [role, setRole] = useState(search_params.get('role') || 'Software Engineer');
  const [company, setCompany] = useState(searchParams.get('company') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retakeCount, setRetakeCount] = useState(0);

  const fetchRetakeCount = useCallback(async () => {
    if (user && topic) {
        const count = await getRetakeCount(user.uid, topic);
        setRetakeCount(count);
    }
  }, [user, topic]);

  useEffect(() => {
    fetchRetakeCount();
  }, [fetchRetakeCount]);

  const handleStartInterview = async () => {
    if (!user) {
        router.push('/login');
        return;
    }
    if (!topic || !level || !role) {
      setError('Please fill in all required fields.');
      return;
    }

    if(retakeCount >= MAX_RETAKES) {
        toast({ title: "Retake Limit Reached", description: `You have used all ${MAX_RETAKES} retakes for this topic.`, variant: "destructive" });
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

        await incrementRetakeCount(user.uid, topic);

        const queryParams = new URLSearchParams({ topic, level, role });
        if (company) {
            queryParams.append('company', company);
        }
        router.push(`/dashboard/interview/${interviewId}?${queryParams.toString()}`);
    } catch (e) {
        console.error("Failed to start interview session:", e);
        setError('Failed to create an interview session. Please try again.');
        setLoading(false);
    }
  };

  const chancesLeft = MAX_RETAKES - retakeCount;

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <Briefcase className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="font-headline text-4xl font-bold">Mock Interview Setup</CardTitle>
            <CardDescription className="text-lg">
              Confirm the details for your AI-powered mock interview session.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
            <Alert variant={chancesLeft > 0 ? "default" : "destructive"}>
                <RefreshCw className="h-4 w-4" />
                <AlertTitle>Retake Information</AlertTitle>
                <AlertDescription>
                    You have {chancesLeft > 0 ? chancesLeft : 0} of {MAX_RETAKES} retakes left for this topic.
                </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <div className="text-center pt-4">
            <Button onClick={handleStartInterview} size="lg" disabled={loading || (chancesLeft <= 0 && !!topic)}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
                Start Interview
            </Button>
        </div>
      </div>
    </main>
  );
}


export default function InterviewInstructionsPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>}>
            <Instructions />
        </Suspense>
    )
}
