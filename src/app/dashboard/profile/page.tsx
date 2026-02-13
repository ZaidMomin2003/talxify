
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

import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
};

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
        if (user) {
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
            await deleteUserDocument(user.uid);
            await user.delete();
            toast({ title: "Account Deleted", description: "Your account and all associated data have been permanently deleted." });
        } catch (error: any) {
            console.error("Account deletion error:", error);
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
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    const isSocialLogin = user.providerData.some(
        provider => provider.providerId === 'google.com' || provider.providerId === 'github.com'
    );

    return (
        <main className="flex-1 p-4 sm:p-6 lg:p-10 bg-background/50 relative overflow-x-hidden min-h-screen">
            <motion.div
                className="max-w-4xl mx-auto space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Profile Header */}
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
                    <div className="relative flex flex-col md:flex-row items-center gap-6">
                        <div className="relative">
                            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 p-1">
                                <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-white text-3xl font-black">
                                    {displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-lg bg-background border border-border flex items-center justify-center shadow-lg">
                                <User className="h-4 w-4 text-primary" />
                            </div>
                        </div>
                        <div className="text-center md:text-left space-y-1">
                            <h2 className="text-3xl font-black text-white tracking-tight italic uppercase">
                                {displayName || "New Member"}
                            </h2>
                            <p className="text-muted-foreground font-medium">{user.email}</p>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 font-bold uppercase tracking-widest text-[10px]">
                                    {isSocialLogin ? "Social Account" : "Standard Account"}
                                </Badge>
                                <Badge variant="outline" className="border-white/10 text-white/50 px-3 font-bold uppercase tracking-widest text-[10px]">
                                    Member since {new Date(user.metadata.creationTime || Date.now()).toLocaleDateString()}
                                </Badge>
                            </div>
                        </div>
                        <div className="md:ml-auto flex flex-col items-center md:items-end gap-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Training Progress</p>
                            <div className="flex items-center gap-2">
                                <span className="text-4xl font-black text-primary italic leading-none">{completedDays}</span>
                                <div className="flex flex-col">
                                    <span className="text-xs font-black uppercase text-white/80 leading-none">Days</span>
                                    <span className="text-[10px] font-medium text-muted-foreground leading-none">Completed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Account Settings */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div variants={itemVariants}>
                            <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-xl overflow-hidden">
                                <CardHeader className="border-b border-white/5 bg-white/5">
                                    <CardTitle className="flex items-center gap-3 text-lg font-black uppercase tracking-tight italic">
                                        <User className="h-5 w-5 text-primary" /> Personal Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex-1 group">
                                                <Input
                                                    value={displayName}
                                                    onChange={(e) => setDisplayName(e.target.value)}
                                                    disabled={!isEditingName}
                                                    className="bg-black/20 border-white/5 h-11 focus:ring-primary/20 transition-all"
                                                />
                                                {!isEditingName && <div className="absolute inset-0 bg-transparent cursor-not-allowed" />}
                                            </div>
                                            {isEditingName ? (
                                                <div className="flex items-center gap-2">
                                                    <Button size="icon" className="h-11 w-11 rounded-xl shadow-lg shadow-primary/20" onClick={handleNameUpdate} disabled={isUpdating}>
                                                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                    </Button>
                                                    <Button size="icon" variant="outline" className="h-11 w-11 rounded-xl border-white/10 bg-white/5" onClick={() => { setIsEditingName(false); setDisplayName(user.displayName || ''); }}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button size="icon" variant="outline" className="h-11 w-11 rounded-xl border-white/10 bg-white/5 group-hover:border-primary/50 transition-colors" onClick={() => setIsEditingName(true)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Registered Email</Label>
                                        <Input value={user.email || 'Not set'} disabled className="bg-black/40 border-white/5 h-11 opacity-60" />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-xl overflow-hidden">
                                <CardHeader className="border-b border-white/5 bg-white/5">
                                    <CardTitle className="flex items-center gap-3 text-lg font-black uppercase tracking-tight italic">
                                        <KeyRound className="h-5 w-5 text-primary" /> Security
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {isSocialLogin ? (
                                        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex gap-4 items-start">
                                            <ShieldAlert className="h-6 w-6 text-primary shrink-0" />
                                            <div>
                                                <p className="text-sm font-bold text-white mb-1">Managed by Provider</p>
                                                <p className="text-xs text-muted-foreground">
                                                    You signed in with Google/GitHub. Security settings are handled on their respective platforms.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <form onSubmit={handlePasswordUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2 space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1" htmlFor="current-password">Current Password</Label>
                                                <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="bg-black/20 border-white/5 h-11" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1" htmlFor="new-password">New Password</Label>
                                                <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="bg-black/20 border-white/5 h-11" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1" htmlFor="confirm-password">Confirm Password</Label>
                                                <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="bg-black/20 border-white/5 h-11" />
                                            </div>
                                            <div className="md:col-span-2 pt-2">
                                                <Button type="submit" disabled={isUpdating} className="h-11 px-8 rounded-xl font-bold uppercase tracking-wider text-xs">
                                                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Update Password
                                                </Button>
                                            </div>
                                        </form>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Right Column: Profile & Danger Zone */}
                    <div className="space-y-8">
                        {userData && (userData.portfolio?.education?.length > 0 || userData.onboardingInfo?.roles?.length > 0) && (
                            <motion.div variants={itemVariants}>
                                <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-xl overflow-hidden">
                                    <CardHeader className="border-b border-white/5 bg-white/5">
                                        <CardTitle className="flex items-center gap-3 text-lg font-black uppercase tracking-tight italic">
                                            <Briefcase className="h-5 w-5 text-primary" /> Career
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        {userData.portfolio.education?.[0]?.institution && (
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Institution</Label>
                                                <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/5">
                                                    <GraduationCap className="h-5 w-5 text-primary shrink-0" />
                                                    <p className="text-sm font-semibold truncate text-white/90">{userData.portfolio.education[0].institution}</p>
                                                </div>
                                            </div>
                                        )}
                                        {userData.onboardingInfo?.roles && (
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Target Roles</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {userData.onboardingInfo.roles.map(role => (
                                                        <Badge key={role} variant="secondary" className="bg-white/5 border-white/10 text-white/70 hover:bg-white/10 transition-colors">
                                                            {role}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {userData.onboardingInfo?.companies && (
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Target Companies</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {userData.onboardingInfo.companies.map(company => (
                                                        <Badge key={company} className="bg-primary/20 text-primary border-primary/30 font-bold">
                                                            {company}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        <motion.div variants={itemVariants}>
                            <Card className="border-destructive/30 bg-destructive/5 backdrop-blur-xl shadow-xl overflow-hidden">
                                <CardHeader className="border-b border-destructive/10 bg-destructive/10">
                                    <CardTitle className="flex items-center gap-3 text-lg font-black uppercase tracking-tight italic text-destructive">
                                        <ShieldAlert className="h-5 w-5" /> Danger Zone
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <p className="text-xs text-muted-foreground font-medium">
                                        Once your account is deleted, all your data will be permanently removed. This action is irreversible.
                                    </p>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" className="w-full h-11 rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg shadow-destructive/10">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete My Account
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-background border-border rounded-3xl p-8 max-w-md mx-auto">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="text-[28px] font-black tracking-tighter uppercase italic text-foreground text-center">Final Warning</AlertDialogTitle>
                                                <AlertDialogDescription className="text-center text-muted-foreground py-4">
                                                    All your data, including mocks, portfolio, and resumes, will be purged.
                                                    <br /><br />
                                                    To confirm, please type <strong className="text-foreground border-b border-primary">{user.email}</strong> below.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <Input
                                                placeholder="Confirm your email"
                                                value={deleteConfirmText}
                                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                                className="bg-muted border-border h-12 text-center"
                                            />
                                            <AlertDialogFooter className="mt-8 flex flex-col sm:flex-row gap-3">
                                                <AlertDialogCancel className="w-full sm:w-1/2 rounded-xl h-12">Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={handleDeleteAccount}
                                                    disabled={isDeleting || deleteConfirmText !== user.email}
                                                    className="w-full sm:w-1/2 rounded-xl h-12 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Confirm Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </main>
    )
}

