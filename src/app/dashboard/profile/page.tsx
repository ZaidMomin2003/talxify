
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, KeyRound, ShieldAlert, Trash2, RefreshCw, Edit, Save, X, Briefcase, Building, GraduationCap } from 'lucide-react';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, updateProfile } from 'firebase/auth';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { deleteUserDocument, getUserData, updatePortfolio } from '@/lib/firebase-service';
import type { UserData, InterviewActivity, QuizResult } from '@/lib/types';
import { Badge } from '@/components/ui/badge';


export default function ProfilePage() {
    const { user, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [userData, setUserData] = useState<UserData | null>(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    
    const fetchUserData = useCallback(async () => {
        if (user) {
            const data = await getUserData(user.uid);
            setUserData(data);
            setDisplayName(user.displayName || '');
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if(user) {
            fetchUserData();
        }
    }, [user, authLoading, router, fetchUserData]);
    
    const completedDays = useMemo(() => {
        if (!userData || !userData.syllabus || !userData.activity) return 0;
        
        const { syllabus, activity } = userData;
        const status: { [day: number]: { learn: boolean; quiz: boolean; interview: boolean; } } = {};

        syllabus.forEach(day => {
            status[day.day] = { learn: false, quiz: false, interview: false };
        });

        const sortedActivity = [...activity].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        sortedActivity.forEach(act => {
            const actTopic = act.details.topic.toLowerCase();
            const matchedDay = syllabus.find(d => {
                const syllabusTopic = d.topic.toLowerCase();
                if (act.type === 'interview' && (actTopic.includes('icebreaker') || syllabusTopic.includes('icebreaker'))) {
                    return d.day === 1;
                }
                return syllabusTopic.includes(actTopic) || actTopic.includes(syllabusTopic);
            });

            if (matchedDay && status[matchedDay.day]) {
                 if (act.type === 'note-generation') {
                    status[matchedDay.day].learn = true;
                 }
                 if (act.type === 'quiz' && (act as QuizResult).analysis?.length > 0) {
                    status[matchedDay.day].quiz = true;
                 }
                 if (act.type === 'interview' && (act as InterviewActivity).analysis) {
                    status[matchedDay.day].interview = true;
                 }
            }
        });

        let lastCompletedDay = 0;
        for (let i = 1; i <= syllabus.length; i++) {
            const dayStatus = status[i];
            if (!dayStatus) continue;

            const isFinalDay = i === 60;
            const learnRequired = !isFinalDay && i !== 1;
            const interviewRequired = isFinalDay || (i - 1) % 3 === 0;
            
            const isDayComplete = dayStatus.quiz && 
                                  (!learnRequired || dayStatus.learn) && 
                                  (!interviewRequired || dayStatus.interview);

            if (isDayComplete) {
                lastCompletedDay = i;
            } else {
                break;
            }
        }
        return lastCompletedDay;
    }, [userData]);


    const handleNameUpdate = async () => {
        if (!user || !displayName.trim()) {
            toast({ title: "Name is required", variant: "destructive" });
            return;
        }
        setIsUpdating(true);
        try {
            await updateProfile(user, { displayName: displayName.trim() });
            if (userData?.portfolio) {
                const updatedPortfolio = { ...userData.portfolio };
                updatedPortfolio.personalInfo.name = displayName.trim();
                await updatePortfolio(user.uid, updatedPortfolio);
            }
            toast({ title: "Success", description: "Your name has been updated." });
            setIsEditingName(false);
        } catch (error: any) {
            toast({ title: "Error", description: "Could not update your name.", variant: "destructive" });
        } finally {
            setIsUpdating(false);
        }
    };


    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
            return;
        }
        if (!user || !user.email) return;

        setIsUpdating(true);
        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            
            toast({ title: "Success", description: "Your password has been updated successfully." });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error("Password update error:", error);
            toast({ title: "Error updating password", description: error.message, variant: "destructive" });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!user) return;
        setIsDeleting(true);
        try {
            // First, delete the Firestore document associated with the user
            await deleteUserDocument(user.uid);
            // Then, delete the user from Firebase Auth
            await user.delete();

            toast({ title: "Account Deleted", description: "Your account and all associated data have been permanently deleted." });
            // The onAuthStateChanged listener in AuthProvider will handle redirecting to /login
        } catch (error: any) {
            console.error("Account deletion error:", error);
            // If re-authentication is required, guide the user
            if (error.code === 'auth/requires-recent-login') {
                toast({
                    title: "Re-authentication Required",
                    description: "For security, please log out and log back in before deleting your account.",
                    variant: "destructive",
                });
            } else {
                toast({ title: "Error deleting account", description: error.message, variant: "destructive" });
            }
        } finally {
            setIsDeleting(false);
        }
    };

    if (authLoading || !user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    const isSocialLogin = user.providerData.some(
        provider => provider.providerId === 'google.com' || provider.providerId === 'github.com'
    );

    return (
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3"><User className="h-6 w-6"/> User Profile</CardTitle>
                        <CardDescription>View and manage your account information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <Label>Full Name</Label>
                            <div className="flex items-center gap-2">
                                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} disabled={!isEditingName} />
                                {isEditingName ? (
                                    <>
                                        <Button size="icon" onClick={handleNameUpdate} disabled={isUpdating}>
                                            {isUpdating ? <Loader2 className="animate-spin" /> : <Save />}
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={() => { setIsEditingName(false); setDisplayName(user.displayName || ''); }}>
                                            <X />
                                        </Button>
                                    </>
                                ) : (
                                    <Button size="icon" variant="outline" onClick={() => setIsEditingName(true)}>
                                        <Edit />
                                    </Button>
                                )}
                            </div>
                        </div>
                         <div className="space-y-1">
                            <Label>Email</Label>
                            <Input value={user.email || 'Not set'} disabled />
                        </div>
                    </CardContent>
                </Card>

                {userData && (userData.portfolio?.education?.length > 0 || userData.onboardingInfo?.roles?.length > 0) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3"><Briefcase className="h-6 w-6"/> Career Profile</CardTitle>
                            <CardDescription>Information from your onboarding process.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {userData.portfolio.education?.[0]?.institution && (
                                <div className="space-y-1">
                                    <Label>University / College</Label>
                                    <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
                                        <GraduationCap className="h-5 w-5 text-muted-foreground"/>
                                        <p>{userData.portfolio.education[0].institution}</p>
                                    </div>
                                </div>
                            )}
                             {userData.portfolio.education?.[0]?.degree && (
                                <div className="space-y-1">
                                    <Label>Major / Field of Study</Label>
                                     <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
                                        <p>{userData.portfolio.education[0].degree}</p>
                                    </div>
                                </div>
                            )}
                            {userData.onboardingInfo?.roles && userData.onboardingInfo.roles.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Target Roles</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {userData.onboardingInfo.roles.map(role => (
                                            <Badge key={role} variant="secondary">{role}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                             {userData.onboardingInfo?.companies && userData.onboardingInfo.companies.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Target Companies</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {userData.onboardingInfo.companies.map(company => (
                                            <Badge key={company}>{company}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}


                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3"><KeyRound className="h-6 w-6"/> Change Password</CardTitle>
                        <CardDescription>Update your password below.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isSocialLogin ? (
                             <p className="text-sm text-muted-foreground">
                                You signed in with a social provider (Google or GitHub). Password management is handled by your provider.
                            </p>
                        ) : (
                            <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor="current-password">Current Password</Label>
                                    <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                                </div>
                                 <div className="space-y-1">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                                </div>
                                 <div className="space-y-1">
                                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                                    <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                </div>
                                <Button type="submit" disabled={isUpdating}>
                                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Password
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>


                 <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-destructive"><ShieldAlert className="h-6 w-6"/> Danger Zone</CardTitle>
                        <CardDescription>These actions are permanent and cannot be undone.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4"/>
                                    Delete My Account
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your account, portfolio, and all associated data from our servers. To confirm, please type <strong className="text-foreground">{user.email}</strong> below.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <Input
                                    placeholder="Confirm your email"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                />
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDeleteAccount}
                                    disabled={isDeleting || deleteConfirmText !== user.email}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Yes, delete my account
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <p className="text-sm text-muted-foreground mt-2">
                           Permanently delete your account and all of your content.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}

    