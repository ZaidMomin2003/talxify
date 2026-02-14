

'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FileText, PlusCircle, Trash2, Mail, Phone, Linkedin, Github, Globe, Download, Loader2, Gem, CheckCircle, Sparkles, Wand2, User as UserIcon, Building, Languages, Heart } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { getUserData, checkAndIncrementResumeExports, checkAndIncrementUsage } from '@/lib/firebase-service';
import type { UserData, ResumeData } from '@/lib/types';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { enhanceResume } from '@/ai/flows/enhance-resume';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";

// Simplified types for resume
type ResumeExperience = { company: string; role: string; duration: string; description: string; };
type ResumeEducation = { institution: string; degree: string; year: string; };
type ResumeSkill = { name: string; };
type ResumeLanguage = { name: string; proficiency: string; level: number; };
type ResumeHobby = { name: string; };


const initialResumeState = {
    personalInfo: {
        name: 'Alex Rivera',
        profession: 'Senior Product Designer',
        email: 'alex.rivera@design.co',
        phone: '+1 (555) 012-3456',
        address: 'San Francisco, CA',
        linkedin: 'linkedin.com/in/alex-rivera',
        github: 'github.com/arivera',
        website: 'arivera.design',
        summary: 'Strategic Product Designer with over 8 years of experience building scalable design systems and high-converting user interfaces. Expert in bridging the gap between design and engineering to deliver world-class digital products.'
    },
    themeColor: '#0f172a',
    experience: [
        { company: 'TechFlow Systems', role: 'Lead Product Designer', duration: '2021 - Present', description: '• Spearheaded the redesign of the core dashboard, resulting in a 25% increase in user retention.\n• Mentored a team of 5 junior designers and established a comprehensive design system in Figma.\n• Collaborated with engineering leads to implement high-fidelity prototypes using React.' },
        { company: 'Creative Pulse', role: 'UI/UX Designer', duration: '2018 - 2021', description: '• Designed end-to-end mobile experiences for Fortune 500 clients in the fintech space.\n• Conducted over 50+ user testing sessions to iterate on high-fidelity designs.\n• Reduced design-to-development handoff time by 40% through documentation improvements.' }
    ],
    education: [
        { institution: 'Rhode Island School of Design', degree: 'BFA in Graphic Design', year: '2016' }
    ],
    skills: [
        { name: 'Product Strategy' }, { name: 'Design Systems' }, { name: 'UI/UX Design' }, { name: 'Prototyping' }, { name: 'React/Swift' }
    ],
    languages: [
        { name: 'English', proficiency: 'Native', level: 100 },
        { name: 'Spanish', proficiency: 'Full Professional', level: 90 }
    ],
    hobbies: [
        { name: 'Architecture Photography' }, { name: 'Open Source' }, { name: 'Mountain Biking' }
    ]
}

const colorOptions = [
    { name: 'Slate', hex: '#0f172a' },
    { name: 'Indigo', hex: '#4338ca' },
    { name: 'Emerald', hex: '#065f46' },
    { name: 'Crimson', hex: '#991b1b' },
    { name: 'Violet', hex: '#5b21b6' },
];


const ResumePreview = React.forwardRef<HTMLDivElement, { resumeData: typeof initialResumeState }>(({ resumeData }, ref) => {
    return (
        <div ref={ref} id="resume-preview" className="bg-white text-slate-900 shadow-2xl font-sans w-full min-h-[297mm] overflow-hidden flex flex-col sm:flex-row print:shadow-none">
            {/* Left Sidebar */}
            <div
                className="w-full sm:w-[32%] p-8 text-white space-y-8 print:p-6"
                style={{ backgroundColor: resumeData.themeColor }}
            >
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 opacity-70">Contact</h3>
                        <div className="space-y-3 text-[10px] leading-tight opacity-90">
                            {resumeData.personalInfo.email && (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center shrink-0">
                                        <Mail className="w-3 h-3" />
                                    </div>
                                    <span className="break-all">{resumeData.personalInfo.email}</span>
                                </div>
                            )}
                            {resumeData.personalInfo.phone && (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center shrink-0">
                                        <Phone className="w-3 h-3" />
                                    </div>
                                    <span>{resumeData.personalInfo.phone}</span>
                                </div>
                            )}
                            {resumeData.personalInfo.linkedin && (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center shrink-0">
                                        <Linkedin className="w-3 h-3" />
                                    </div>
                                    <span>{resumeData.personalInfo.linkedin}</span>
                                </div>
                            )}
                            {resumeData.personalInfo.github && (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center shrink-0">
                                        <Github className="w-3 h-3" />
                                    </div>
                                    <span>{resumeData.personalInfo.github}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 opacity-70">Expertise</h3>
                        <div className="flex flex-wrap gap-2">
                            {resumeData.skills.map((skill, i) => (
                                <span key={i} className="text-[9px] px-2 py-1 bg-white/10 rounded-md font-medium">
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 opacity-70">Languages</h3>
                        <div className="space-y-4">
                            {resumeData.languages.map((lang, i) => (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex justify-between text-[9px] font-bold">
                                        <span>{lang.name}</span>
                                        <span className="opacity-70">{lang.proficiency}</span>
                                    </div>
                                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                                        <div className="bg-white h-full" style={{ width: `${lang.level}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 opacity-70">Interests</h3>
                        <div className="space-y-2">
                            {resumeData.hobbies.map((hobby, i) => (
                                <div key={i} className="flex items-center gap-2 text-[10px] opacity-90">
                                    <div className="w-1 h-1 rounded-full bg-white/40" />
                                    {hobby.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Content */}
            <div className="flex-1 p-10 space-y-10 print:p-8">
                <header>
                    <h1 className="text-4xl font-black tracking-tight mb-2 uppercase" style={{ color: resumeData.themeColor }}>
                        {resumeData.personalInfo.name}
                    </h1>
                    <p className="text-lg font-bold text-slate-500 tracking-wide uppercase">
                        {resumeData.personalInfo.profession}
                    </p>
                </header>

                <section className="space-y-4">
                    <h2 className="text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-4 text-slate-400">
                        Profile
                        <div className="h-px bg-slate-100 flex-1" />
                    </h2>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium italic">
                        "{resumeData.personalInfo.summary}"
                    </p>
                </section>

                <section className="space-y-6">
                    <h2 className="text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-4 text-slate-400">
                        Experience
                        <div className="h-px bg-slate-100 flex-1" />
                    </h2>
                    <div className="space-y-8">
                        {resumeData.experience.map((exp, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-sm font-bold text-slate-800">{exp.role}</h3>
                                    <span className="text-[10px] font-bold text-slate-400">{exp.duration}</span>
                                </div>
                                <p className="text-[11px] font-bold" style={{ color: resumeData.themeColor }}>{exp.company}</p>
                                <ul className="space-y-1.5">
                                    {exp.description.split('\n').map((item, key) => (
                                        item.trim() && (
                                            <li key={key} className="text-[10px] text-slate-600 font-medium leading-relaxed flex gap-2">
                                                <span className="text-slate-300">•</span>
                                                {item.replace(/^[•\-\*]\s*/, '')}
                                            </li>
                                        )
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-4 text-slate-400">
                        Education
                        <div className="h-px bg-slate-100 flex-1" />
                    </h2>
                    <div className="space-y-4">
                        {resumeData.education.map((edu, i) => (
                            <div key={i} className="flex justify-between items-baseline">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-bold text-slate-800">{edu.institution}</h3>
                                    <p className="text-[10px] font-semibold text-slate-500">{edu.degree}</p>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">{edu.year}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
});
ResumePreview.displayName = 'ResumePreview';

export default function ResumeBuilderPage() {
    const { user } = useAuth();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [resumeData, setResumeData] = useState(initialResumeState);
    const resumePreviewRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                const data = await getUserData(user.uid);
                setUserData(data);

                // Pre-fill resume data from user's portfolio if available
                if (data?.portfolio) {
                    const portfolio = data.portfolio;
                    setResumeData({
                        personalInfo: {
                            name: portfolio.personalInfo.name || initialResumeState.personalInfo.name,
                            profession: portfolio.personalInfo.profession || initialResumeState.personalInfo.profession,
                            email: portfolio.personalInfo.email || initialResumeState.personalInfo.email,
                            phone: portfolio.personalInfo.phone || initialResumeState.personalInfo.phone,
                            address: portfolio.personalInfo.address || initialResumeState.personalInfo.address,
                            linkedin: portfolio.socials.linkedin || initialResumeState.personalInfo.linkedin,
                            github: portfolio.socials.github || initialResumeState.personalInfo.github,
                            website: portfolio.socials.website || initialResumeState.personalInfo.website,
                            summary: portfolio.personalInfo.bio || initialResumeState.personalInfo.summary,
                        },
                        themeColor: portfolio.themeColor || initialResumeState.themeColor,
                        experience: portfolio.experience.map(e => ({ company: e.company, role: e.role, duration: e.duration, description: e.description })) || initialResumeState.experience,
                        education: portfolio.education.map(e => ({ institution: e.institution, degree: e.degree, year: e.year })) || initialResumeState.education,
                        skills: portfolio.skills.map(s => ({ name: s.skill })) || initialResumeState.skills,
                        languages: portfolio.skills.map(s => ({ name: s.skill, proficiency: 'Proficient', level: s.expertise })) || initialResumeState.languages,
                        hobbies: portfolio.hobbies || initialResumeState.hobbies,
                    });
                }
            }
            setIsLoading(false);
        };
        fetchUserData();
    }, [user]);

    const startDownload = async (dataToDownload: typeof initialResumeState) => {
        const resumeElement = resumePreviewRef.current;
        if (!resumeElement) return;

        setIsDownloading(true);

        // Temporarily render the data to be downloaded, then render back
        const originalData = { ...resumeData };
        setResumeData(dataToDownload);

        await new Promise(resolve => setTimeout(resolve, 100)); // Allow DOM to update

        html2canvas(resumeElement, { scale: 2, useCORS: true, logging: false })
            .then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const ratio = canvas.width / canvas.height;
                let finalWidth = pdfWidth;
                let finalHeight = pdfWidth / ratio;
                if (finalHeight > pdfHeight) {
                    finalHeight = pdfHeight;
                    finalWidth = pdfHeight * ratio;
                }
                const x = (pdfWidth - finalWidth) / 2;
                pdf.addImage(imgData, 'PNG', x, 0, finalWidth, finalHeight);
                pdf.save(`${dataToDownload.personalInfo.name}_Resume.pdf`);
                toast({ title: "Download Started", description: "Your resume PDF is being prepared." });
            })
            .catch(err => {
                console.error("Error generating PDF:", err);
                toast({ title: "Download Failed", description: "An error occurred while generating the PDF.", variant: "destructive" });
            })
            .finally(() => {
                setIsDownloading(false);
                setResumeData(originalData); // Restore original data to the editor
                setIsDownloadModalOpen(false);
            });
    };

    const handleDownloadClick = async () => {
        if (!user) {
            toast({ title: "Please log in", description: "You need to be logged in to download a resume.", variant: "destructive" });
            return;
        }
        const usageCheck = await checkAndIncrementResumeExports(user.uid);
        if (!usageCheck.success) {
            toast({ title: "Limit Reached", description: usageCheck.message, variant: "destructive" });
            return;
        }
        setIsDownloadModalOpen(true);
    };

    const handleEnhanceAndDownload = async () => {
        if (!user) {
            toast({ title: "Please log in", variant: "destructive" });
            return;
        }

        const usageCheck = await checkAndIncrementUsage(user.uid, 'aiEnhancements');
        if (!usageCheck.success) {
            toast({ title: "Usage Limit Reached", description: usageCheck.message, variant: 'destructive' });
            return;
        }

        setIsEnhancing(true);
        try {
            // Map the current state to the format expected by the AI flow
            const inputForAI: ResumeData = {
                personalInfo: resumeData.personalInfo,
                experience: resumeData.experience,
                education: resumeData.education,
                skills: resumeData.skills.map(s => ({ skill: s.name, expertise: 80 })), // map to expected format
                languages: resumeData.languages,
                hobbies: resumeData.hobbies,
            };

            const enhancedResult = await enhanceResume(inputForAI);

            // Create a new resume data object with the enhanced content
            const enhancedData = JSON.parse(JSON.stringify(resumeData)); // Deep copy
            enhancedData.personalInfo.summary = enhancedResult.enhancedSummary;
            enhancedResult.enhancedExperience.forEach(enhancedExp => {
                const originalExp = enhancedData.experience.find((exp: ResumeExperience) => exp.role === enhancedExp.originalRole);
                if (originalExp) {
                    originalExp.description = enhancedExp.enhancedDescription;
                }
            });

            toast({ title: "Resume Enhanced!", description: "AI has rewritten your content. Preparing PDF..." });
            await startDownload(enhancedData);

        } catch (error) {
            console.error("Failed to enhance resume:", error);
            toast({ title: "Enhancement Failed", description: "Could not enhance resume content. Please try again.", variant: "destructive" });
        } finally {
            setIsEnhancing(false);
        }
    };


    const handleInfoChange = (field: keyof typeof resumeData.personalInfo, value: string) => {
        setResumeData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [field]: value } }));
    }

    const handleSectionChange = <T extends ResumeExperience | ResumeEducation | ResumeSkill | ResumeLanguage | ResumeHobby>(
        section: 'experience' | 'education' | 'skills' | 'languages' | 'hobbies',
        index: number,
        field: keyof T,
        value: string | number
    ) => {
        setResumeData(prev => {
            const newSection = [...prev[section]];
            // @ts-ignore
            newSection[index][field] = value;
            return { ...prev, [section]: newSection };
        });
    };

    const handleAddItem = (section: 'experience' | 'education' | 'skills' | 'languages' | 'hobbies') => {
        let newItem;
        if (section === 'experience') newItem = { company: '', role: '', duration: '', description: '' };
        else if (section === 'education') newItem = { institution: '', degree: '', year: '' };
        else if (section === 'languages') newItem = { name: '', proficiency: '', level: 50 };
        else if (section === 'hobbies') newItem = { name: '' };
        else newItem = { name: '' };

        // @ts-ignore
        setResumeData(prev => ({ ...prev, [section]: [...prev[section], newItem] }));
    };

    const handleRemoveItem = (section: 'experience' | 'education' | 'skills' | 'languages' | 'hobbies', index: number) => {
        setResumeData(prev => ({
            ...prev,
            [section]: prev[section].filter((_, i) => i !== index)
        }));
    };

    const [activeSection, setActiveSection] = useState<'info' | 'skills' | 'exp' | 'edu' | 'misc'>('info');

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-zinc-950">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary opacity-50" />
                    <p className="text-zinc-500 font-medium animate-pulse">Designing your workbench...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <main className="flex-1 h-screen overflow-hidden bg-zinc-950 relative font-sans">
                {/* Background elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="flex h-full relative z-10">
                    {/* Editor Sidebar */}
                    <div className="w-full lg:w-[400px] flex flex-col border-r border-white/5 bg-zinc-900/40 backdrop-blur-xl">
                        <div className="p-6 border-b border-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                        <FileText size={20} />
                                    </div>
                                    <h1 className="text-xl font-bold text-white tracking-tight">Resume Builder</h1>
                                </div>
                                <Button size="icon" variant="ghost" className="rounded-full text-zinc-400 hover:text-white" onClick={handleDownloadClick}>
                                    <Download size={20} />
                                </Button>
                            </div>

                            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                <NavButton active={activeSection === 'info'} onClick={() => setActiveSection('info')} icon={UserIcon} label="Intro" />
                                <NavButton active={activeSection === 'skills'} onClick={() => setActiveSection('skills')} icon={Sparkles} label="Skills" />
                                <NavButton active={activeSection === 'exp'} onClick={() => setActiveSection('exp')} icon={Building} label="Work" />
                                <NavButton active={activeSection === 'edu'} onClick={() => setActiveSection('edu')} icon={CheckCircle} label="Study" />
                                <NavButton active={activeSection === 'misc'} onClick={() => setActiveSection('misc')} icon={Gem} label="Misc" />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                            {activeSection === 'info' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="space-y-4">
                                        <SectionHeader title="Theme Color" color="#ec4899" />
                                        <div className="grid grid-cols-5 gap-3">
                                            {colorOptions.map((color) => (
                                                <button
                                                    key={color.name}
                                                    onClick={() => setResumeData({ ...resumeData, themeColor: color.hex })}
                                                    className={cn(
                                                        "w-full aspect-square rounded-xl border-2 transition-all relative",
                                                        resumeData.themeColor === color.hex ? "border-primary scale-110 shadow-lg shadow-primary/20" : "border-transparent opacity-60"
                                                    )}
                                                    style={{ backgroundColor: color.hex }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <SectionHeader title="Personal Information" color="#3b82f6" />
                                    <div className="space-y-4">
                                        <InputItem label="Full Name" value={resumeData.personalInfo.name} onChange={(val) => handleInfoChange('name', val)} />
                                        <InputItem label="Professional Title" value={resumeData.personalInfo.profession} onChange={(val) => handleInfoChange('profession', val)} />
                                        <InputItem label="Email" value={resumeData.personalInfo.email} onChange={(val) => handleInfoChange('email', val)} type="email" />
                                        <InputItem label="Phone" value={resumeData.personalInfo.phone} onChange={(val) => handleInfoChange('phone', val)} />
                                        <InputItem label="Address/Location" value={resumeData.personalInfo.address} onChange={(val) => handleInfoChange('address', val)} />
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Professional Summary</label>
                                            <Textarea
                                                value={resumeData.personalInfo.summary}
                                                onChange={(e) => handleInfoChange('summary', e.target.value)}
                                                className="bg-zinc-800/50 border-white/5 min-h-[120px] rounded-xl text-sm focus:ring-primary/20 text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'skills' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <SectionHeader title="Technical Skills" color="#10b981" />
                                    <div className="space-y-3">
                                        {resumeData.skills.map((skill, index) => (
                                            <div key={index} className="flex items-center gap-2 group">
                                                <Input
                                                    value={skill.name}
                                                    onChange={(e) => handleSectionChange('skills', index, 'name', e.target.value)}
                                                    className="bg-zinc-800/50 border-white/5 h-11 rounded-xl text-sm text-white"
                                                />
                                                <Button variant="ghost" size="icon" onClick={() => handleRemoveItem('skills', index)} className="opacity-0 group-hover:opacity-100 text-red-400">
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button variant="outline" className="w-full border-dashed border-white/10 text-zinc-400 h-11" onClick={() => handleAddItem('skills')}>
                                            <PlusCircle className="mr-2" size={16} /> Add Skill
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'exp' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <SectionHeader title="Work Experience" color="#f59e0b" />
                                    <div className="space-y-4">
                                        {resumeData.experience.map((exp, index) => (
                                            <div key={index} className="p-5 bg-zinc-800/30 border border-white/5 rounded-[1.5rem] space-y-4 relative group">
                                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400" onClick={() => handleRemoveItem('experience', index)}>
                                                    <Trash2 size={16} />
                                                </Button>
                                                <InputItem label="Company" value={exp.company} onChange={(v) => handleSectionChange('experience', index, 'company', v)} />
                                                <InputItem label="Role" value={exp.role} onChange={(v) => handleSectionChange('experience', index, 'role', v)} />
                                                <InputItem label="Duration" value={exp.duration} onChange={(v) => handleSectionChange('experience', index, 'duration', v)} />
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Responsibilities</label>
                                                    <Textarea value={exp.description} onChange={(e) => handleSectionChange('experience', index, 'description', e.target.value)} className="bg-zinc-800/50 border-white/5 text-sm rounded-xl min-h-[100px] text-white" />
                                                </div>
                                            </div>
                                        ))}
                                        <Button variant="outline" className="w-full border-dashed border-white/10 text-zinc-400 h-12 rounded-xl" onClick={() => handleAddItem('experience')}>
                                            <PlusCircle className="mr-2" size={16} /> Add Role
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'edu' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <SectionHeader title="Education" color="#8b5cf6" />
                                    <div className="space-y-4">
                                        {resumeData.education.map((edu, index) => (
                                            <div key={index} className="p-5 bg-zinc-800/30 border border-white/5 rounded-[1.5rem] space-y-4 relative group">
                                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400" onClick={() => handleRemoveItem('education', index)}>
                                                    <Trash2 size={16} />
                                                </Button>
                                                <InputItem label="Institution" value={edu.institution} onChange={(v) => handleSectionChange('education', index, 'institution', v)} />
                                                <InputItem label="Degree" value={edu.degree} onChange={(v) => handleSectionChange('education', index, 'degree', v)} />
                                                <InputItem label="Year" value={edu.year} onChange={(v) => handleSectionChange('education', index, 'year', v)} />
                                            </div>
                                        ))}
                                        <Button variant="outline" className="w-full border-dashed border-white/10 text-zinc-400 h-12 rounded-xl" onClick={() => handleAddItem('education')}>
                                            <PlusCircle className="mr-2" size={16} /> Add Study
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'misc' && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    {/* Online Presence */}
                                    <div className="space-y-4">
                                        <SectionHeader title="Online Presence" color="#3b82f6" />
                                        <div className="space-y-4">
                                            <InputItem label="LinkedIn" value={resumeData.personalInfo.linkedin} onChange={(v) => handleInfoChange('linkedin', v)} />
                                            <InputItem label="GitHub" value={resumeData.personalInfo.github} onChange={(v) => handleInfoChange('github', v)} />
                                            <InputItem label="Website" value={resumeData.personalInfo.website} onChange={(v) => handleInfoChange('website', v)} />
                                        </div>
                                    </div>

                                    {/* Languages */}
                                    <div className="space-y-4">
                                        <SectionHeader title="Languages" color="#10b981" />
                                        <div className="space-y-4">
                                            {resumeData.languages.map((lang, index) => (
                                                <div key={index} className="p-5 bg-zinc-800/30 border border-white/5 rounded-[1.5rem] space-y-4 relative group">
                                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400" onClick={() => handleRemoveItem('languages', index)}>
                                                        <Trash2 size={16} />
                                                    </Button>
                                                    <InputItem label="Language" value={lang.name} onChange={(v) => handleSectionChange('languages', index, 'name', v)} />
                                                    <InputItem label="Proficiency (e.g. Native)" value={lang.proficiency} onChange={(v) => handleSectionChange('languages', index, 'proficiency', v)} />
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                                            <span>Level</span>
                                                            <span className="text-primary">{lang.level}%</span>
                                                        </div>
                                                        <Slider
                                                            value={[lang.level]}
                                                            max={100}
                                                            step={1}
                                                            onValueChange={(v) => handleSectionChange('languages', index, 'level', v[0])}
                                                            className="py-2"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            <Button variant="outline" className="w-full border-dashed border-white/10 text-zinc-400 h-11" onClick={() => handleAddItem('languages')}>
                                                <PlusCircle className="mr-2" size={16} /> Add Language
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Hobbies / Interests */}
                                    <div className="space-y-4">
                                        <SectionHeader title="Interests" color="#f472b6" />
                                        <div className="space-y-3">
                                            {resumeData.hobbies.map((hobby, index) => (
                                                <div key={index} className="flex items-center gap-2 group">
                                                    <Input
                                                        value={hobby.name}
                                                        onChange={(e) => handleSectionChange('hobbies', index, 'name', e.target.value)}
                                                        className="bg-zinc-800/50 border-white/5 h-11 rounded-xl text-sm text-white"
                                                        placeholder="e.g. Photography"
                                                    />
                                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem('hobbies', index)} className="opacity-0 group-hover:opacity-100 text-red-400">
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button variant="outline" className="w-full border-dashed border-white/10 text-zinc-400 h-11" onClick={() => handleAddItem('hobbies')}>
                                                <PlusCircle className="mr-2" size={16} /> Add Interest
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preview Panel */}
                    <div className="flex-1 overflow-y-auto p-12 bg-[#020617] relative group">
                        <div className="absolute inset-0 bg-dot-pattern opacity-[0.05]" />
                        <div className="max-w-[210mm] mx-auto relative perspective-1000">
                            <motion.div
                                layout
                                className="w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-sm ring-1 ring-white/10"
                                style={{ aspectRatio: '1 / 1.414' }}
                            >
                                <ResumePreview resumeData={resumeData} ref={resumePreviewRef} />
                            </motion.div>

                            {/* Action HUD */}
                            <div className="absolute top-0 right-[-80px] flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <HUDButton icon={Download} onClick={handleDownloadClick} />
                                <HUDButton icon={Wand2} onClick={handleDownloadClick} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Dialog open={isDownloadModalOpen} onOpenChange={setIsDownloadModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-2xl"><Sparkles className="w-6 h-6 text-primary" />Enhance Your Resume?</DialogTitle>
                        <DialogDescription>
                            Would you like our AI to review and improve your resume's content before you download it?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="my-6 space-y-4">
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full justify-start h-auto py-3"
                            onClick={() => startDownload(resumeData)}
                            disabled={isDownloading || isEnhancing}
                        >
                            <Download className="mr-4 w-5 h-5" />
                            <div>
                                <p className="font-semibold text-base">Download As Is</p>
                                <p className="text-sm text-muted-foreground text-left">Download the PDF with your current content.</p>
                            </div>
                        </Button>
                        <Button
                            size="lg"
                            className="w-full justify-start h-auto py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:opacity-90"
                            onClick={handleEnhanceAndDownload}
                            disabled={isDownloading || isEnhancing}
                        >
                            {isEnhancing ? <Loader2 className="mr-4 w-5 h-5 animate-spin" /> : <Wand2 className="mr-4 w-5 h-5" />}
                            <div>
                                <p className="font-semibold text-base">Enhance with AI & Download</p>
                                <p className="text-sm text-white/80 text-left">Let our AI rewrite your resume for maximum impact.</p>
                            </div>
                        </Button>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
// --- Sub-components for cleaned up UI ---
function NavButton({ active, icon: Icon, label, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center min-w-[64px] py-2 px-1 rounded-xl transition-all gap-1 border border-transparent",
                active ? "bg-white/5 border-white/10 text-primary shadow-xl" : "text-zinc-500 hover:text-zinc-300"
            )}
        >
            <Icon size={18} className={active ? "scale-110" : ""} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        </button>
    );
}

function SectionHeader({ title, color }: { title: string, color: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: color }} />
            <h3 className="text-sm font-bold text-white uppercase tracking-widest leading-none">{title}</h3>
        </div>
    );
}

function InputItem({ label, value, onChange, type = "text" }: { label: string, value: string, onChange: (v: string) => void, type?: string }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">{label}</label>
            <Input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="bg-zinc-800/50 border-white/5 h-11 rounded-xl text-sm focus:ring-primary/20 text-white"
            />
        </div>
    );
}

function HUDButton({ icon: Icon, onClick }: { icon: any, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-2xl"
        >
            <Icon size={20} />
        </button>
    );
}
