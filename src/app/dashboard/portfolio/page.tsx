

"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { PlusCircle, Trash2, Loader2, Lock, Gem, ExternalLink, Link as LinkIcon, UploadCloud, Image as ImageIcon } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { getPortfolio, updatePortfolio, getUserData } from "@/lib/firebase-service";
import type { Portfolio, Project, Certificate, Achievement, Testimonial, FAQ, Skill, WorkExperience, Education, UserData } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { initialPortfolioData } from "@/lib/initial-data";
import { Slider } from "@/components/ui/slider";
import { differenceInHours } from 'date-fns';
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { useGapiScript } from "@/hooks/use-gapi-script";
import { getGoogleApiKeys } from "@/app/actions/google-drive";


const GoogleDriveIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.2396 16.8239L15.2931 7.8974L23.136 7.8974L15.3375 21.9904L7.49463 21.9904L0.69751 9.77124L5.70659 9.77124L10.2396 16.8239Z" fill="#34A853"/>
        <path d="M23.1348 7.89743L15.6562 21.3283L17.7618 21.9891L24.0012 11.666L23.1348 7.89743Z" fill="#188038"/>
        <path d="M7.49463 21.9904L10.7483 16.8239L5.70659 9.77124L3.84277 12.9868L7.49463 21.9904Z" fill="#188038"/>
        <path d="M8.56445 2.00977L15.3375 2.00977L23.136 7.8975L15.6562 7.8975L8.56445 2.00977Z" fill="#FFC107"/>
        <path d="M0.69751 9.77121L8.56453 2.00977L15.6563 7.89748L7.49471 21.9904L0.69751 9.77121Z" fill="#4285F4"/>
        <path d="M8.56445 2.00977L7.49463 3.86348L8.14081 9.77124H0.69751L8.56445 2.00977Z" fill="#1967D2"/>
        <path d="M7.49463 21.9904L10.2396 16.8239H18.9839L15.2931 7.8974H23.136L15.3375 21.9904H7.49463Z" fillOpacity="0.2"/>
    </svg>
)

const colorOptions = [
    { name: 'Default Blue', hsl: '221.2 83.2% 53.3%' },
    { name: 'Forest Green', hsl: '142.1 76.2% 36.3%' },
    { name: 'Ruby Red', hsl: '346.8 77.2% 49.8%' },
    { name: 'Royal Purple', hsl: '271.2 76.3% 53.5%' },
    { name: 'Goldenrod', hsl: '43.3 95.5% 56.7%' },
];

const ImagePicker = ({ value, onChange, dataAiHint }: { value: string, onChange: (value: string) => void, dataAiHint: string }) => {
    const { gapi, gis, isGapiLoaded, isGisLoaded } = useGapiScript();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [apiKeys, setApiKeys] = useState<{ apiKey: string; clientId: string } | null>(null);

    const handleGoogleDrivePick = async () => {
        setIsLoading(true);
        if (!isGapiLoaded || !isGisLoaded || !gapi || !gis) {
            toast({ title: "Please Wait", description: "Google Drive is still initializing. Please try again in a moment.", variant: 'destructive' });
            setIsLoading(false);
            return;
        }

        try {
            const keys = apiKeys ?? await getGoogleApiKeys();
            if (!keys.apiKey || !keys.clientId) {
                throw new Error("API keys are not available.");
            }
            if (!apiKeys) {
                setApiKeys(keys);
            }
            
            const tokenClient = gis.oauth2.initTokenClient({
                client_id: keys.clientId,
                scope: 'https://www.googleapis.com/auth/drive.readonly',
                callback: async (tokenResponse: any) => {
                    if (tokenResponse.error) {
                        throw new Error(`Google Auth Error: ${tokenResponse.error}`);
                    }

                    const view = new gapi.picker.View(gapi.picker.ViewId.DOCS);
                    view.setMimeTypes("image/png,image/jpeg,image/jpg,image/gif");
                    
                    const picker = new gapi.picker.PickerBuilder()
                        .setDeveloperKey(keys.apiKey)
                        .setOAuthToken(tokenResponse.access_token)
                        .addView(view)
                        .setCallback((data: any) => {
                            if (data.action === gapi.picker.Action.PICKED) {
                                const fileId = data.docs[0].id;
                                const webContentLink = `https://drive.google.com/uc?id=${fileId}`;
                                onChange(webContentLink);
                            }
                            setIsLoading(false);
                        })
                        .build();
                    picker.setVisible(true);
                },
            });
            
            tokenClient.requestAccessToken();

        } catch (error) {
            console.error("Google Drive Picker Error:", error);
            toast({ title: "Error", description: "Could not connect to Google Drive. Please ensure popup blockers are disabled and try again.", variant: "destructive" });
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-3">
            <div className="aspect-video w-full rounded-lg bg-muted border-2 border-dashed flex items-center justify-center overflow-hidden">
                {value ? (
                    <Image src={value} alt="Image preview" width={400} height={210} className="w-full h-full object-cover" data-ai-hint={dataAiHint} />
                ) : (
                    <div className="text-center text-muted-foreground p-4">
                        <ImageIcon className="mx-auto h-10 w-10 mb-2" />
                        <p>No image selected</p>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button variant="outline" className="sm:col-span-1" onClick={handleGoogleDrivePick} disabled={isLoading || !isGapiLoaded || !isGisLoaded}>
                     {(!isGapiLoaded || !isGisLoaded) ? <Loader2 className="animate-spin" /> : <GoogleDriveIcon />}
                    <span>{(!isGapiLoaded || !isGisLoaded) ? 'Loading Drive...' : 'Drive'}</span>
                </Button>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="sm:col-span-1">
                            <LinkIcon className="h-4 w-4" />
                            <span>URL</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                         <DialogHeader>
                            <DialogTitle>Enter Image URL</DialogTitle>
                            <DialogDescription>Paste the direct link to your image below.</DialogDescription>
                         </DialogHeader>
                         <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://example.com/image.png" />
                         <DialogFooter>
                            <DialogClose asChild>
                                <Button>Done</Button>
                            </DialogClose>
                         </DialogFooter>
                    </DialogContent>
                </Dialog>
                
                <Button variant="destructive" className="sm:col-span-1" onClick={() => onChange("")}>
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

export default function PortfolioPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPortfolio = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const [portfolioData, allUserData] = await Promise.all([
        getPortfolio(user.uid),
        getUserData(user.uid)
    ]);
    setPortfolio(portfolioData ?? initialPortfolioData.portfolio);
    setUserData(allUserData);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

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
    const rawSlug = e.target.value;
    const sanitizedSlug = rawSlug
      .toLowerCase()
      .replace(/\s+/g, '-')       // Replace spaces with -
      .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
      .replace(/\-\-+/g, '-');    // Replace multiple - with single -
    setPortfolio({...portfolio, personalInfo: {...portfolio.personalInfo, slug: sanitizedSlug}});
  }

  if (isLoading || !portfolio || !userData || !user) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const isFreePlan = !userData.subscription?.plan || userData.subscription.plan === 'free';
  const creationDate = user.metadata.creationTime ? new Date(user.metadata.creationTime) : new Date();
  const hoursSinceCreation = differenceInHours(new Date(), creationDate);
  const trialExpired = hoursSinceCreation > 24;

  if (isFreePlan && trialExpired) {
      return <LockedFeature />;
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
                    <span className="text-sm text-muted-foreground p-2 rounded-md bg-muted whitespace-nowrap">
                       talxify.space/portfolio/
                    </span>
                    <Input id="slug" value={portfolio.personalInfo.slug} onChange={handleSlugChange} />
                </div>
                <p className="text-sm text-muted-foreground mt-1">This will be your unique portfolio URL. Use only letters, numbers, and hyphens.</p>
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" value={portfolio.personalInfo.bio} onChange={(e) => setPortfolio({...portfolio, personalInfo: {...portfolio.personalInfo, bio: e.target.value}})} />
            </div>
             <div>
              <Label htmlFor="bannerUrl">Portfolio Banner</Label>
              <ImagePicker 
                value={portfolio.personalInfo.bannerUrl}
                onChange={(value) => setPortfolio({...portfolio, personalInfo: {...portfolio.personalInfo, bannerUrl: value}})}
                dataAiHint="abstract banner"
              />
            </div>
            <div>
              <Label htmlFor="youtubeUrl">YouTube Video URL</Label>
              <Input id="youtubeUrl" placeholder="e.g., https://www.youtube.com/watch?v=..." value={portfolio.personalInfo.youtubeVideoUrl} onChange={(e) => setPortfolio({...portfolio, personalInfo: {...portfolio.personalInfo, youtubeVideoUrl: e.target.value}})} />
              <p className="text-sm text-muted-foreground mt-1">
                Paste a link to a YouTube video for your introduction.
              </p>
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
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="github">GitHub</Label><Input id="github" value={portfolio.socials.github} onChange={(e) => setPortfolio({...portfolio, socials: {...portfolio.socials, github: e.target.value}})} /></div>
                <div><Label htmlFor="linkedin">LinkedIn</Label><Input id="linkedin" value={portfolio.socials.linkedin} onChange={(e) => setPortfolio({...portfolio, socials: {...portfolio.socials, linkedin: e.target.value}})} /></div>
                <div><Label htmlFor="twitter">Twitter / X</Label><Input id="twitter" value={portfolio.socials.twitter} onChange={(e) => setPortfolio({...portfolio, socials: {...portfolio.socials, twitter: e.target.value}})} /></div>
                <div><Label htmlFor="website">Personal Website (Optional)</Label><Input id="website" value={portfolio.socials.website} onChange={(e) => setPortfolio({...portfolio, socials: {...portfolio.socials, website: e.target.value}})} /></div>
                <div><Label htmlFor="instagram">Instagram (Optional)</Label><Input id="instagram" value={portfolio.socials.instagram} onChange={(e) => setPortfolio({...portfolio, socials: {...portfolio.socials, instagram: e.target.value}})} /></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-primary/10">
            <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
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
            <CardHeader><CardTitle>Work Experience</CardTitle></CardHeader>
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
            <CardHeader><CardTitle>Education</CardTitle></CardHeader>
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
          <CardHeader><CardTitle>Projects</CardTitle></CardHeader>
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
          <CardHeader><CardTitle>Certificates</CardTitle></CardHeader>
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
            <CardHeader><CardTitle>Achievements</CardTitle></CardHeader>
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
            <CardHeader><CardTitle>Testimonials</CardTitle></CardHeader>
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
            <CardHeader><CardTitle>FAQs</CardTitle></CardHeader>
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
