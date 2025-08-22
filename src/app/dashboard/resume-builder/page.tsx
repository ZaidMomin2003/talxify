
'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useReactToPrint } from 'react-to-print';
import { FileText, PlusCircle, Trash2, Mail, Phone, Linkedin, Github, Globe, Download } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

// Simplified types for resume
type ResumeExperience = { company: string; role: string; duration: string; description: string; };
type ResumeEducation = { institution: string; degree: string; year: string; };
type ResumeSkill = { name: string; };
type ResumeLanguage = { name: string; proficiency: string; level: number; };
type ResumeHobby = { name: string; };


const initialResumeState = {
    personalInfo: {
        name: 'Diya Agarwal',
        profession: 'Retail Sales Professional',
        email: 'd.agarwal@sample.in',
        phone: '+91 11 5555 3345',
        address: 'New Delhi, India 110034',
        linkedin: 'linkedin.com/in/diya-agarwal',
        github: 'github.com/diya-agarwal',
        website: 'diya-agarwal.dev',
        summary: 'Customer-focused Retail Sales professional with solid understanding of retail dynamics, marketing and customer service. Offering 5 years of experience providing quality product recommendations and solutions to meet customer needs and exceed expectations. Demonstrated record of exceeding revenue targets by leveraging communication skills and sales expertise.'
    },
    experience: [
        { company: 'ZARA', role: 'Retail Sales Associate', duration: '02/2017 - Current', description: '- Increased monthly sales 10% by effectively upselling and cross-selling products to maximize profitability.\n- Prevented store losses by leveraging awareness, attention to detail, and integrity to identify and investigate concerns.\n- Processed payments and maintained accurate drawers to meet financial targets.' },
        { company: "Dunkin' Donuts", role: 'Barista', duration: '03/2015 - 01/2017', description: '- Upsold seasonal drinks and pastries, boosting average store sales by ₹1500 weekly.\n- Managed morning rush of over 300 customers daily with efficient, levelheaded customer service.\n- Trained entire staff of 15 baristas in new smoothie program offerings and procedures.' }
    ],
    education: [
        { institution: 'Oxford Software Institute & Oxford School Of English', degree: 'Diploma In Financial Accounting', year: '2016' }
    ],
    skills: [
        { name: 'Cash register operation' }, { name: 'POS system operation' }, { name: 'Sales expertise' }, { name: 'Teamwork' }, { name: 'Inventory management' }
    ],
    languages: [
        { name: 'Hindi', proficiency: 'Native Speaker', level: 100 },
        { name: 'English', proficiency: 'Proficient', level: 85 },
        { name: 'Bengali', proficiency: 'Upper-intermediate', level: 60 },
    ],
    hobbies: [
        { name: 'Recreational Football League' }, { name: 'Team captain' }, { name: 'Red Cross Volunteer' }
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
        setResumeData(prev => ({ ...prev, [section]: [...prev[section], newItem]}));
    };
    
    const handleRemoveItem = (section: 'experience' | 'education' | 'skills' | 'languages' | 'hobbies', index: number) => {
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
                             <Input placeholder="Address" value={resumeData.personalInfo.address} onChange={(e) => handleInfoChange('address', e.target.value)} />
                            <Textarea placeholder="Professional Summary" value={resumeData.personalInfo.summary} onChange={(e) => handleInfoChange('summary', e.target.value)} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {resumeData.skills.map((skill, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input placeholder="e.g., React" value={skill.name} onChange={(e) => handleSectionChange('skills', index, 'name', e.target.value)} />
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem('skills', index)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                                </div>
                            ))}
                            <Button variant="outline" className="w-full" onClick={() => handleAddItem('skills')}><PlusCircle className="mr-2"/> Add Skill</Button>
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
                        <CardHeader><CardTitle>Languages</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {resumeData.languages.map((lang, index) => (
                                <div key={index} className="p-4 border rounded-lg space-y-3 relative">
                                    <Button variant="ghost" size="icon" className="absolute top-1 right-1" onClick={() => handleRemoveItem('languages', index)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                                    <Input placeholder="Language" value={lang.name} onChange={(e) => handleSectionChange('languages', index, 'name', e.target.value)} />
                                    <Input placeholder="Proficiency (e.g., Proficient)" value={lang.proficiency} onChange={(e) => handleSectionChange('languages', index, 'proficiency', e.target.value)} />
                                    <Slider defaultValue={[lang.level]} max={100} step={1} onValueChange={(value) => handleSectionChange('languages', index, 'level', value[0])} />
                                </div>
                            ))}
                            <Button variant="outline" className="w-full" onClick={() => handleAddItem('languages')}><PlusCircle className="mr-2"/> Add Language</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Hobbies & Interests</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {resumeData.hobbies.map((hobby, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input placeholder="e.g., Recreational Football" value={hobby.name} onChange={(e) => handleSectionChange('hobbies', index, 'name', e.target.value)} />
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem('hobbies', index)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                                </div>
                            ))}
                            <Button variant="outline" className="w-full" onClick={() => handleAddItem('hobbies')}><PlusCircle className="mr-2"/> Add Hobby</Button>
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
                            margin: 0;
                        }
                    `}</style>
                    <div ref={resumePreviewRef} className="bg-white text-black shadow-lg font-sans w-full mx-auto" style={{ width: '210mm', minHeight: '297mm' }}>
                        <div className="flex">
                            {/* Left Column */}
                            <div className="bg-[#374151] text-white p-8" style={{ width: '35%' }}>
                                <div className="text-sm space-y-8">
                                    <div className="space-y-1">
                                        <p>{resumeData.personalInfo.email}</p>
                                        <p>{resumeData.personalInfo.phone}</p>
                                        <p>{resumeData.personalInfo.address}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-2">Skills</h3>
                                        <ul className="list-disc list-inside text-sm space-y-1">
                                            {resumeData.skills.map(skill => <li key={skill.name}>{skill.name}</li>)}
                                        </ul>
                                    </div>
                                     <div>
                                        <h3 className="font-bold text-lg mb-2">Education And Training</h3>
                                        {resumeData.education.map((edu, i) => (
                                            <div key={i} className="text-sm">
                                                <p className="font-bold">{edu.year}</p>
                                                <p>{edu.degree}:</p>
                                                <p className="font-bold">{edu.institution}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-2">Languages</h3>
                                        {resumeData.languages.map((lang, i) => (
                                            <div key={i} className="text-sm mb-2">
                                                <div className="flex justify-between items-center">
                                                    <span>{lang.name}:</span>
                                                    <span className="text-xs font-semibold">{lang.proficiency}</span>
                                                </div>
                                                <div className="w-full bg-gray-600 rounded-full h-1.5 mt-1">
                                                    <div className="bg-gray-300 h-1.5 rounded-full" style={{ width: `${lang.level}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-2">Interests And Hobbies</h3>
                                         <ul className="list-disc list-inside text-sm space-y-1">
                                            {resumeData.hobbies.map(hobby => <li key={hobby.name}>{hobby.name}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            {/* Right Column */}
                             <div className="p-8" style={{ width: '65%' }}>
                                <h1 className="text-5xl font-bold mb-2">{resumeData.personalInfo.name}</h1>
                                <div className="border-l-4 border-gray-800 pl-4">
                                    <h2 className="text-xl font-bold tracking-widest text-gray-700 mb-4">SUMMARY</h2>
                                    <p className="text-sm text-gray-600 leading-relaxed">{resumeData.personalInfo.summary}</p>
                                
                                    <h2 className="text-xl font-bold tracking-widest text-gray-700 mt-8 mb-4">EXPERIENCE</h2>
                                    <div className="space-y-6">
                                    {resumeData.experience.map((exp, i) =>(
                                        <div key={i}>
                                            <h3 className="font-bold text-base">{exp.company} - <span className="font-normal">{exp.role}</span></h3>
                                            <p className="text-xs text-gray-500 font-semibold mb-1">{exp.duration}</p>
                                            <ul className="list-disc list-inside text-sm text-gray-600 leading-snug space-y-1">
                                                {exp.description.split('\n').map((item, key) => item && <li key={key}>{item.replace(/^- /, '')}</li>)}
                                            </ul>
                                        </div>
                                    ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );

    