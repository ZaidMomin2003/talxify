
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Trash2 } from "lucide-react";
import React from "react";

// TODO: Replace with dynamic fields state management
const initialProjects = [{ title: '', description: '', link: '' }];
const initialCertificates = [{ name: '', body: '', date: '' }];
const initialAchievements = [{ description: '' }];
const initialTestimonials = [{ testimonial: '', author: '' }];
const initialFaqs = [{ question: '', answer: '' }];

export default function PortfolioPage() {
  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8 max-w-4xl mx-auto">
        <h1 className="font-headline text-4xl font-bold">Craft Your Portfolio</h1>
        <p className="text-muted-foreground">Showcase your skills and projects to the world.</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Personal Information */}
        <Card className="shadow-lg border-primary/10">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>This will be displayed at the top of your portfolio.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="e.g., John Doe" />
              </div>
              <div>
                <Label htmlFor="profession">Profession</Label>
                <Input id="profession" placeholder="e.g., Senior Software Engineer" />
              </div>
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" placeholder="Tell a little bit about yourself..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="e.g., john.doe@example.com" />
                </div>
                <div>
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input id="phone" type="tel" placeholder="e.g., +1 234 567 890" />
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card className="shadow-lg border-primary/10">
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
            <CardDescription>Link to your professional and social profiles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="github">GitHub</Label>
                    <Input id="github" placeholder="https://github.com/your-username" />
                </div>
                <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input id="linkedin" placeholder="https://linkedin.com/in/your-profile" />
                </div>
                <div>
                    <Label htmlFor="instagram">Instagram (Optional)</Label>
                    <Input id="instagram" placeholder="https://instagram.com/your-handle" />
                </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Projects */}
        <Card className="shadow-lg border-primary/10">
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>Highlight your best work. Add as many as you like.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {initialProjects.map((project, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor={`project-title-${index}`}>Project Title</Label>
                            <Input id={`project-title-${index}`} placeholder="e.g., Awesome App" />
                        </div>
                        <div>
                            <Label htmlFor={`project-link-${index}`}>Project Link</Label>
                            <Input id={`project-link-${index}`} placeholder="https://example.com" />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor={`project-description-${index}`}>Description</Label>
                        <Textarea id={`project-description-${index}`} placeholder="Describe your project..." />
                    </div>
                    {index > 0 && <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>}
                </div>
            ))}
            <Button variant="outline" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Another Project
            </Button>
          </CardContent>
        </Card>

        {/* Certificates */}
        <Card className="shadow-lg border-primary/10">
          <CardHeader>
            <CardTitle>Certificates</CardTitle>
            <CardDescription>Show off your qualifications and learning.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {initialCertificates.map((cert, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor={`cert-name-${index}`}>Certificate Name</Label>
                            <Input id={`cert-name-${index}`} placeholder="e.g., Certified Kubernetes Administrator" />
                        </div>
                        <div>
                            <Label htmlFor={`cert-body-${index}`}>Issuing Body</Label>
                            <Input id={`cert-body-${index}`} placeholder="e.g., The Linux Foundation" />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor={`cert-date-${index}`}>Date Obtained</Label>
                        <Input id={`cert-date-${index}`} type="month" />
                    </div>
                    {index > 0 && <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>}
                </div>
            ))}
            <Button variant="outline" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Another Certificate
            </Button>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="shadow-lg border-primary/10">
            <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>List your notable accomplishments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {initialAchievements.map((ach, index) => (
                    <div key={index} className="flex items-center gap-2 relative">
                        <Input id={`achievement-${index}`} placeholder="e.g., Won 1st place at TechCrunch Disrupt" />
                        {index > 0 && <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>}
                    </div>
                ))}
                <Button variant="outline" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Another Achievement
                </Button>
            </CardContent>
        </Card>

        {/* Testimonials */}
        <Card className="shadow-lg border-primary/10">
            <CardHeader>
                <CardTitle>Testimonials</CardTitle>
                <CardDescription>Let others speak to your skills.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {initialTestimonials.map((test, index) => (
                    <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                        <div>
                            <Label htmlFor={`testimonial-text-${index}`}>Testimonial</Label>
                            <Textarea id={`testimonial-text-${index}`} placeholder="e.g., 'Working with John was a fantastic experience...'" />
                        </div>
                        <div>
                            <Label htmlFor={`testimonial-author-${index}`}>Author</Label>
                            <Input id={`testimonial-author-${index}`} placeholder="e.g., Jane Smith, CEO of Innovate Inc." />
                        </div>
                        {index > 0 && <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>}
                    </div>
                ))}
                <Button variant="outline" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Another Testimonial
                </Button>
            </CardContent>
        </Card>

        {/* FAQs */}
        <Card className="shadow-lg border-primary/10">
            <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Answer common questions potential employers or clients might have.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {initialFaqs.map((faq, index) => (
                    <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                        <div>
                            <Label htmlFor={`faq-question-${index}`}>Question</Label>
                            <Input id={`faq-question-${index}`} placeholder="e.g., What are you passionate about?" />
                        </div>
                        <div>
                            <Label htmlFor={`faq-answer-${index}`}>Answer</Label>
                            <Textarea id={`faq-answer-${index}`} placeholder="Your answer here..." />
                        </div>
                        {index > 0 && <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>}
                    </div>
                ))}
                <Button variant="outline" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Another FAQ
                </Button>
            </CardContent>
        </Card>

        <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" size="lg">Preview</Button>
            <Button size="lg" disabled>Save & Generate Portfolio</Button>
        </div>
      </div>
    </main>
  );
}
