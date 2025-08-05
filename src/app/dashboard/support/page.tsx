
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
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg">
                <CardHeader className="text-center">
                    <LifeBuoy className="mx-auto h-12 w-12 text-primary mb-4" />
                    <CardTitle className="font-headline text-4xl font-bold">Support Center</CardTitle>
                    <CardDescription className="text-lg">
                        We're here to help. Fill out the form below and we'll get back to you as soon as possible.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                        <Input placeholder="e.g., John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                        <Input type="email" placeholder="e.g., john.doe@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                             <FormField
                                control={form.control}
                                name="whatsapp"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>WhatsApp Number (Optional)</FormLabel>
                                    <FormControl>
                                    <Input placeholder="e.g., +1 234 567 890" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="issue"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Related Issue</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                            <SelectValue placeholder="Select the type of your issue" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="billing">Billing Issue</SelectItem>
                                            <SelectItem value="technical">Technical Problem</SelectItem>
                                            <SelectItem value="feedback">Feedback & Suggestions</SelectItem>
                                            <SelectItem value="general">General Inquiry</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Problem Description</FormLabel>
                                    <FormControl>
                                    <Textarea
                                        placeholder="Please describe your issue in detail..."
                                        className="min-h-[150px]"
                                        {...field}
                                    />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <div className="text-center pt-4">
                                <p className="text-sm text-muted-foreground mb-4">
                                    Your feedback is important to us and we make sure every voice is heard. We will review your request and get back to you within 24 hours.
                                </p>
                                <Button type="submit" size="lg" className="w-full sm:w-auto">
                                    Submit Request <Send className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    </main>
  )
}
