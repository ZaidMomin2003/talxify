
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { PlusCircle, Trash2 } from "lucide-react";
import React, { useState } from "react";
import Link from "next/link";

const initialProjects = [{ title: 'Talxify - AI Interview Coach', description: 'An AI-powered platform to help users practice for technical interviews with real-time feedback and coding assistance.', link: 'https://talxify.ai', tags: 'Next.js, AI, Tailwind' }];
const initialCertificates = [{ name: 'Google Cloud Certified - Professional Cloud Architect', body: 'Google Cloud', date: '2023-05' }];
const initialAchievements = [{ description: "Speaker at React Conf 2023 on 'The Future of Web Development'." }];
const initialTestimonials = [{ testimonial: 'John is a brilliant engineer who brings not only technical expertise but also a creative and collaborative spirit to every project. He was instrumental in our latest launch.', author: 'Jane Smith, CEO of Tech Innovations' }];
const initialFaqs = [{ question: 'What are you most passionate about in software development?', answer: 'I am most passionate about creating elegant solutions to complex problems and building products that have a meaningful impact on people\'s lives. I love the blend of creativity and logic that software engineering requires.' }];
const initialSkills = [{ skill: 'React' }, { skill: 'Next.js' }, { skill: 'TypeScript' }, { skill: 'Node.js' }, { skill: 'GraphQL' }];
const initialExperience = [{ role: 'Senior Software Engineer', company: 'Tech Innovations Inc.', duration: '2021 - Present', description: 'Led the development of a new microservices-based architecture, improving system scalability by 50%.' }];
const initialEducation = [{ degree: 'B.Sc. in Computer Science', institution: 'State University', year: '2018' }];

const colorOptions = [
    { name: 'Default', hsl: '210 90% 60%' },
    { name: 'Green', hsl: '150 80% 50%' },
    { name: 'Orange', hsl: '30 90% 55%' },
    { name: 'Purple', hsl: '260 85% 65%' },
    { name: 'Red', hsl: '0 85% 60%' },
];

export default function PortfolioPage() {
  const [projects, setProjects] = useState(initialProjects);
  const [certificates, setCertificates] = useState(initialCertificates);
  const [achievements, setAchievements] = useState(initialAchievements);
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [faqs, setFaqs] = useState(initialFaqs);
  const [skills, setSkills] = useState(initialSkills);
  const [experience, setExperience] = useState(initialExperience);
  const [education, setEducation] = useState(initialEducation);
  const [themeColor, setThemeColor] = useState(colorOptions[0].hsl);

  const addProject = () => setProjects([...projects, { title: '', description: '', link: '', tags: '' }]);
  const removeProject = (index: number) => setProjects(projects.filter((_, i) => i !== index));
  const handleProjectChange = (index: number, field: string, value: string) => {
    const newProjects = [...projects];
    newProjects[index] = { ...newProjects[index], [field]: value };
    setProjects(newProjects);
  };

  const addCertificate = () => setCertificates([...certificates, { name: '', body: '', date: '' }]);
  const removeCertificate = (index: number) => setCertificates(certificates.filter((_, i) => i !== index));
  const handleCertificateChange = (index: number, field: string, value: string) => {
    const newCertificates = [...certificates];
    newCertificates[index] = { ...newCertificates[index], [field]: value };
    setCertificates(newCertificates);
  };

  const addAchievement = () => setAchievements([...achievements, { description: '' }]);
  const removeAchievement = (index: number) => setAchievements(achievements.filter((_, i) => i !== index));
  const handleAchievementChange = (index: number, value: string) => {
    const newAchievements = [...achievements];
    newAchievements[index] = { description: value };
    setAchievements(newAchievements);
  };
  
  const addTestimonial = () => setTestimonials([...testimonials, { testimonial: '', author: '' }]);
  const removeTestimonial = (index: number) => setTestimonials(testimonials.filter((_, i) => i !== index));
  const handleTestimonialChange = (index: number, field: string, value: string) => {
    const newTestimonials = [...testimonials];
    newTestimonials[index] = { ...newTestimonials[index], [field]: value };
    setTestimonials(newTestimonials);
  };

  const addFaq = () => setFaqs([...faqs, { question: '', answer: '' }]);
  const removeFaq = (index: number) => setFaqs(faqs.filter((_, i) => i !== index));
  const handleFaqChange = (index: number, field: string, value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    setFaqs(newFaqs);
  };

  const addSkill = () => setSkills([...skills, { skill: '' }]);
  const removeSkill = (index: number) => setSkills(skills.filter((_, i) => i !== index));
  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...skills];
    newSkills[index] = { skill: value };
    setSkills(newSkills);
  };

  const addExperience = () => setExperience([...experience, { role: '', company: '', duration: '', description: '' }]);
  const removeExperience = (index: number) => setExperience(experience.filter((_, i) => i !== index));
  const handleExperienceChange = (index: number, field: string, value: string) => {
    const newExperience = [...experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    setExperience(newExperience);
  };

  const addEducation = () => setEducation([...education, { degree: '', institution: '', year: '' }]);
  const removeEducation = (index: number) => setEducation(education.filter((_, i) => i !== index));
  const handleEducationChange = (index: number, field: string, value: string) => {
    const newEducation = [...education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setEducation(newEducation);
  };

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
                <Input id="name" placeholder="e.g., John Doe" defaultValue="John Doe" />
              </div>
              <div>
                <Label htmlFor="profession">Profession</Label>
                <Input id="profession" placeholder="e.g., Senior Software Engineer" defaultValue="Senior Software Engineer" />
              </div>
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" placeholder="Tell a little bit about yourself..." defaultValue="A passionate software engineer with a love for building scalable and user-friendly web applications." />
            </div>
             <div>
              <Label htmlFor="bannerUrl">Portfolio Banner URL</Label>
              <Input id="bannerUrl" placeholder="https://placehold.co/1200x300.png" defaultValue="https://placehold.co/1200x300.png" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="e.g., john.doe@example.com" defaultValue="john.doe@example.com" />
                </div>
                <div>
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input id="phone" type="tel" placeholder="e.g., +1 234 567 890" defaultValue="+1 234 567 890" />
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Customization */}
        <Card className="shadow-lg border-primary/10">
          <CardHeader>
            <CardTitle>Theme Customization</CardTitle>
            <CardDescription>Choose a primary color for your portfolio.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {colorOptions.map((color) => (
                <div key={color.name} className="flex items-center gap-2">
                  <button
                    onClick={() => setThemeColor(color.hsl)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-transform transform",
                      themeColor === color.hsl ? "border-ring scale-110" : "border-transparent"
                    )}
                    style={{ backgroundColor: `hsl(${color.hsl})` }}
                  />
                  <Label htmlFor={`color-${color.name}`}>{color.name}</Label>
                </div>
              ))}
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
                    <Input id="github" placeholder="https://github.com/your-username" defaultValue="https://github.com/johndoe" />
                </div>
                <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input id="linkedin" placeholder="https://linkedin.com/in/your-profile" defaultValue="https://linkedin.com/in/johndoe" />
                </div>
                <div>
                    <Label htmlFor="twitter">Twitter / X</Label>
                    <Input id="twitter" placeholder="https://twitter.com/your-handle" defaultValue="https://twitter.com/johndoe" />
                </div>
                 <div>
                    <Label htmlFor="website">Personal Website (Optional)</Label>
                    <Input id="website" placeholder="https://your-site.com" defaultValue="https://johndoe.com" />
                </div>
                <div>
                    <Label htmlFor="instagram">Instagram (Optional)</Label>
                    <Input id="instagram" placeholder="https://instagram.com/your-handle" defaultValue="https://instagram.com/johndoe" />
                </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Skills */}
        <Card className="shadow-lg border-primary/10">
            <CardHeader>
                <CardTitle>Skills</CardTitle>
                <CardDescription>List your technical skills.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {skills.map((skill, index) => (
                        <div key={index} className="flex items-center gap-2 relative">
                            <Input id={`skill-${index}`} placeholder="e.g., React" value={skill.skill} onChange={(e) => handleSkillChange(index, e.target.value)} />
                            <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeSkill(index)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                    ))}
                </div>
                <Button variant="outline" className="w-full" onClick={addSkill}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Another Skill
                </Button>
            </CardContent>
        </Card>

        {/* Work Experience */}
        <Card className="shadow-lg border-primary/10">
            <CardHeader>
                <CardTitle>Work Experience</CardTitle>
                <CardDescription>Detail your professional history.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {experience.map((exp, index) => (
                    <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor={`exp-role-${index}`}>Role</Label>
                                <Input id={`exp-role-${index}`} placeholder="e.g., Software Engineer" value={exp.role} onChange={(e) => handleExperienceChange(index, 'role', e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor={`exp-company-${index}`}>Company</Label>
                                <Input id={`exp-company-${index}`} placeholder="e.g., Tech Corp" value={exp.company} onChange={(e) => handleExperienceChange(index, 'company', e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor={`exp-duration-${index}`}>Duration</Label>
                            <Input id={`exp-duration-${index}`} placeholder="e.g., 2020 - 2022" value={exp.duration} onChange={(e) => handleExperienceChange(index, 'duration', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor={`exp-description-${index}`}>Description</Label>
                            <Textarea id={`exp-description-${index}`} placeholder="Describe your responsibilities and achievements..." value={exp.description} onChange={(e) => handleExperienceChange(index, 'description', e.target.value)} />
                        </div>
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => removeExperience(index)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                ))}
                <Button variant="outline" className="w-full" onClick={addExperience}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Experience
                </Button>
            </CardContent>
        </Card>

        {/* Education */}
        <Card className="shadow-lg border-primary/10">
            <CardHeader>
                <CardTitle>Education</CardTitle>
                <CardDescription>Your academic background.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {education.map((edu, index) => (
                    <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor={`edu-degree-${index}`}>Degree/Certificate</Label>
                                <Input id={`edu-degree-${index}`} placeholder="e.g., Bachelor of Science" value={edu.degree} onChange={(e) => handleEducationChange(index, 'degree', e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor={`edu-institution-${index}`}>Institution</Label>
                                <Input id={`edu-institution-${index}`} placeholder="e.g., University of Technology" value={edu.institution} onChange={(e) => handleEducationChange(index, 'institution', e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor={`edu-year-${index}`}>Year of Completion</Label>
                            <Input id={`edu-year-${index}`} placeholder="e.g., 2020" value={edu.year} onChange={(e) => handleEducationChange(index, 'year', e.target.value)} />
                        </div>
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => removeEducation(index)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                ))}
                <Button variant="outline" className="w-full" onClick={addEducation}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Education
                </Button>
            </CardContent>
        </Card>

        {/* Projects */}
        <Card className="shadow-lg border-primary/10">
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>Highlight your best work. Add as many as you like.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {projects.map((project, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <Label htmlFor={`project-title-${index}`}>Project Title</Label>
                            <Input id={`project-title-${index}`} placeholder="e.g., Awesome App" value={project.title} onChange={(e) => handleProjectChange(index, 'title', e.target.value)} />
                        </div>
                         <div>
                            <Label htmlFor={`project-tags-${index}`}>Tags (comma separated)</Label>
                            <Input id={`project-tags-${index}`} placeholder="e.g., React, Next.js, AI" value={project.tags} onChange={(e) => handleProjectChange(index, 'tags', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor={`project-link-${index}`}>Project Link</Label>
                            <Input id={`project-link-${index}`} placeholder="https://example.com" value={project.link} onChange={(e) => handleProjectChange(index, 'link', e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor={`project-description-${index}`}>Description</Label>
                        <Textarea id={`project-description-${index}`} placeholder="Describe your project..." value={project.description} onChange={(e) => handleProjectChange(index, 'description', e.target.value)} />
                    </div>
                    {projects.length > 1 && <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => removeProject(index)}><Trash2 className="w-4 h-4" /></Button>}
                </div>
            ))}
            <Button variant="outline" className="w-full" onClick={addProject}>
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
            {certificates.map((cert, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <Label htmlFor={`cert-name-${index}`}>Certificate Name</Label>
                            <Input id={`cert-name-${index}`} placeholder="e.g., Certified Kubernetes Administrator" value={cert.name} onChange={(e) => handleCertificateChange(index, 'name', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor={`cert-body-${index}`}>Issuing Body</Label>
                            <Input id={`cert-body-${index}`} placeholder="e.g., The Linux Foundation" value={cert.body} onChange={(e) => handleCertificateChange(index, 'body', e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor={`cert-date-${index}`}>Date Obtained</Label>
                        <Input id={`cert-date-${index}`} type="month" value={cert.date} onChange={(e) => handleCertificateChange(index, 'date', e.target.value)} />
                    </div>
                    {certificates.length > 1 && <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => removeCertificate(index)}><Trash2 className="w-4 h-4" /></Button>}
                </div>
            ))}
            <Button variant="outline" className="w-full" onClick={addCertificate}>
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
                {achievements.map((ach, index) => (
                    <div key={index} className="flex items-center gap-2 relative">
                        <Input id={`achievement-${index}`} placeholder="e.g., Won 1st place at TechCrunch Disrupt" value={ach.description} onChange={(e) => handleAchievementChange(index, e.target.value)} />
                        {achievements.length > 1 && <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeAchievement(index)}><Trash2 className="w-4 h-4" /></Button>}
                    </div>
                ))}
                <Button variant="outline" className="w-full" onClick={addAchievement}>
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
                {testimonials.map((test, index) => (
                    <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                        <div>
                            <Label htmlFor={`testimonial-text-${index}`}>Testimonial</Label>
                            <Textarea id={`testimonial-text-${index}`} placeholder="e.g., 'Working with John was a fantastic experience...'" value={test.testimonial} onChange={(e) => handleTestimonialChange(index, 'testimonial', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor={`testimonial-author-${index}`}>Author</Label>
                            <Input id={`testimonial-author-${index}`} placeholder="e.g., Jane Smith, CEO of Innovate Inc." value={test.author} onChange={(e) => handleTestimonialChange(index, 'author', e.target.value)} />
                        </div>
                        {testimonials.length > 1 && <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => removeTestimonial(index)}><Trash2 className="w-4 h-4" /></Button>}
                    </div>
                ))}
                <Button variant="outline" className="w-full" onClick={addTestimonial}>
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
                {faqs.map((faq, index) => (
                    <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                        <div>
                            <Label htmlFor={`faq-question-${index}`}>Question</Label>
                            <Input id={`faq-question-${index}`} placeholder="e.g., What are you passionate about?" value={faq.question} onChange={(e) => handleFaqChange(index, 'question', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor={`faq-answer-${index}`}>Answer</Label>
                            <Textarea id={`faq-answer-${index}`} placeholder="Your answer here..." value={faq.answer} onChange={(e) => handleFaqChange(index, 'answer', e.target.value)} />
                        </div>
                        {faqs.length > 1 && <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => removeFaq(index)}><Trash2 className="w-4 h-4" /></Button>}
                    </div>
                ))}
                <Button variant="outline" className="w-full" onClick={addFaq}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Another FAQ
                </Button>
            </CardContent>
        </Card>

        <div className="flex justify-end gap-2 pt-4">
            <Button asChild variant="outline" size="lg">
              <Link href={{ pathname: "/johndoe", query: { color: themeColor } }}>Preview</Link>
            </Button>
            <Button size="lg" disabled>Save & Generate Portfolio</Button>
        </div>
      </div>
    </main>
  );
}
