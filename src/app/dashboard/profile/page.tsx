
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, KeyRound, ShieldAlert, Trash2, RefreshCw } from 'lucide-react';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { deleteUserDocument } from '@/lib/firebase-service';

export default function ProfilePage() {
    const { user, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

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
    
    // Determine if the user signed in with a social provider
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
                            <Input value={user.displayName || 'Not set'} disabled />
                        </div>
                         <div className="space-y-1">
                            <Label>Email</Label>
                            <Input value={user.email || 'Not set'} disabled />
                        </div>
                    </CardContent>
                </Card>

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

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3"><RefreshCw className="h-6 w-6"/> Account Actions</CardTitle>
                        <CardDescription>Manage your account settings and preferences.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" onClick={() => router.push('/onboarding')}>
                            <RefreshCw className="mr-2 h-4 w-4"/>
                            Redo Onboarding & Regenerate Syllabus
                        </Button>
                         <p className="text-sm text-muted-foreground mt-2">
                           Generate a new 60-day learning plan based on different roles or companies. Your stats will not be affected.
                        </p>
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
