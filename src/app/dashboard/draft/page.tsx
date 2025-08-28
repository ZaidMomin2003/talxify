
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FlaskConical, Briefcase, Building, BookOpen, ArrowRight } from "lucide-react";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function DraftPage() {
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In the next step, we'll define what happens on submission.
    console.log({ role, company, topic });
  };

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <FlaskConical className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl font-headline">New Interview Pipeline</CardTitle>
            </div>
            <CardDescription>
              Provide the initial details to start building a new interview experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="role" className="flex items-center gap-2"><Briefcase className="w-4 h-4"/> Job Role</Label>
                    <Input id="role" placeholder="e.g., Senior Software Engineer" value={role} onChange={(e) => setRole(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="company" className="flex items-center gap-2"><Building className="w-4 h-4"/> Target Company</Label>
                    <Input id="company" placeholder="e.g., Google" value={company} onChange={(e) => setCompany(e.target.value)} required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="topic" className="flex items-center gap-2"><BookOpen className="w-4 h-4"/> Interview Topic</Label>
                    <Input id="topic" placeholder="e.g., System Design" value={topic} onChange={(e) => setTopic(e.target.value)} required />
                </div>
                <div className="flex justify-end pt-4">
                     <Button type="submit">
                        Next Step <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
