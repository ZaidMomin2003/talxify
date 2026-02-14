

"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { PlusCircle, Trash2, Loader2, Lock, Gem, ExternalLink, Link as LinkIcon, UploadCloud, Image as ImageIcon, Save, CheckCircle, AlertTriangle, UserCheck } from "lucide-react";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { getUserData as fetchUserData } from "@/lib/firebase-service";
import type { Portfolio, Project, Certificate, Achievement, Testimonial, FAQ, Skill, WorkExperience, Education, UserData } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { initialPortfolioData } from "@/lib/initial-data";
import { Slider } from "@/components/ui/slider";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import Script from "next/script";
import { Switch } from "@/components/ui/switch";
import { getUserBySlug } from "@/app/zaidmin/actions";
import { updatePortfolio } from "@/lib/firebase-service";
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};


const CloudinaryIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.129 23.333c-6.108 0-11.23-4.7-11.23-10.82 0-5.943 4.908-10.82 11.23-10.82 1.637 0 3.342.38 4.887 1.14C21.411 2.373 19.866 2 18.257 2c-6.108 0-11.23 4.7-11.23 10.82 0 5.943 4.908 10.82 11.23 10.82.99 0 1.98-.152 2.871-.456-1.14.76-2.585 1.14-4.028 1.14z" fill="#F4B03E"></path>
        <path d="M22.846 12.333c0-1.825-.608-3.422-1.748-4.752-1.516-1.748-3.8-2.813-6.157-2.813-1.637 0-3.342.38-4.887 1.14C8.66 7.428 7.029 9.775 7.029 12.507c0 5.943 4.908 10.82 11.23 10.82.99 0 1.98-.152 2.871-.456.99-.304 1.825-.76 2.585-1.368 1.14-1.064 1.9-2.508 1.9-4.18z" fill="url(#a)" opacity="0.6"></path>
        <path d="M22.846 12.333c0-1.825-.608-3.422-1.748-4.752-1.516-1.748-3.8-2.813-6.157-2.813-1.637 0-3.342.38-4.887 1.14C8.66 7.428 7.029 9.775 7.029 12.507c0 5.943 4.908 10.82 11.23 10.82.99 0 1.98-.152 2.871-.456.99-.304 1.825-.76 2.585-1.368 1.14-1.064 1.9-2.508 1.9-4.18z" fill="#2E70A9"></path>
        <path d="M23.987 11.725c0-1.749-.684-3.347-1.825-4.599-1.516-1.596-3.725-2.66-6.157-2.66-1.637 0-3.342.38-4.887 1.14 1.292-1.444 3.193-2.356 5.174-2.356 4.908 0 8.688 3.498 8.688 7.6.086 2.053-.77 3.877-2.053 5.174-1.368 1.292-3.194 2.129-5.175 2.129-1.825 0-3.498-.77-4.724-1.976a7.35 7.35 0 0 1-1.292-1.672c.456.076.912.076 1.368.076 4.908 0 8.688-3.422 8.688-7.524z" fill="#58A663"></path>
        <defs>
            <linearGradient id="a" x1="14.398" y1="13.111" x2="22.541" y2="20.322" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fff" stopOpacity="0.4"></stop>
                <stop offset="1" stopColor="#fff" stopOpacity="0"></stop>
            </linearGradient>
        </defs>
    </svg>
);


const ImagePicker = ({ value, onChange, dataAiHint, isAvatar, isCloudinaryLoaded }: { value: string, onChange: (value: string) => void, dataAiHint: string, isAvatar?: boolean, isCloudinaryLoaded: boolean }) => {
    const { toast } = useToast();
    const cloudinaryRef = useRef<any>();
    const widgetRef = useRef<any>();

    useEffect(() => {
        if (isCloudinaryLoaded) {
            cloudinaryRef.current = (window as any).cloudinary;
            widgetRef.current = cloudinaryRef.current.createUploadWidget({
                cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
                sources: ['local', 'url', 'camera', 'google_drive', 'unsplash', 'instagram', 'facebook'],
                multiple: false,
                cropping: true,
                croppingAspectRatio: isAvatar ? 1 : 1.91,
                showAdvancedOptions: false,
                theme: 'minimal',
                styles: {
                    palette: {
                        window: '#000000',
                        sourceBg: '#000000',
                        windowBorder: '#333333',
                        tabIcon: '#FFFFFF',
                        inactiveTabIcon: '#666666',
                        menuIcons: '#FFFFFF',
                        link: '#FFFFFF',
                        action: '#FFFFFF',
                        inProgress: '#FFFFFF',
                        complete: '#FFFFFF',
                        error: '#FF0000',
                        textDark: '#000000',
                        textLight: '#FFFFFF'
                    }
                }
            }, (error: any, result: any) => {
                if (!error && result && result.event === "success") {
                    onChange(result.info.secure_url);
                }
                if (error) {
                    console.error("Cloudinary Error:", error);
                    toast({ title: 'Upload Error', description: 'Failed to upload image. Please try again.', variant: 'destructive' });
                }
            });
        }
    }, [isCloudinaryLoaded, onChange, toast, isAvatar]);

    const openWidget = () => {
        if (widgetRef.current) {
            widgetRef.current.open();
        }
    }

    const containerClasses = isAvatar
        ? "w-32 h-32 rounded-full bg-muted/40 dark:bg-black/40 border-2 border-dashed border-border dark:border-white/10 flex items-center justify-center overflow-hidden mx-auto shadow-2xl relative group"
        : "aspect-video w-full rounded-2xl bg-muted/40 dark:bg-black/40 border-2 border-dashed border-border dark:border-white/10 flex items-center justify-center overflow-hidden shadow-xl relative group";

    return (
        <div className="space-y-4">
            <div className={containerClasses}>
                {value ? (
                    <>
                        <Image src={value} alt="Image preview" width={isAvatar ? 128 : 400} height={isAvatar ? 128 : 210} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" data-ai-hint={dataAiHint} />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <UploadCloud className="w-8 h-8 text-white/50" />
                        </div>
                    </>
                ) : (
                    <div className="text-center text-muted-foreground p-6">
                        <ImageIcon className="mx-auto h-12 w-12 mb-3 text-white/10" />
                        <p className="text-[10px] font-black uppercase tracking-widest italic">Signal Missing</p>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-10 rounded-xl bg-muted/50 dark:bg-white/5 border-border dark:border-white/10 hover:border-primary/50 text-[10px] font-black uppercase tracking-widest italic group" onClick={openWidget} disabled={!isCloudinaryLoaded}>
                    <UploadCloud className="h-3.5 w-3.5 mr-2 group-hover:text-primary transition-colors" />
                    <span>{isCloudinaryLoaded ? 'Sync Asset' : 'Loading...'}</span>
                </Button>
                <Button variant="ghost" className="h-10 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive text-[10px] font-black uppercase tracking-widest italic" onClick={() => onChange("")} disabled={!value}>
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    <span>Purge</span>
                </Button>
            </div>
        </div>
    )
}

const colorOptions = [
    { name: 'Default', hsl: '221.2 83.2% 53.3%' },
    { name: 'Forest Green', hsl: '142.1 76.2% 36.3%' },
    { name: 'Midnight Blue', hsl: '210 40% 30%' },
    { name: 'Ruby Red', hsl: '0 100% 35%' },
    { name: 'Royal Purple', hsl: '260 50% 40%' },
];


export default function PortfolioPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isCloudinaryLoaded, setIsCloudinaryLoaded] = useState(false);

    const [isCheckingSlug, setIsCheckingSlug] = useState(false);
    const [slugStatus, setSlugStatus] = useState<'idle' | 'available' | 'taken' | 'invalid'>('idle');
    const [slugMessage, setSlugMessage] = useState('');


    const fetchInitialData = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);

        const data = await fetchUserData(user.uid);
        setUserData(data);

        if (data?.portfolio) {
            const currentPortfolio = data.portfolio ?? initialPortfolioData.portfolio;
            if (!currentPortfolio.displayOptions) {
                currentPortfolio.displayOptions = initialPortfolioData.portfolio.displayOptions;
            }
            setPortfolio(currentPortfolio);
        } else {
            setPortfolio(initialPortfolioData.portfolio);
        }

        setIsLoading(false);
    }, [user]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handleSave = async () => {
        if (!user || !portfolio) return;
        setIsSaving(true);
        try {
            await updatePortfolio(user.uid, portfolio);
            toast({
                title: "Portfolio Saved",
                description: "Your portfolio has been successfully updated.",
            });
        } catch (error) {
            console.error("Failed to save portfolio:", error);
            toast({
                title: "Save Failed",
                description: "Could not save your portfolio. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    }

    const handleFieldChange = (section: keyof Portfolio, index: number, field: string, value: string | number) => {
        setPortfolio(prev => {
            if (!prev) return null;
            const newPortfolio = { ...prev };
            // @ts-ignore
            const newSection = [...newPortfolio[section]];
            newSection[index] = { ...newSection[index], [field]: value };
            return { ...newPortfolio, [section]: newSection };
        });
    };


    const handleAddItem = (section: keyof Portfolio, newItem: any) => {
        setPortfolio(prev => {
            if (!prev) return null;
            const newPortfolio = { ...prev };
            // @ts-ignore
            newPortfolio[section] = [...newPortfolio[section], newItem];
            return newPortfolio;
        });
    };

    const handleRemoveItem = (section: keyof Portfolio, index: number) => {
        setPortfolio(prev => {
            if (!prev) return null;
            const newPortfolio = { ...prev };
            // @ts-ignore
            newPortfolio[section] = newPortfolio[section].filter((_, i) => i !== index);
            return newPortfolio;
        });
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!portfolio) return;
        setSlugStatus('idle');
        setSlugMessage('');
        const rawSlug = e.target.value;
        const sanitizedSlug = rawSlug
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-');
        setPortfolio({ ...portfolio, personalInfo: { ...portfolio.personalInfo, slug: sanitizedSlug } });
    }

    const handleCheckSlug = async () => {
        if (!user || !portfolio?.personalInfo.slug) return;

        setIsCheckingSlug(true);
        setSlugStatus('idle');
        setSlugMessage('');

        if (portfolio.personalInfo.slug.length < 3) {
            setSlugStatus('invalid');
            setSlugMessage('Slug must be at least 3 characters long.');
            setIsCheckingSlug(false);
            return;
        }

        const existingUser = await getUserBySlug(portfolio.personalInfo.slug);
        if (existingUser && existingUser.id !== user.uid) {
            setSlugStatus('taken');
            setSlugMessage('This URL is already taken. Please choose another.');
        } else {
            setSlugStatus('available');
            setSlugMessage('This URL is available!');
        }
        setIsCheckingSlug(false);
    }

    const handleDisplayOptionChange = (option: keyof Portfolio['displayOptions'], value: boolean) => {
        if (!portfolio) return;
        setPortfolio(prev => {
            if (!prev) return null;
            return {
                ...prev,
                displayOptions: {
                    ...prev.displayOptions,
                    [option]: value,
                },
            };
        });
    };


    if (isLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!portfolio) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Card className="max-w-md w-full text-center shadow-lg">
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                        <CardDescription>Could not load portfolio data.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }


    return (
        <>
            <Script
                src="https://upload-widget.cloudinary.com/global/all.js"
                onLoad={() => setIsCloudinaryLoaded(true)}
            />
            <main className="flex-1 p-4 sm:p-6 lg:p-10 bg-background/50 relative overflow-x-hidden min-h-screen flex flex-col">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

                <motion.div
                    className="max-w-4xl mx-auto w-full space-y-10 relative z-10 flex-1"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="space-y-4">
                        <motion.div variants={itemVariants} className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 border border-primary/20 mb-2">
                            <Gem className="w-8 h-8 text-primary" />
                        </motion.div>
                        <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-black tracking-tight italic uppercase text-foreground leading-none">
                            Portfolio <span className="text-primary">Forge</span>
                        </motion.h1>
                        <motion.p variants={itemVariants} className="max-w-2xl text-muted-foreground text-lg font-medium">
                            Architect your digital presence with industrial-grade precision.
                        </motion.p>
                    </div>

                    <motion.div variants={itemVariants} className="space-y-8">
                        <Card className="rounded-[2.5rem] border-border dark:border-white/10 bg-card/60 dark:bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden border">
                            <CardHeader className="p-8 md:p-10 border-b border-border dark:border-white/5 bg-muted/20 dark:bg-white/5">
                                <CardTitle className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-3">
                                    <UserCheck className="w-6 h-6 text-primary" />
                                    Personnel Data
                                </CardTitle>
                                <CardDescription className="text-base mt-1 text-muted-foreground">Core identification and bio-metrics for your public profile.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 md:p-10 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                                        <Input placeholder="Enter your name" className="bg-muted dark:bg-black/20 border-border dark:border-white/5 h-12 rounded-xl focus:ring-primary/20 text-foreground" value={portfolio.personalInfo.name} onChange={(e) => setPortfolio({ ...portfolio, personalInfo: { ...portfolio.personalInfo, name: e.target.value } })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Role</Label>
                                        <Input placeholder="e.g. Senior Developer" className="bg-muted dark:bg-black/20 border-border dark:border-white/5 h-12 rounded-xl focus:ring-primary/20 text-foreground" value={portfolio.personalInfo.profession} onChange={(e) => setPortfolio({ ...portfolio, personalInfo: { ...portfolio.personalInfo, profession: e.target.value } })} />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="slug" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                                        <LinkIcon className="w-4 h-4 text-primary" />
                                        Deployment URL
                                    </Label>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 overflow-hidden bg-muted/50 dark:bg-black/20 border border-border dark:border-white/5 rounded-2xl p-1">
                                        <div className="flex items-center flex-1">
                                            <span className="text-xs font-bold text-muted-foreground px-4 py-2 bg-background dark:bg-white/5 rounded-xl border border-border dark:border-white/5 hidden sm:inline-block">
                                                talxify.space/portfolio/
                                            </span>
                                            <Input id="slug" value={portfolio.personalInfo.slug} onChange={handleSlugChange} className="border-0 focus-visible:ring-0 bg-transparent h-10 px-4 text-sm font-bold placeholder:text-muted-foreground/30 text-foreground" placeholder="your-unique-slug" />
                                        </div>
                                        <Button onClick={handleCheckSlug} disabled={isCheckingSlug} className="h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] italic">
                                            {isCheckingSlug ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Check Status'}
                                        </Button>
                                    </div>
                                    {slugMessage && (
                                        <div className={cn("flex items-center gap-2 text-[10px] font-bold mt-1 ml-1",
                                            slugStatus === 'available' ? "text-primary" : "text-destructive"
                                        )}>
                                            {slugStatus === 'available' ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                                            {slugMessage}
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="bio" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Professional Abstract</Label>
                                        <Textarea id="bio" placeholder="Brief personnel overview..." className="bg-muted dark:bg-black/20 border-border dark:border-white/5 min-h-[120px] rounded-xl focus:ring-primary/20 p-4 text-foreground" value={portfolio.personalInfo.bio} onChange={(e) => setPortfolio({ ...portfolio, personalInfo: { ...portfolio.personalInfo, bio: e.target.value } })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="philosophy" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Development Creed</Label>
                                        <Textarea id="philosophy" placeholder="Core architectural beliefs..." className="bg-muted dark:bg-black/20 border-border dark:border-white/5 min-h-[120px] rounded-xl focus:ring-primary/20 p-4 text-foreground" value={portfolio.personalInfo.developmentPhilosophy || ''} onChange={(e) => setPortfolio({ ...portfolio, personalInfo: { ...portfolio.personalInfo, developmentPhilosophy: e.target.value } })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Neural ID Image</Label>
                                        <div className="bg-muted dark:bg-black/20 p-6 rounded-3xl border border-border dark:border-white/5">
                                            <ImagePicker
                                                value={portfolio.personalInfo.avatarUrl}
                                                onChange={(value) => setPortfolio({ ...portfolio, personalInfo: { ...portfolio.personalInfo, avatarUrl: value } })}
                                                dataAiHint="person avatar"
                                                isAvatar
                                                isCloudinaryLoaded={isCloudinaryLoaded}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Operational Banner</Label>
                                        <div className="bg-muted dark:bg-black/20 p-6 rounded-3xl border border-border dark:border-white/5 h-full">
                                            <ImagePicker
                                                value={portfolio.personalInfo.bannerUrl}
                                                onChange={(value) => setPortfolio({ ...portfolio, personalInfo: { ...portfolio.personalInfo, bannerUrl: value } })}
                                                dataAiHint="abstract banner"
                                                isCloudinaryLoaded={isCloudinaryLoaded}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="youtubeUrl" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                                        <ExternalLink className="w-4 h-4 text-primary" />
                                        Broadcast Integrated (YouTube)
                                    </Label>
                                    <Input id="youtubeUrl" placeholder="Link to your mission briefing..." className="bg-muted dark:bg-black/20 border-border dark:border-white/5 h-12 rounded-xl focus:ring-primary/20 px-4 text-foreground" value={portfolio.personalInfo.youtubeVideoUrl} onChange={(e) => setPortfolio({ ...portfolio, personalInfo: { ...portfolio.personalInfo, youtubeVideoUrl: e.target.value } })} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">GitHub Sink</Label><Input className="bg-muted dark:bg-black/20 border-border dark:border-white/5 h-10 rounded-lg focus:ring-primary/20 px-4 text-foreground" value={portfolio.socials.github} onChange={(e) => setPortfolio({ ...portfolio, socials: { ...portfolio.socials, github: e.target.value } })} /></div>
                                    <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">LinkedIn Uplink</Label><Input className="bg-muted dark:bg-black/20 border-border dark:border-white/5 h-10 rounded-lg focus:ring-primary/20 px-4 text-foreground" value={portfolio.socials.linkedin} onChange={(e) => setPortfolio({ ...portfolio, socials: { ...portfolio.socials, linkedin: e.target.value } })} /></div>
                                    <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">X-Comms</Label><Input className="bg-muted dark:bg-black/20 border-border dark:border-white/5 h-10 rounded-lg focus:ring-primary/20 px-4 text-foreground" value={portfolio.socials.twitter} onChange={(e) => setPortfolio({ ...portfolio, socials: { ...portfolio.socials, twitter: e.target.value } })} /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Primary Email</Label>
                                        <Input type="email" className="bg-muted dark:bg-black/20 border-border dark:border-white/5 h-12 rounded-xl focus:ring-primary/20 px-4 text-foreground" value={portfolio.personalInfo.email} onChange={(e) => setPortfolio({ ...portfolio, personalInfo: { ...portfolio.personalInfo, email: e.target.value } })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Comm Channel (Phone)</Label>
                                        <Input type="tel" className="bg-muted dark:bg-black/20 border-border dark:border-white/5 h-12 rounded-xl focus:ring-primary/20 px-4 text-foreground" value={portfolio.personalInfo.phone} onChange={(e) => setPortfolio({ ...portfolio, personalInfo: { ...portfolio.personalInfo, phone: e.target.value } })} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[2.5rem] border-border dark:border-white/10 bg-card/60 dark:bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden border">
                            <CardHeader className="p-8 md:p-10 border-b border-border dark:border-white/5 bg-muted/20 dark:bg-white/5">
                                <CardTitle className="text-xl font-black uppercase tracking-tight italic flex items-center gap-3">
                                    <PlusCircle className="w-5 h-5 text-primary" />
                                    Visual Identity
                                </CardTitle>
                                <CardDescription className="mt-1 text-muted-foreground">Define the chromatic signature for your profile.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 md:p-10">
                                <div className="flex flex-wrap gap-4">
                                    {colorOptions.map((color) => (
                                        <div key={color.name} className="flex items-center gap-3 bg-muted/50 dark:bg-white/5 p-3 rounded-2xl border border-border dark:border-white/5 hover:border-border dark:hover:border-white/10 transition-colors">
                                            <button
                                                onClick={() => setPortfolio({ ...portfolio, themeColor: color.hsl })}
                                                className={cn(
                                                    "w-10 h-10 rounded-full border-2 transition-all transform hover:scale-110",
                                                    portfolio.themeColor === color.hsl ? "border-primary scale-110 shadow-[0_0_15px_rgba(var(--primary),0.4)]" : "border-transparent"
                                                )}
                                                style={{ backgroundColor: `hsl(${color.hsl})` }}
                                            />
                                            <Label className="font-bold text-xs uppercase tracking-widest">{color.name}</Label>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[2.5rem] border-border dark:border-white/10 bg-card/60 dark:bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden border">
                            <CardHeader className="p-8 md:p-10 border-b border-border dark:border-white/5 bg-muted/20 dark:bg-white/5 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-black uppercase tracking-tight italic flex items-center gap-3">
                                        <PlusCircle className="w-5 h-5 text-primary" />
                                        Technical Arsenal
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-muted-foreground">Quantifiable proficiency in core technologies.</CardDescription>
                                </div>
                                <div className="flex items-center gap-3 bg-muted dark:bg-black/20 p-2 rounded-xl border border-border dark:border-white/5">
                                    <Label htmlFor="show-skills" className="text-[10px] font-black uppercase tracking-widest">Visible</Label>
                                    <Switch id="show-skills" checked={portfolio.displayOptions.showSkills} onCheckedChange={(checked) => handleDisplayOptionChange('showSkills', checked)} />
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 md:p-10 space-y-6">
                                <div className="grid gap-6">
                                    {portfolio.skills.map((item, index) => (
                                        <div key={index} className="flex items-center gap-6 bg-muted/50 dark:bg-white/5 p-4 rounded-2xl border border-border dark:border-white/5 group/skill">
                                            <div className="flex-grow space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Skill Name</Label>
                                                <Input value={item.skill} onChange={(e) => handleFieldChange('skills', index, 'skill', e.target.value)} className="bg-muted dark:bg-black/20 border-border dark:border-white/5 h-10 rounded-lg group-hover/skill:border-primary/30 transition-colors focus:ring-primary/20 text-foreground" />
                                            </div>
                                            <div className="w-1/3 space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex justify-between">
                                                    Level <span>{item.expertise}%</span>
                                                </Label>
                                                <Slider
                                                    defaultValue={[item.expertise]}
                                                    max={100}
                                                    step={1}
                                                    onValueChange={(value) => handleFieldChange('skills', index, 'expertise', value[0])}
                                                />
                                            </div>
                                            <Button variant="ghost" size="icon" className="shrink-0 self-end text-muted-foreground hover:text-destructive transition-colors" onClick={() => handleRemoveItem('skills', index)}><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" className="w-full h-12 rounded-xl border-dashed border-border dark:border-white/10 hover:border-primary/50 bg-muted/50 dark:bg-white/5 font-black uppercase tracking-widest text-[10px] italic" onClick={() => handleAddItem('skills', { skill: 'New Skill', expertise: 50 })}><PlusCircle className="mr-2 h-4 w-4" /> Add Neural Asset</Button>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[2.5rem] border-border dark:border-white/10 bg-card/60 dark:bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden border">
                            <CardHeader className="p-8 md:p-10 border-b border-border dark:border-white/5 bg-muted/20 dark:bg-white/5 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-black uppercase tracking-tight italic flex items-center gap-3">
                                        <PlusCircle className="w-5 h-5 text-primary" />
                                        Operational History
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-muted-foreground">Work experience and professional deployments.</CardDescription>
                                </div>
                                <div className="flex items-center gap-3 bg-muted dark:bg-black/20 p-2 rounded-xl border border-border dark:border-white/5">
                                    <Label htmlFor="show-experience" className="text-[10px] font-black uppercase tracking-widest">Visible</Label>
                                    <Switch id="show-experience" checked={portfolio.displayOptions.showExperience} onCheckedChange={(checked) => handleDisplayOptionChange('showExperience', checked)} />
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 md:p-10 space-y-6">
                                {portfolio.experience.map((item, index) => (
                                    <div key={index} className="space-y-6 p-6 bg-muted/50 dark:bg-white/5 rounded-3xl border border-border dark:border-white/5 relative group/exp hover:border-primary/20 transition-colors">
                                        <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors" onClick={() => handleRemoveItem('experience', index)}><Trash2 className="w-4 h-4" /></Button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Designation</Label>
                                                <Input value={item.role} onChange={(e) => handleFieldChange('experience', index, 'role', e.target.value)} className="bg-muted dark:bg-black/20 border-border dark:border-white/5 h-12 rounded-xl focus:ring-primary/20 text-foreground" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">HQ / Company</Label>
                                                <Input value={item.company} onChange={(e) => handleFieldChange('experience', index, 'company', e.target.value)} className="bg-muted dark:bg-black/20 border-border dark:border-white/5 h-12 rounded-xl focus:ring-primary/20 text-foreground" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Timeframe</Label>
                                            <Input value={item.duration} onChange={(e) => handleFieldChange('experience', index, 'duration', e.target.value)} className="bg-muted dark:bg-black/20 border-border dark:border-white/5 h-12 rounded-xl focus:ring-primary/20 text-foreground" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Mission Details</Label>
                                            <Textarea value={item.description} onChange={(e) => handleFieldChange('experience', index, 'description', e.target.value)} className="bg-muted dark:bg-black/20 border-border dark:border-white/5 min-h-[100px] rounded-xl focus:ring-primary/20 p-4 text-foreground" />
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full h-12 rounded-xl border-dashed border-border dark:border-white/10 hover:border-primary/50 bg-muted/50 dark:bg-white/5 font-black uppercase tracking-widest text-[10px] italic" onClick={() => handleAddItem('experience', { role: '', company: '', duration: '', description: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Log New Deployment</Button>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[2.5rem] border-border dark:border-white/10 bg-card/60 dark:bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden border">
                            <CardHeader className="p-8 md:p-10 border-b border-border dark:border-white/5 bg-muted/20 dark:bg-white/5 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-black uppercase tracking-tight italic flex items-center gap-3">
                                        <PlusCircle className="w-5 h-5 text-primary" />
                                        Foundational Archives
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-muted-foreground">Academic credentials and institutional background.</CardDescription>
                                </div>
                                <div className="flex items-center gap-3 bg-muted dark:bg-black/20 p-2 rounded-xl border border-border dark:border-white/5">
                                    <Label htmlFor="show-education" className="text-[10px] font-black uppercase tracking-widest">Visible</Label>
                                    <Switch id="show-education" checked={portfolio.displayOptions.showEducation} onCheckedChange={(checked) => handleDisplayOptionChange('showEducation', checked)} />
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 md:p-10 space-y-6">
                                {portfolio.education.map((item, index) => (
                                    <div key={index} className="space-y-6 p-6 bg-muted/50 dark:bg-white/5 rounded-3xl border border-border dark:border-white/5 relative group/edu hover:border-primary/20 transition-colors">
                                        <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors" onClick={() => handleRemoveItem('education', index)}><Trash2 className="w-4 h-4" /></Button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Degree / Cert</Label>
                                                <Input value={item.degree} onChange={(e) => handleFieldChange('education', index, 'degree', e.target.value)} className="bg-muted dark:bg-black/20 border-border dark:border-white/5 h-12 rounded-xl focus:ring-primary/20 text-foreground" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Learning Institution</Label>
                                                <Input value={item.institution} onChange={(e) => handleFieldChange('education', index, 'institution', e.target.value)} className="bg-muted dark:bg-black/20 border-border dark:border-white/5 h-12 rounded-xl focus:ring-primary/20 text-foreground" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Completion Cycle</Label>
                                            <Input value={item.year} onChange={(e) => handleFieldChange('education', index, 'year', e.target.value)} className="bg-muted dark:bg-black/20 border-border dark:border-white/5 h-12 rounded-xl focus:ring-primary/20 text-foreground" />
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full h-12 rounded-xl border-dashed border-border dark:border-white/10 hover:border-primary/50 bg-muted/50 dark:bg-white/5 font-black uppercase tracking-widest text-[10px] italic" onClick={() => handleAddItem('education', { degree: '', institution: '', year: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Academic Record</Button>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[2.5rem] border-border dark:border-white/10 bg-card/60 dark:bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden border">
                            <CardHeader className="p-8 md:p-10 border-b border-border dark:border-white/5 bg-muted/20 dark:bg-white/5 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-black uppercase tracking-tight italic flex items-center gap-3">
                                        <PlusCircle className="w-5 h-5 text-primary" />
                                        Project Matrix
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-muted-foreground">Digital manifestations and operational constructs.</CardDescription>
                                </div>
                                <div className="flex items-center gap-3 bg-muted dark:bg-black/20 p-2 rounded-xl border border-border dark:border-white/5">
                                    <Label htmlFor="show-projects" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Visible</Label>
                                    <Switch id="show-projects" checked={portfolio.displayOptions.showProjects} onCheckedChange={(checked) => handleDisplayOptionChange('showProjects', checked)} />
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 md:p-10 space-y-8">
                                {portfolio.projects.map((item, index) => (
                                    <div key={index} className="space-y-6 p-6 bg-muted/50 dark:bg-white/5 rounded-3xl border border-border dark:border-white/5 relative group/proj hover:border-primary/20 transition-all">
                                        <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors" onClick={() => handleRemoveItem('projects', index)}><Trash2 className="w-4 h-4" /></Button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Mission Designation</Label>
                                                    <Input value={item.title} onChange={(e) => handleFieldChange('projects', index, 'title', e.target.value)} className="bg-muted dark:bg-black/20 border-border dark:border-white/5 h-12 rounded-xl focus:ring-primary/20 text-foreground" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Encrypted Tags (CSV)</Label>
                                                    <Input value={item.tags} onChange={(e) => handleFieldChange('projects', index, 'tags', e.target.value)} className="bg-muted dark:bg-black/20 border-border dark:border-white/5 h-12 rounded-xl focus:ring-primary/20 text-foreground" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Deployment Access (Link)</Label>
                                                    <Input value={item.link} onChange={(e) => handleFieldChange('projects', index, 'link', e.target.value)} className="bg-muted dark:bg-black/20 border-border dark:border-white/5 h-12 rounded-xl focus:ring-primary/20 text-foreground" />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Visual Log (Capture)</Label>
                                                <div className="bg-muted dark:bg-black/20 p-4 rounded-2xl border border-border dark:border-white/5">
                                                    <ImagePicker
                                                        value={item.imageUrl}
                                                        onChange={(value) => handleFieldChange('projects', index, 'imageUrl', value)}
                                                        dataAiHint="project screenshot"
                                                        isCloudinaryLoaded={isCloudinaryLoaded}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Operational Summary</Label>
                                            <Textarea value={item.description} onChange={(e) => handleFieldChange('projects', index, 'description', e.target.value)} className="bg-muted dark:bg-black/20 border-border dark:border-white/5 min-h-[120px] rounded-xl focus:ring-primary/20 p-4 text-foreground" />
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full h-12 rounded-xl border-dashed border-border dark:border-white/10 hover:border-primary/50 bg-muted/50 dark:bg-white/5 font-black uppercase tracking-widest text-[10px] italic" onClick={() => handleAddItem('projects', { title: '', description: '', link: '', tags: '', imageUrl: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Initialize New Project</Button>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[2.5rem] border-border dark:border-white/10 bg-card/60 dark:bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden border">
                            <CardHeader className="p-8 md:p-10 border-b border-border dark:border-white/5 bg-muted/20 dark:bg-white/5 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-black uppercase tracking-tight italic flex items-center gap-3">
                                        <PlusCircle className="w-5 h-5 text-primary" />
                                        Service Validation
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-muted-foreground">Verified certifications and professional endorsements.</CardDescription>
                                </div>
                                <div className="flex items-center gap-2 bg-muted dark:bg-black/20 p-2 rounded-xl border border-border dark:border-white/5">
                                    <Label htmlFor="show-certificates" className="text-[10px] font-black uppercase tracking-widest">Visible</Label>
                                    <Switch id="show-certificates" checked={portfolio.displayOptions.showCertificates} onCheckedChange={(checked) => handleDisplayOptionChange('showCertificates', checked)} />
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 md:p-10 space-y-8">
                                {portfolio.certificates.map((item, index) => (
                                    <div key={index} className="space-y-6 p-6 bg-muted/50 dark:bg-white/5 rounded-3xl border border-border dark:border-white/5 relative group/cert hover:border-primary/20 transition-all">
                                        <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors" onClick={() => handleRemoveItem('certificates', index)}><Trash2 className="w-4 h-4" /></Button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Certificate ID</Label>
                                                    <Input value={item.name} onChange={(e) => handleFieldChange('certificates', index, 'name', e.target.value)} className="bg-muted dark:bg-black/20 border-border dark:border-white/5 h-12 rounded-xl focus:ring-primary/20 text-foreground" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Issuing Authority</Label>
                                                    <Input value={item.body} onChange={(e) => handleFieldChange('certificates', index, 'body', e.target.value)} className="bg-muted dark:bg-black/20 border-border dark:border-white/5 h-12 rounded-xl focus:ring-primary/20 text-foreground" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Validation Cycle (Date)</Label>
                                                    <Input type="month" value={item.date} onChange={(e) => handleFieldChange('certificates', index, 'date', e.target.value)} className="bg-muted dark:bg-black/20 border-border dark:border-white/5 h-12 rounded-xl focus:ring-primary/20 px-4 text-foreground" />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Visual Credential</Label>
                                                <div className="bg-muted dark:bg-black/20 p-4 rounded-2xl border border-border dark:border-white/5">
                                                    <ImagePicker
                                                        value={item.imageUrl}
                                                        onChange={(value) => handleFieldChange('certificates', index, 'imageUrl', value)}
                                                        dataAiHint="certificate logo"
                                                        isCloudinaryLoaded={isCloudinaryLoaded}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full h-12 rounded-xl border-dashed border-border dark:border-white/10 hover:border-primary/50 bg-muted/50 dark:bg-white/5 font-black uppercase tracking-widest text-[10px] italic" onClick={() => handleAddItem('certificates', { name: '', body: '', date: '', imageUrl: '' })}><PlusCircle className="mr-2 h-4 w-4" /> File New Credential</Button>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[2.5rem] border-border dark:border-white/10 bg-card/60 dark:bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden border">
                            <CardHeader className="p-8 md:p-10 border-b border-border dark:border-white/5 bg-muted/20 dark:bg-white/5 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-black uppercase tracking-tight italic flex items-center gap-3">
                                        <PlusCircle className="w-5 h-5 text-primary" />
                                        Command Achievements
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-muted-foreground">Operational milestones and neural recognition.</CardDescription>
                                </div>
                                <div className="flex items-center gap-2 bg-muted dark:bg-black/20 p-2 rounded-xl border border-border dark:border-white/5">
                                    <Label htmlFor="show-achievements" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Visible</Label>
                                    <Switch id="show-achievements" checked={portfolio.displayOptions.showAchievements} onCheckedChange={(checked) => handleDisplayOptionChange('showAchievements', checked)} />
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 md:p-10 space-y-6">
                                {portfolio.achievements.map((item, index) => (
                                    <div key={index} className="space-y-6 p-6 bg-muted/50 dark:bg-white/5 rounded-3xl border border-border dark:border-white/5 relative group/ach hover:border-primary/20 transition-all">
                                        <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors" onClick={() => handleRemoveItem('achievements', index)}><Trash2 className="w-4 h-4" /></Button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Achievement Signature</Label>
                                                <Input value={item.description} onChange={(e) => handleFieldChange('achievements', index, 'description', e.target.value)} className="bg-muted dark:bg-black/20 border-border dark:border-white/5 h-12 rounded-xl focus:ring-primary/20 text-foreground" />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Award Visualization</Label>
                                                <div className="bg-muted dark:bg-black/20 p-4 rounded-2xl border border-border dark:border-white/5">
                                                    <ImagePicker
                                                        value={item.imageUrl}
                                                        onChange={(value) => handleFieldChange('achievements', index, 'imageUrl', value)}
                                                        dataAiHint="achievement award"
                                                        isCloudinaryLoaded={isCloudinaryLoaded}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full h-12 rounded-xl border-dashed border-border dark:border-white/10 hover:border-primary/50 bg-muted/50 dark:bg-white/5 font-black uppercase tracking-widest text-[10px] italic" onClick={() => handleAddItem('achievements', { description: '', imageUrl: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Log Achievement</Button>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[2.5rem] border-border dark:border-white/10 bg-card/60 dark:bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden border">
                            <CardHeader className="p-8 md:p-10 border-b border-border dark:border-white/5 bg-muted/20 dark:bg-white/5 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-black uppercase tracking-tight italic flex items-center gap-3">
                                        <PlusCircle className="w-5 h-5 text-primary" />
                                        Neural Feedback
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-muted-foreground">Personnel endorsements and operative testimonials.</CardDescription>
                                </div>
                                <div className="flex items-center gap-2 bg-muted dark:bg-black/20 p-2 rounded-xl border border-border dark:border-white/5">
                                    <Label htmlFor="show-testimonials" className="text-[10px] font-black uppercase tracking-widest">Visible</Label>
                                    <Switch id="show-testimonials" checked={portfolio.displayOptions.showTestimonials} onCheckedChange={(checked) => handleDisplayOptionChange('showTestimonials', checked)} />
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 md:p-10 space-y-6">
                                {portfolio.testimonials.map((item, index) => (
                                    <div key={index} className="space-y-4 p-6 bg-muted/50 dark:bg-white/5 rounded-3xl border border-border dark:border-white/5 relative group/test hover:border-primary/20 transition-all">
                                        <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors" onClick={() => handleRemoveItem('testimonials', index)}><Trash2 className="w-4 h-4" /></Button>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Feedback Log</Label>
                                            <Textarea value={item.testimonial} onChange={(e) => handleFieldChange('testimonials', index, 'testimonial', e.target.value)} className="bg-muted dark:bg-black/20 border-border dark:border-white/5 min-h-[100px] rounded-xl p-4 text-foreground" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Endorsing Operative</Label>
                                            <Input value={item.author} onChange={(e) => handleFieldChange('testimonials', index, 'author', e.target.value)} className="bg-muted dark:bg-black/20 border-border dark:border-white/5 h-10 rounded-lg text-foreground" />
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full h-12 rounded-xl border-dashed border-border dark:border-white/10 hover:border-primary/50 bg-muted/50 dark:bg-white/5 font-black uppercase tracking-widest text-[10px] italic" onClick={() => handleAddItem('testimonials', { testimonial: '', author: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Feedback</Button>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[2.5rem] border-border dark:border-white/10 bg-card/60 dark:bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden border">
                            <CardHeader className="p-8 md:p-10 border-b border-border dark:border-white/5 bg-muted/20 dark:bg-white/5 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-black uppercase tracking-tight italic flex items-center gap-3">
                                        <PlusCircle className="w-5 h-5 text-primary" />
                                        Query Protocols
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-muted-foreground">Frequently addressed operational inquiries.</CardDescription>
                                </div>
                                <div className="flex items-center gap-2 bg-muted dark:bg-black/20 p-2 rounded-xl border border-border dark:border-white/5">
                                    <Label htmlFor="show-faqs" className="text-[10px] font-black uppercase tracking-widest">Visible</Label>
                                    <Switch id="show-faqs" checked={portfolio.displayOptions.showFaqs} onCheckedChange={(checked) => handleDisplayOptionChange('showFaqs', checked)} />
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 md:p-10 space-y-6">
                                {portfolio.faqs.map((item, index) => (
                                    <div key={index} className="space-y-4 p-6 bg-muted/50 dark:bg-white/5 rounded-3xl border border-border dark:border-white/5 relative group/faq hover:border-primary/20 transition-all">
                                        <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors" onClick={() => handleRemoveItem('faqs', index)}><Trash2 className="w-4 h-4" /></Button>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Protocol Question</Label>
                                            <Input value={item.question} onChange={(e) => handleFieldChange('faqs', index, 'question', e.target.value)} className="bg-muted dark:bg-black/20 border-border dark:border-white/5 h-12 rounded-xl text-foreground" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Resolution Protocol</Label>
                                            <Textarea value={item.answer} onChange={(e) => handleFieldChange('faqs', index, 'answer', e.target.value)} className="bg-muted dark:bg-black/20 border-border dark:border-white/5 min-h-[100px] rounded-xl p-4 text-foreground" />
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full h-12 rounded-xl border-dashed border-border dark:border-white/10 hover:border-primary/50 bg-muted/50 dark:bg-white/5 font-black uppercase tracking-widest text-[10px] italic" onClick={() => handleAddItem('faqs', { question: '', answer: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Log Query Protocol</Button>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-10 pb-20">
                            <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-2xl border-border dark:border-white/10 hover:border-primary/50 bg-muted/50 dark:bg-white/5 font-black uppercase tracking-tight italic flex items-center gap-2 group transition-all">
                                <a href={`/portfolio/${portfolio.personalInfo.slug}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                    Mission Preview
                                </a>
                            </Button>
                            <Button size="lg" onClick={handleSave} disabled={isSaving} className="h-14 px-10 rounded-2xl font-black uppercase tracking-tight italic flex items-center gap-2 shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all active:scale-95">
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Commit Changes
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            </main>
        </>
    );
}

