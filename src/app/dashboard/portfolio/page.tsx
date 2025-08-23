
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { PlusCircle, Trash2, Loader2, Lock, Gem } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { getPortfolio, updatePortfolio, getUserData } from "@/lib/firebase-service";
import type { Portfolio, Project, Certificate, Achievement, Testimonial, FAQ, Skill, WorkExperience, Education, UserData } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { initialPortfolioData } from "@/lib/initial-data";
import { Slider } from "@/components/ui/slider";

const colorOptions = [
    { name: 'Default', hsl: '221.2 83.2% 53.3%' },
    { name: 'Green', hsl: '150 80% 50%' },
    { name: 'Orange', hsl: '30 90% 55%' },
    { name: 'Purple', hsl: '260 85% 65%' },
    { name: 'Red', hsl: '0 85% 60%' },
];

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

  if (isLoading || !portfolio || !userData) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const isFreePlan = !userData.subscription?.plan || userData.subscription.plan === 'free';
  if (isFreePlan) {
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
                <Label htmlFor="slug">Portfolio Slug</Label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                       talxify.space/
                    </span>
                    <Input id="slug" className="pl-24" value={portfolio.personalInfo.slug} onChange={handleSlugChange} />
                </div>
                <p className="text-sm text-muted-foreground mt-1">This will be your unique portfolio URL. Use only letters, numbers, and hyphens.</p>
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" value={portfolio.personalInfo.bio} onChange={(e) => setPortfolio({...portfolio, personalInfo: {...portfolio.personalInfo, bio: e.target.value}})} />
            </div>
             <div>
              <Label htmlFor="bannerUrl">Portfolio Banner URL</Label>
              <Input id="bannerUrl" placeholder="e.g., https://imgur.com/your-banner.png" value={portfolio.personalInfo.bannerUrl} onChange={(e) => setPortfolio({...portfolio, personalInfo: {...portfolio.personalInfo, bannerUrl: e.target.value}})} />
              <p className="text-sm text-muted-foreground mt-1">
                Tip: Upload to a host like Imgur, or use a Google Drive link (ensure sharing is public). Then paste the direct link here.
              </p>
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
                        <Label>Image URL</Label>
                        <Input value={item.imageUrl} onChange={(e) => handleFieldChange('projects', index, 'imageUrl', e.target.value)} />
                        <p className="text-sm text-muted-foreground mt-1">
                          Tip: Upload to a host like Imgur, or use a Google Drive link (ensure sharing is public). Then paste the direct link here.
                        </p>
                    </div>
                    <div><Label>Description</Label><Textarea value={item.description} onChange={(e) => handleFieldChange('projects', index, 'description', e.target.value)} /></div>
                </div>
            ))}
            <Button variant="outline" className="w-full" onClick={() => handleAddItem('projects', { title: '', description: '', link: '', tags: '', imageUrl: 'https://placehold.co/1200x630.png' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Project</Button>
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
                        <Label>Image URL</Label>
                        <Input value={item.imageUrl} onChange={(e) => handleFieldChange('certificates', index, 'imageUrl', e.target.value)} />
                         <p className="text-sm text-muted-foreground mt-1">
                           Tip: Upload to a host like Imgur, or use a Google Drive link (ensure sharing is public). Then paste the direct link here.
                        </p>
                    </div>
                </div>
            ))}
            <Button variant="outline" className="w-full" onClick={() => handleAddItem('certificates', { name: '', body: '', date: '', imageUrl: 'https://placehold.co/100x100.png' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Certificate</Button>
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
                            <Label>Image URL</Label>
                            <Input value={item.imageUrl} onChange={(e) => handleSimpleListChange('achievements', index, 'imageUrl', e.target.value)} />
                             <p className="text-sm text-muted-foreground mt-1">
                               Tip: Upload to a host like Imgur, or use a Google Drive link (ensure sharing is public). Then paste the direct link here.
                            </p>
                        </div>
                    </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => handleAddItem('achievements', { description: '', imageUrl: 'https://placehold.co/100x100.png' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Achievement</Button>
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
              <Link href={`/${portfolio.personalInfo.slug}`}>Preview</Link>
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
