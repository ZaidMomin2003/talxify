


"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { PlusCircle, Trash2, Loader2, Lock, Gem, ExternalLink, Link as LinkIcon, UploadCloud, Image as ImageIcon, Save, CheckCircle, AlertTriangle } from "lucide-react";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { getPortfolio, updatePortfolio, getUserData as fetchUserData } from "@/lib/firebase-service";
import type { Portfolio, Project, Certificate, Achievement, Testimonial, FAQ, Skill, WorkExperience, Education, UserData } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { initialPortfolioData } from "@/lib/initial-data";
import { Slider } from "@/components/ui/slider";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import Script from "next/script";
import { Switch } from "@/components/ui/switch";
import { getUserBySlug } from "@/app/zaidmin/actions";


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


const ImagePicker = ({ value, onChange, dataAiHint, isAvatar }: { value: string, onChange: (value: string) => void, dataAiHint: string, isAvatar?: boolean }) => {
    const { toast } = useToast();
    const [isCloudinaryLoaded, setIsCloudinaryLoaded] = useState(false);
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
            }, (error: any, result: any) => {
                if (!error && result && result.event === "success") {
                    onChange(result.info.secure_url);
                }
                if (error) {
                    console.error("Cloudinary Error:", error);
                    toast({ title: 'Upload Error', description: 'Failed to upload image. Please try again.', variant: 'destructive'});
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
        ? "w-32 h-32 rounded-full bg-muted border-2 border-dashed flex items-center justify-center overflow-hidden mx-auto"
        : "aspect-video w-full rounded-lg bg-muted border-2 border-dashed flex items-center justify-center overflow-hidden";

    return (
        <div className="space-y-3">
            <Script 
                src="https://upload-widget.cloudinary.com/global/all.js"
                onLoad={() => setIsCloudinaryLoaded(true)}
            />
            <div className={containerClasses}>
                {value ? (
                    <Image src={value} alt="Image preview" width={isAvatar ? 128 : 400} height={isAvatar ? 128 : 210} className="w-full h-full object-cover" data-ai-hint={dataAiHint} />
                ) : (
                    <div className="text-center text-muted-foreground p-4">
                        <ImageIcon className="mx-auto h-10 w-10 mb-2" />
                        <p>No image selected</p>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="w-full" onClick={openWidget} disabled={!isCloudinaryLoaded}>
                    <UploadCloud className="h-4 w-4" />
                     <span>{isCloudinaryLoaded ? 'Upload Image' : 'Loading...'}</span>
                </Button>
                <Button variant="destructive" className="w-full" onClick={() => onChange("")}>
                    <Trash2 className="h-4 w-4"/>
                    <span>Remove</span>
                </Button>
            </div>
        </div>
    )
}

function LockedFeature() {
    return (
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
            <Card className="max-w-md w-full text-center shadow-lg">
                 <CardHeader>
                    <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit mb-2">
                        <Lock className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Feature Locked</CardTitle>
                    <CardDescription>
                        The Portfolio Editor is a Pro feature. Please upgrade your plan to customize and share your professional portfolio.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild size="lg">
                        <Link href="/dashboard/pricing">
                            <Gem className="mr-2 h-4 w-4" />
                            Upgrade to Pro
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </main>
    )
}

const colorOptions = [
    { name: 'Default', hsl: '221.2 83.2% 53.3%' },
    { name: 'Forest Green', hsl: '142.1 76.2% 36.3%' },
    { name: 'Midnight Blue', hsl: '210 40% 30%' },
    { name: 'Ruby Red', hsl: '351 83% 40%' },
    { name: 'Royal Purple', hsl: '262 52% 47%' },
];


export default function PortfolioPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
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
    if (!portfolio) return;

    setPortfolio(prev => {
        if (!prev) return null;
        const newPortfolio = JSON.parse(JSON.stringify(prev));
        // @ts-ignore
        newPortfolio[section][index][field] = value;
        return newPortfolio;
    });
  };

  const handleSimpleListChange = (section: keyof Portfolio, index: number, field: string, value: string | number) => {
    if (!portfolio) return;
    setPortfolio(prev => {
        if (!prev) return null;
        const newPortfolio = JSON.parse(JSON.stringify(prev));
        // @ts-ignore
        newPortfolio[section][index][field] = value;
        return newPortfolio;
    });
  };
  
  const handleAddItem = (section: keyof Portfolio, newItem: any) => {
    if (!portfolio) return;
    setPortfolio(prev => {
        if (!prev) return null;
        const newPortfolio = { ...prev };
         // @ts-ignore
        newPortfolio[section] = [...newPortfolio[section], newItem];
        return newPortfolio;
    });
  };

  const handleRemoveItem = (section: keyof Portfolio, index: number) => {
    if (!portfolio) return;
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
    setPortfolio({...portfolio, personalInfo: {...portfolio.personalInfo, slug: sanitizedSlug}});
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

  const isFreePlan = !userData?.subscription?.plan || userData?.subscription?.plan === 'free';
  const isPortfolioLocked = isFreePlan && (!userData?.subscription.endDate || new Date() > new Date(userData.subscription.endDate));


  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (isPortfolioLocked && isFreePlan) {
    return <LockedFeature />;
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
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8 max-w-4xl mx-auto">
        <h1 className="font-headline text-4xl font-bold">Craft Your Portfolio</h1>
        <p className="text-muted-foreground">Showcase your skills and projects to the world.</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="shadow-lg border-primary/10">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>This section covers your basic details and portfolio URL.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={portfolio.personalInfo.name} onChange={(e) => setPortfolio({...portfolio, personalInfo: {...portfolio.personalInfo, name: e.target.value}})} />
              </div>
              <div>
                <Label htmlFor="profession">Profession</Label>
                <Input id="profession" value={portfolio.personalInfo.profession} onChange={(e) => setPortfolio({...portfolio, personalInfo: {...portfolio.personalInfo, profession: e.target.value}})} />
              </div>
            </div>
             <div>
                <Label htmlFor="slug">Portfolio URL</Label>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground p-2 rounded-l-md bg-muted border border-r-0 whitespace-nowrap">
                       talxify.space/portfolio/
                    </span>
                    <Input id="slug" value={portfolio.personalInfo.slug} onChange={handleSlugChange} className="rounded-l-none" />
                     <Button onClick={handleCheckSlug} disabled={isCheckingSlug}>
                        {isCheckingSlug ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Check Availability'}
                     </Button>
                </div>
                 {slugMessage && (
                    <div className={cn("flex items-center gap-2 text-sm mt-2", 
                        slugStatus === 'available' && "text-green-500",
                        (slugStatus === 'taken' || slugStatus === 'invalid') && "text-destructive"
                    )}>
                        {slugStatus === 'available' && <CheckCircle className="h-4 w-4"/>}
                        {(slugStatus === 'taken' || slugStatus === 'invalid') && <AlertTriangle className="h-4 w-4"/>}
                        {slugMessage}
                    </div>
                 )}
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" value={portfolio.personalInfo.bio} onChange={(e) => setPortfolio({...portfolio, personalInfo: {...portfolio.personalInfo, bio: e.target.value}})} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div>
                    <Label htmlFor="avatarUrl">Profile Picture</Label>
                    <ImagePicker 
                        value={portfolio.personalInfo.avatarUrl}
                        onChange={(value) => setPortfolio({...portfolio, personalInfo: {...portfolio.personalInfo, avatarUrl: value}})}
                        dataAiHint="person avatar"
                        isAvatar
                    />
                 </div>
                 <div>
                    <Label htmlFor="bannerUrl">Portfolio Banner</Label>
                    <ImagePicker 
                        value={portfolio.personalInfo.bannerUrl}
                        onChange={(value) => setPortfolio({...portfolio, personalInfo: {...portfolio.personalInfo, bannerUrl: value}})}
                        dataAiHint="abstract banner"
                    />
                 </div>
            </div>
            <div>
              <Label htmlFor="youtubeUrl">YouTube Video URL</Label>
              <Input id="youtubeUrl" placeholder="e.g., https://www.youtube.com/watch?v=..." value={portfolio.personalInfo.youtubeVideoUrl} onChange={(e) => setPortfolio({...portfolio, personalInfo: {...portfolio.personalInfo, youtubeVideoUrl: e.target.value}})} />
              <p className="text-sm text-muted-foreground mt-1">
                Paste a link to a YouTube video for your introduction.
              </p>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="github">GitHub</Label><Input id="github" value={portfolio.socials.github} onChange={(e) => setPortfolio({...portfolio, socials: {...portfolio.socials, github: e.target.value}})} /></div>
                <div><Label htmlFor="linkedin">LinkedIn</Label><Input id="linkedin" value={portfolio.socials.linkedin} onChange={(e) => setPortfolio({...portfolio, socials: {...portfolio.socials, linkedin: e.target.value}})} /></div>
                <div><Label htmlFor="twitter">Twitter / X</Label><Input id="twitter" value={portfolio.socials.twitter} onChange={(e) => setPortfolio({...portfolio, socials: {...portfolio.socials, twitter: e.target.value}})} /></div>
                <div><Label htmlFor="website">Personal Website (Optional)</Label><Input id="website" value={portfolio.socials.website} onChange={(e) => setPortfolio({...portfolio, socials: {...portfolio.socials, website: e.target.value}})} /></div>
                <div><Label htmlFor="instagram">Instagram (Optional)</Label><Input id="instagram" value={portfolio.socials.instagram} onChange={(e) => setPortfolio({...portfolio, socials: {...portfolio.socials, instagram: e.target.value}})} /></div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={portfolio.personalInfo.email} onChange={(e) => setPortfolio({...portfolio, personalInfo: {...portfolio.personalInfo, email: e.target.value}})} />
                </div>
                <div>
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input id="phone" type="tel" value={portfolio.personalInfo.phone} onChange={(e) => setPortfolio({...portfolio, personalInfo: {...portfolio.personalInfo, phone: e.target.value}})} />
                </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-primary/10">
          <CardHeader>
            <CardTitle>Theme Customization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {colorOptions.map((color) => (
                <div key={color.name} className="flex items-center gap-2">
                  <button
                    onClick={() => setPortfolio({...portfolio, themeColor: color.hsl})}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-transform transform",
                      portfolio.themeColor === color.hsl ? "border-ring scale-110" : "border-transparent"
                    )}
                    style={{ backgroundColor: `hsl(${color.hsl})` }}
                  />
                  <Label>{color.name}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Skills</CardTitle>
                <div className="flex items-center gap-2">
                    <Label htmlFor="show-skills">Show</Label>
                    <Switch id="show-skills" checked={portfolio.displayOptions.showSkills} onCheckedChange={(checked) => handleDisplayOptionChange('showSkills', checked)} />
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {portfolio.skills.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                        <div className="flex-grow">
                           <Label>Skill</Label>
                           <Input value={item.skill} onChange={(e) => handleSimpleListChange('skills', index, 'skill', e.target.value)} />
                        </div>
                        <div className="w-1/2">
                           <Label>Expertise ({item.expertise}%)</Label>
                           <Slider
                             defaultValue={[item.expertise]}
                             max={100}
                             step={1}
                             onValueChange={(value) => handleSimpleListChange('skills', index, 'expertise', value[0])}
                           />
                        </div>
                        <Button variant="ghost" size="icon" className="shrink-0 self-end" onClick={() => handleRemoveItem('skills', index)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => handleAddItem('skills', { skill: 'New Skill', expertise: 50 })}><PlusCircle className="mr-2 h-4 w-4" /> Add Skill</Button>
            </CardContent>
        </Card>

        <Card className="shadow-lg border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Work Experience</CardTitle>
                 <div className="flex items-center gap-2">
                    <Label htmlFor="show-experience">Show</Label>
                    <Switch id="show-experience" checked={portfolio.displayOptions.showExperience} onCheckedChange={(checked) => handleDisplayOptionChange('showExperience', checked)} />
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {portfolio.experience.map((item, index) => (
                    <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => handleRemoveItem('experience', index)}><Trash2 className="w-4 h-4" /></Button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><Label>Role</Label><Input value={item.role} onChange={(e) => handleFieldChange('experience', index, 'role', e.target.value)} /></div>
                            <div><Label>Company</Label><Input value={item.company} onChange={(e) => handleFieldChange('experience', index, 'company', e.target.value)} /></div>
                        </div>
                        <div><Label>Duration</Label><Input value={item.duration} onChange={(e) => handleFieldChange('experience', index, 'duration', e.target.value)} /></div>
                        <div><Label>Description</Label><Textarea value={item.description} onChange={(e) => handleFieldChange('experience', index, 'description', e.target.value)} /></div>
                    </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => handleAddItem('experience', { role: '', company: '', duration: '', description: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Experience</Button>
            </CardContent>
        </Card>

        <Card className="shadow-lg border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Education</CardTitle>
                <div className="flex items-center gap-2">
                    <Label htmlFor="show-education">Show</Label>
                    <Switch id="show-education" checked={portfolio.displayOptions.showEducation} onCheckedChange={(checked) => handleDisplayOptionChange('showEducation', checked)} />
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {portfolio.education.map((item, index) => (
                    <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => handleRemoveItem('education', index)}><Trash2 className="w-4 h-4" /></Button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div><Label>Degree/Certificate</Label><Input value={item.degree} onChange={(e) => handleFieldChange('education', index, 'degree', e.target.value)} /></div>
                           <div><Label>Institution</Label><Input value={item.institution} onChange={(e) => handleFieldChange('education', index, 'institution', e.target.value)} /></div>
                        </div>
                        <div><Label>Year of Completion</Label><Input value={item.year} onChange={(e) => handleFieldChange('education', index, 'year', e.target.value)} /></div>
                    </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => handleAddItem('education', { degree: '', institution: '', year: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Education</Button>
            </CardContent>
        </Card>

        <Card className="shadow-lg border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Projects</CardTitle>
             <div className="flex items-center gap-2">
                <Label htmlFor="show-projects">Show</Label>
                <Switch id="show-projects" checked={portfolio.displayOptions.showProjects} onCheckedChange={(checked) => handleDisplayOptionChange('showProjects', checked)} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {portfolio.projects.map((item, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => handleRemoveItem('projects', index)}><Trash2 className="w-4 h-4" /></Button>
                    <div><Label>Project Title</Label><Input value={item.title} onChange={(e) => handleFieldChange('projects', index, 'title', e.target.value)} /></div>
                    <div><Label>Tags (comma separated)</Label><Input value={item.tags} onChange={(e) => handleFieldChange('projects', index, 'tags', e.target.value)} /></div>
                    <div><Label>Project Link</Label><Input value={item.link} onChange={(e) => handleFieldChange('projects', index, 'link', e.target.value)} /></div>
                    <div>
                        <Label>Image</Label>
                         <ImagePicker 
                            value={item.imageUrl}
                            onChange={(value) => handleFieldChange('projects', index, 'imageUrl', value)}
                            dataAiHint="project screenshot"
                        />
                    </div>
                    <div><Label>Description</Label><Textarea value={item.description} onChange={(e) => handleFieldChange('projects', index, 'description', e.target.value)} /></div>
                </div>
            ))}
            <Button variant="outline" className="w-full" onClick={() => handleAddItem('projects', { title: '', description: '', link: '', tags: '', imageUrl: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Project</Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Certificates</CardTitle>
            <div className="flex items-center gap-2">
                <Label htmlFor="show-certificates">Show</Label>
                <Switch id="show-certificates" checked={portfolio.displayOptions.showCertificates} onCheckedChange={(checked) => handleDisplayOptionChange('showCertificates', checked)} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {portfolio.certificates.map((item, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => handleRemoveItem('certificates', index)}><Trash2 className="w-4 h-4" /></Button>
                    <div><Label>Certificate Name</Label><Input value={item.name} onChange={(e) => handleFieldChange('certificates', index, 'name', e.target.value)} /></div>
                    <div><Label>Issuing Body</Label><Input value={item.body} onChange={(e) => handleFieldChange('certificates', index, 'body', e.target.value)} /></div>
                    <div><Label>Date Obtained</Label><Input type="month" value={item.date} onChange={(e) => handleFieldChange('certificates', index, 'date', e.target.value)} /></div>
                    <div>
                        <Label>Image</Label>
                         <ImagePicker 
                            value={item.imageUrl}
                            onChange={(value) => handleFieldChange('certificates', index, 'imageUrl', value)}
                            dataAiHint="certificate logo"
                        />
                    </div>
                </div>
            ))}
            <Button variant="outline" className="w-full" onClick={() => handleAddItem('certificates', { name: '', body: '', date: '', imageUrl: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Certificate</Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Achievements</CardTitle>
                <div className="flex items-center gap-2">
                    <Label htmlFor="show-achievements">Show</Label>
                    <Switch id="show-achievements" checked={portfolio.displayOptions.showAchievements} onCheckedChange={(checked) => handleDisplayOptionChange('showAchievements', checked)} />
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {portfolio.achievements.map((item, index) => (
                    <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => handleRemoveItem('achievements', index)}><Trash2 className="w-4 h-4" /></Button>
                        <div><Label>Description</Label><Input value={item.description} onChange={(e) => handleSimpleListChange('achievements', index, 'description', e.target.value)} /></div>
                        <div>
                            <Label>Image</Label>
                            <ImagePicker 
                                value={item.imageUrl}
                                onChange={(value) => handleSimpleListChange('achievements', index, 'imageUrl', value)}
                                dataAiHint="achievement award"
                            />
                        </div>
                    </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => handleAddItem('achievements', { description: '', imageUrl: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Achievement</Button>
            </CardContent>
        </Card>

        <Card className="shadow-lg border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Testimonials</CardTitle>
                <div className="flex items-center gap-2">
                    <Label htmlFor="show-testimonials">Show</Label>
                    <Switch id="show-testimonials" checked={portfolio.displayOptions.showTestimonials} onCheckedChange={(checked) => handleDisplayOptionChange('showTestimonials', checked)} />
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {portfolio.testimonials.map((item, index) => (
                    <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => handleRemoveItem('testimonials', index)}><Trash2 className="w-4 h-4" /></Button>
                        <div><Label>Testimonial</Label><Textarea value={item.testimonial} onChange={(e) => handleFieldChange('testimonials', index, 'testimonial', e.target.value)} /></div>
                        <div><Label>Author</Label><Input value={item.author} onChange={(e) => handleFieldChange('testimonials', index, 'author', e.target.value)} /></div>
                    </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => handleAddItem('testimonials', { testimonial: '', author: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Testimonial</Button>
            </CardContent>
        </Card>

        <Card className="shadow-lg border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>FAQs</CardTitle>
                <div className="flex items-center gap-2">
                    <Label htmlFor="show-faqs">Show</Label>
                    <Switch id="show-faqs" checked={portfolio.displayOptions.showFaqs} onCheckedChange={(checked) => handleDisplayOptionChange('showFaqs', checked)} />
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {portfolio.faqs.map((item, index) => (
                    <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => handleRemoveItem('faqs', index)}><Trash2 className="w-4 h-4" /></Button>
                        <div><Label>Question</Label><Input value={item.question} onChange={(e) => handleFieldChange('faqs', index, 'question', e.target.value)} /></div>
                        <div><Label>Answer</Label><Textarea value={item.answer} onChange={(e) => handleFieldChange('faqs', index, 'answer', e.target.value)} /></div>
                    </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => handleAddItem('faqs', { question: '', answer: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add FAQ</Button>
            </CardContent>
        </Card>

        <div className="flex justify-end gap-2 pt-4">
            <Button asChild variant="outline" size="lg">
              <a href={`/portfolio/${portfolio.personalInfo.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" /> Preview
              </a>
            </Button>
            <Button size="lg" onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Portfolio
            </Button>
        </div>
      </div>
    </main>
  );
}
