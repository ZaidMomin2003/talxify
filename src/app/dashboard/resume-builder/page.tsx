
'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useReactToPrint } from 'react-to-print';
import { FileText, PlusCircle, Trash2, Mail, Phone, Linkedin, Github, Globe, Download } from 'lucide-react';
import { initialPortfolioData } from '@/lib/initial-data';
import { cn } from '@/lib/utils';

// Simplified types for resume
type ResumeExperience = { company: string; role: string; duration: string; description: string; };
type ResumeEducation = { institution: string; degree: string; year: string; };
type ResumeSkill = { name: string; };

const initialResumeState = {
    personalInfo: {
        name: 'Zaid Arshad',
        profession: 'Software Engineer',
        email: 'zaid@example.com',
        phone: '+91 12345 67890',
        linkedin: 'linkedin.com/in/zaid',
        github: 'github.com/zaid',
        website: 'zaid.dev',
        summary: 'A passionate and driven software engineer with experience in building robust web applications using modern technologies. Eager to contribute to a dynamic team and solve complex problems.'
    },
    experience: [
        { company: 'Innovate Tech', role: 'Frontend Developer', duration: 'Jan 2022 - Present', description: '- Developed and maintained responsive user interfaces using React and TypeScript.\n- Collaborated with designers to implement pixel-perfect designs.' }
    ],
    education: [
        { institution: 'State University', degree: 'B.S. in Computer Science', year: '2018 - 2022' }
    ],
    skills: [
        { name: 'JavaScript' }, { name: 'React' }, { name: 'Node.js' }, { name: 'TypeScript' }, { name: 'Python' }, { name: 'SQL' }
    ]
}


export default function ResumeBuilderPage() {
    const [resumeData, setResumeData] = useState(initialResumeState);
    const resumePreviewRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        content: () => resumePreviewRef.current,
        documentTitle: `${resumeData.personalInfo.name.replace(' ', '_')}_Resume`,
    });

    const handleInfoChange = (field: keyof typeof resumeData.personalInfo, value: string) => {
        setResumeData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [field]: value }}));
    }

    const handleSectionChange = <T extends ResumeExperience | ResumeEducation | ResumeSkill>(section: 'experience' | 'education' | 'skills', index: number, field: keyof T, value: string) => {
         setResumeData(prev => {
            const newSection = [...prev[section]];
            // @ts-ignore
            newSection[index][field] = value;
            return { ...prev, [section]: newSection };
        });
    };

    const handleAddItem = (section: 'experience' | 'education' | 'skills') => {
        let newItem;
        if (section === 'experience') newItem = { company: '', role: '', duration: '', description: '' };
        else if (section === 'education') newItem = { institution: '', degree: '', year: '' };
        else newItem = { name: '' };
        
        // @ts-ignore
        setResumeData(prev => ({ ...prev, [section]: [...prev[section], newItem]}));
    };
    
    const handleRemoveItem = (section: 'experience' | 'education' | 'skills', index: number) => {
        setResumeData(prev => ({
            ...prev,
            [section]: prev[section].filter((_, i) => i !== index)
        }));
    };

    return (
        <main className="flex-1 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(100vh-4rem)]">
                {/* Editor Panel */}
                <div className="overflow-y-auto p-6 space-y-6">
                    <div className="flex items-center justify-between">
                         <h1 className="text-3xl font-bold font-headline flex items-center gap-3"><FileText/> Resume Builder</h1>
                         <Button onClick={handlePrint}><Download className="mr-2"/> Download PDF</Button>
                    </div>

                    <Card>
                        <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input placeholder="Full Name" value={resumeData.personalInfo.name} onChange={(e) => handleInfoChange('name', e.target.value)} />
                                <Input placeholder="Profession" value={resumeData.personalInfo.profession} onChange={(e) => handleInfoChange('profession', e.target.value)} />
                            </div>
                             <Input placeholder="Email" value={resumeData.personalInfo.email} onChange={(e) => handleInfoChange('email', e.target.value)} />
                             <Input placeholder="Phone" value={resumeData.personalInfo.phone} onChange={(e) => handleInfoChange('phone', e.target.value)} />
                            <div className="grid grid-cols-2 gap-4">
                                <Input placeholder="LinkedIn Profile URL" value={resumeData.personalInfo.linkedin} onChange={(e) => handleInfoChange('linkedin', e.target.value)} />
                                <Input placeholder="GitHub Profile URL" value={resumeData.personalInfo.github} onChange={(e) => handleInfoChange('github', e.target.value)} />
                            </div>
                            <Input placeholder="Personal Website (Optional)" value={resumeData.personalInfo.website} onChange={(e) => handleInfoChange('website', e.target.value)} />
                            <Textarea placeholder="Professional Summary" value={resumeData.personalInfo.summary} onChange={(e) => handleInfoChange('summary', e.target.value)} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Work Experience</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {resumeData.experience.map((exp, index) => (
                                <div key={index} className="p-4 border rounded-lg space-y-3 relative">
                                    <Button variant="ghost" size="icon" className="absolute top-1 right-1" onClick={() => handleRemoveItem('experience', index)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                                    <Input placeholder="Company Name" value={exp.company} onChange={(e) => handleSectionChange('experience', index, 'company', e.target.value)} />
                                    <Input placeholder="Role / Position" value={exp.role} onChange={(e) => handleSectionChange('experience', index, 'role', e.target.value)} />
                                    <Input placeholder="Duration (e.g., Jan 2022 - Present)" value={exp.duration} onChange={(e) => handleSectionChange('experience', index, 'duration', e.target.value)} />
                                    <Textarea placeholder="Description of responsibilities and achievements..." value={exp.description} onChange={(e) => handleSectionChange('experience', index, 'description', e.target.value)} />
                                </div>
                            ))}
                            <Button variant="outline" className="w-full" onClick={() => handleAddItem('experience')}><PlusCircle className="mr-2"/> Add Experience</Button>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Education</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {resumeData.education.map((edu, index) => (
                                <div key={index} className="p-4 border rounded-lg space-y-3 relative">
                                    <Button variant="ghost" size="icon" className="absolute top-1 right-1" onClick={() => handleRemoveItem('education', index)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                                    <Input placeholder="Institution Name" value={edu.institution} onChange={(e) => handleSectionChange('education', index, 'institution', e.target.value)} />
                                    <Input placeholder="Degree / Certificate" value={edu.degree} onChange={(e) => handleSectionChange('education', index, 'degree', e.target.value)} />
                                    <Input placeholder="Year of Completion" value={edu.year} onChange={(e) => handleSectionChange('education', index, 'year', e.target.value)} />
                                </div>
                            ))}
                            <Button variant="outline" className="w-full" onClick={() => handleAddItem('education')}><PlusCircle className="mr-2"/> Add Education</Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {resumeData.skills.map((skill, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Input placeholder="e.g., React" value={skill.name} onChange={(e) => handleSectionChange('skills', index, 'name', e.target.value)} />
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem('skills', index)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" className="w-full" onClick={() => handleAddItem('skills')}><PlusCircle className="mr-2"/> Add Skill</Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Preview Panel */}
                <div className="bg-muted hidden lg:block overflow-y-auto p-8 print:block">
                     <style jsx global>{`
                        @media print {
                            body { -webkit-print-color-adjust: exact; }
                            .no-print { display: none; }
                            main { display: block !important; padding: 0 !important; }
                        }
                        @page {
                            size: A4;
                            margin: 1.5cm;
                        }
                    `}</style>
                    <div ref={resumePreviewRef} className="bg-white text-black shadow-lg p-10 font-serif w-full mx-auto" style={{ width: '210mm', minHeight: '297mm' }}>
                        <header className="text-center mb-8">
                            <h1 className="text-4xl font-bold tracking-wider uppercase">{resumeData.personalInfo.name}</h1>
                            <p className="text-lg font-semibold text-gray-600">{resumeData.personalInfo.profession}</p>
                            <div className="flex justify-center items-center gap-x-4 gap-y-1 text-xs mt-2 flex-wrap text-gray-500">
                                {resumeData.personalInfo.email && <a href={`mailto:${resumeData.personalInfo.email}`} className="flex items-center gap-1 hover:text-blue-700"><Mail className="w-3 h-3"/> {resumeData.personalInfo.email}</a>}
                                {resumeData.personalInfo.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3"/> {resumeData.personalInfo.phone}</span>}
                                {resumeData.personalInfo.linkedin && <a href={`https://${resumeData.personalInfo.linkedin}`} target="_blank" className="flex items-center gap-1 hover:text-blue-700"><Linkedin className="w-3 h-3"/> {resumeData.personalInfo.linkedin}</a>}
                                {resumeData.personalInfo.github && <a href={`https://${resumeData.personalInfo.github}`} target="_blank" className="flex items-center gap-1 hover:text-blue-700"><Github className="w-3 h-3"/> {resumeData.personalInfo.github}</a>}
                                {resumeData.personalInfo.website && <a href={`https://${resumeData.personalInfo.website}`} target="_blank" className="flex items-center gap-1 hover:text-blue-700"><Globe className="w-3 h-3"/> {resumeData.personalInfo.website}</a>}
                            </div>
                        </header>
                        
                        <section className="mb-8">
                           <h2 className="text-xl font-bold border-b-2 border-black pb-1 mb-2 uppercase tracking-widest">Summary</h2>
                           <p className="text-sm text-gray-700 leading-relaxed">{resumeData.personalInfo.summary}</p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold border-b-2 border-black pb-1 mb-3 uppercase tracking-widest">Experience</h2>
                            <div className="space-y-4">
                                {resumeData.experience.map((exp, index) => (
                                    <div key={index} className="text-sm">
                                        <div className="flex justify-between items-baseline">
                                          <h3 className="font-bold text-base">{exp.company}</h3>
                                          <p className="font-semibold text-gray-600">{exp.duration}</p>
                                        </div>
                                        <p className="italic text-gray-700 mb-1">{exp.role}</p>
                                        <div className="text-gray-700 leading-snug whitespace-pre-wrap pl-4">
                                          {exp.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                         <section className="mb-8">
                            <h2 className="text-xl font-bold border-b-2 border-black pb-1 mb-3 uppercase tracking-widest">Education</h2>
                            {resumeData.education.map((edu, index) => (
                                <div key={index} className="text-sm flex justify-between items-baseline">
                                     <div>
                                        <h3 className="font-bold text-base">{edu.institution}</h3>
                                        <p className="text-gray-700">{edu.degree}</p>
                                     </div>
                                    <p className="font-semibold text-gray-600">{edu.year}</p>
                                </div>
                            ))}
                        </section>
                        
                         <section>
                            <h2 className="text-xl font-bold border-b-2 border-black pb-1 mb-3 uppercase tracking-widest">Skills</h2>
                            <div className="flex flex-wrap gap-x-4 gap-y-2">
                                {resumeData.skills.map((skill, index) => (
                                    <span key={index} className="text-sm text-gray-800">{skill.name}</span>
                                ))}
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </main>
    )
}

    