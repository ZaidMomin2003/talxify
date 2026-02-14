
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { LifeBuoy, Send } from "lucide-react";

const supportFormSchema = z.object({
    name: z.string().min(1, "Name is required."),
    email: z.string().email("Please enter a valid email address."),
    whatsapp: z.string().optional(),
    issue: z.enum(["billing", "technical", "feedback", "general"]),
    description: z.string().min(10, "Please provide a detailed description (min. 10 characters)."),
});
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { Headphones, Mail, MessageSquare, Clock } from "lucide-react";

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
};

export default function SupportPage() {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof supportFormSchema>>({
        resolver: zodResolver(supportFormSchema),
        defaultValues: {
            name: "",
            email: "",
            whatsapp: "",
            issue: "general",
            description: "",
        },
    });

    function onSubmit(values: z.infer<typeof supportFormSchema>) {
        console.log(values);
        toast({
            title: "Request Submitted",
            description: "Thank you for reaching out! We have received your request and will get back to you shortly.",
        });
        form.reset();
    }

    return (
        <main className="flex-1 p-4 sm:p-6 lg:p-10 bg-background/50 relative overflow-x-hidden min-h-screen">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

            <motion.div
                className="max-w-5xl mx-auto space-y-8 relative z-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header Section */}
                <div className="text-center space-y-4">
                    <motion.div variants={itemVariants} className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 border border-primary/20 mb-2">
                        <LifeBuoy className="h-8 w-8 text-primary" />
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-black tracking-tight italic uppercase text-white leading-none">
                        Support <span className="text-primary">Center</span>
                    </motion.h1>
                    <motion.p variants={itemVariants} className="max-w-2xl mx-auto text-muted-foreground text-lg">
                        Have questions or feedback? Our team is dedicated to providing you with the best experience possible.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Info Column */}
                    <div className="lg:col-span-4 space-y-6">
                        <motion.div variants={itemVariants} className="p-6 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 shrink-0">
                                    <Clock className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white uppercase text-[10px] tracking-widest mb-1">Response Time</h3>
                                    <p className="text-sm text-muted-foreground">Typically within 24 hours.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 shrink-0">
                                    <Mail className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white uppercase text-[10px] tracking-widest mb-1">Email Us Directly</h3>
                                    <p className="text-sm text-primary font-medium">hii@talxify.space</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4">
                                    <p className="text-xs text-muted-foreground italic leading-relaxed">
                                        "We value every piece of feedback as it helps us build a better tool for your career journey."
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="p-6 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl hidden lg:block">
                            <h3 className="font-black text-white uppercase italic tracking-tighter text-xl mb-4">Navigator</h3>
                            <ul className="space-y-3">
                                {[
                                    { name: 'Resume Builder', href: '/dashboard/resume-builder' },
                                    { name: 'Interview Practice', href: '/dashboard/interview' },
                                    { name: 'AI Question Generator', href: '/dashboard/interview-questions-generator' },
                                    { name: 'My Performance', href: '/dashboard/profile' }
                                ].map(link => (
                                    <li key={link.name}>
                                        <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors" />
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>

                    {/* Form Column */}
                    <motion.div variants={itemVariants} className="lg:col-span-8">
                        <Card className="rounded-3xl border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden border">
                            <CardHeader className="p-8 border-b border-white/5 bg-white/5">
                                <CardTitle className="text-2xl font-black uppercase tracking-tight italic">Send a Message</CardTitle>
                                <CardDescription>Fill out the details and our team will get in touch.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g., John Doe" {...field} className="bg-black/20 border-white/5 h-12 focus:ring-primary/20 rounded-xl" />
                                                        </FormControl>
                                                        <FormMessage className="text-[10px] font-bold" />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</FormLabel>
                                                        <FormControl>
                                                            <Input type="email" placeholder="e.g., john@example.com" {...field} className="bg-black/20 border-white/5 h-12 focus:ring-primary/20 rounded-xl" />
                                                        </FormControl>
                                                        <FormMessage className="text-[10px] font-bold" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="whatsapp"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">WhatsApp (Optional)</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="+1 234..." {...field} className="bg-black/20 border-white/5 h-12 focus:ring-primary/20 rounded-xl" />
                                                        </FormControl>
                                                        <FormMessage className="text-[10px] font-bold" />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="issue"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Related Issue</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="bg-black/20 border-white/5 h-12 focus:ring-primary/20 rounded-xl">
                                                                    <SelectValue placeholder="Select issue type" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="bg-secondary/90 backdrop-blur-xl border-white/10">
                                                                <SelectItem value="billing">Billing Issue</SelectItem>
                                                                <SelectItem value="technical">Technical Problem</SelectItem>
                                                                <SelectItem value="feedback">Feedback & Suggestions</SelectItem>
                                                                <SelectItem value="general">General Inquiry</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage className="text-[10px] font-bold" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Detailed Description</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Please tell us more about your request..."
                                                            className="min-h-[120px] bg-black/20 border-white/5 focus:ring-primary/20 rounded-xl resize-none"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px] font-bold" />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" size="lg" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs italic shadow-lg shadow-primary/20 group hover:scale-[1.02] active:scale-[0.98] transition-all">
                                            Submit Request
                                            <Send className="ml-3 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>
        </main>
    )
}
