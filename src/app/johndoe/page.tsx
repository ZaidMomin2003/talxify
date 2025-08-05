
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Github, Linkedin, Instagram, Mail, Phone, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

export default function PortfolioPreviewPage() {
    const portfolio = {
        name: 'John Doe',
        profession: 'Senior Software Engineer',
        bio: 'A passionate software engineer with a love for building scalable and user-friendly web applications. I thrive in collaborative environments and am always eager to learn new technologies.',
        email: 'john.doe@example.com',
        phone: '+1 234 567 890',
        socials: {
            github: 'https://github.com/johndoe',
            linkedin: 'https://linkedin.com/in/johndoe',
            instagram: 'https://instagram.com/johndoe',
        },
        projects: [
            { title: 'Talxify - AI Interview Coach', description: 'An AI-powered platform to help users practice for technical interviews with real-time feedback and coding assistance.', link: 'https://talxify.ai' },
            { title: 'E-commerce Platform', description: 'Built a full-featured e-commerce site with Next.js, Stripe, and Sanity.io, focusing on performance and user experience.', link: '#' },
        ],
        certificates: [
            { name: 'Google Cloud Certified - Professional Cloud Architect', body: 'Google Cloud', date: '2023-05' },
            { name: 'Certified Kubernetes Administrator (CKA)', body: 'The Linux Foundation', date: '2022-11' },
        ],
        achievements: [
            "Speaker at React Conf 2023 on 'The Future of Web Development'.",
            "Won 1st place in the 2022 TechCrunch Disrupt Hackathon.",
            "Contributed to several open-source projects, including Next.js and Tailwind CSS."
        ],
        testimonials: [
            { testimonial: 'John is a brilliant engineer who brings not only technical expertise but also a creative and collaborative spirit to every project. He was instrumental in our latest launch.', author: 'Jane Smith, CEO of Tech Innovations' },
            { testimonial: 'I had the pleasure of mentoring John early in his career. His growth has been phenomenal, and he has a rare talent for simplifying complex problems.', author: 'Sam Wilson, Principal Engineer at Innovate LLC' },
        ],
        faqs: [
            { question: 'What are you most passionate about in software development?', answer: 'I am most passionate about creating elegant solutions to complex problems and building products that have a meaningful impact on people\'s lives. I love the blend of creativity and logic that software engineering requires.' },
            { question: 'What is your preferred tech stack?', answer: 'I am most experienced with the React/Next.js ecosystem, TypeScript, Node.js, and PostgreSQL. However, I am a firm believer in using the right tool for the job and am always open to learning new technologies.' },
        ],
    };

    return (
        <div className="bg-background min-h-screen">
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                    <Link href="#" className="flex items-center gap-2">
                        <Avatar>
                            <AvatarImage src="https://placehold.co/40x40.png" alt={portfolio.name} data-ai-hint="person avatar" />
                            <AvatarFallback>{portfolio.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="text-xl font-bold">{portfolio.name}</span>
                    </Link>
                    <Button asChild>
                        <a href={`mailto:${portfolio.email}`}>Contact Me</a>
                    </Button>
                </div>
            </header>

            <main className="container mx-auto p-4 md:p-6 lg:p-8 space-y-12">
                {/* Hero Section */}
                <section className="text-center py-16">
                    <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-primary shadow-lg">
                        <AvatarImage src="https://placehold.co/128x128.png" alt={portfolio.name} data-ai-hint="person avatar" />
                        <AvatarFallback>{portfolio.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <h1 className="text-5xl font-headline font-bold mb-2">{portfolio.name}</h1>
                    <p className="text-2xl text-primary font-semibold mb-4">{portfolio.profession}</p>
                    <p className="max-w-3xl mx-auto text-lg text-muted-foreground mb-6">{portfolio.bio}</p>
                    <div className="flex justify-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <a href={portfolio.socials.github} target="_blank" rel="noopener noreferrer"><Github /></a>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                            <a href={portfolio.socials.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin /></a>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                            <a href={portfolio.socials.instagram} target="_blank" rel="noopener noreferrer"><Instagram /></a>
                        </Button>
                    </div>
                </section>
                
                {/* Contact Section */}
                <section id="contact" className="grid md:grid-cols-2 gap-8 items-center bg-muted/50 p-8 rounded-lg">
                    <div>
                        <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
                        <p className="text-muted-foreground mb-6">I'm currently open to new opportunities. Feel free to reach out!</p>
                    </div>
                    <div className="space-y-4">
                        <a href={`mailto:${portfolio.email}`} className="flex items-center gap-4 p-4 rounded-lg hover:bg-background transition-colors">
                            <Mail className="w-6 h-6 text-primary" />
                            <span>{portfolio.email}</span>
                        </a>
                        <div className="flex items-center gap-4 p-4 rounded-lg">
                            <Phone className="w-6 h-6 text-primary" />
                            <span>{portfolio.phone}</span>
                        </div>
                    </div>
                </section>

                {/* Projects Section */}
                <section id="projects">
                    <h2 className="text-3xl font-bold mb-6 text-center">My Projects</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {portfolio.projects.map((project, index) => (
                            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        {project.title}
                                        <a href={project.link} target="_blank" rel="noopener noreferrer">
                                            <LinkIcon className="w-5 h-5 text-muted-foreground hover:text-primary" />
                                        </a>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{project.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Certificates Section */}
                    <section id="certificates">
                        <h2 className="text-3xl font-bold mb-6">Certificates</h2>
                        <div className="space-y-4">
                            {portfolio.certificates.map((cert, index) => (
                                <Card key={index} className="p-4">
                                    <p className="font-semibold">{cert.name}</p>
                                    <p className="text-sm text-muted-foreground">{cert.body} - {cert.date}</p>
                                </Card>
                            ))}
                        </div>
                    </section>
                    {/* Achievements Section */}
                    <section id="achievements">
                        <h2 className="text-3xl font-bold mb-6">Achievements</h2>
                        <ul className="space-y-2 list-disc list-inside">
                            {portfolio.achievements.map((ach, index) => (
                                <li key={index} className="text-muted-foreground">{ach}</li>
                            ))}
                        </ul>
                    </section>
                </div>


                {/* Testimonials Section */}
                <section id="testimonials" className="bg-muted/50 p-8 rounded-lg">
                    <h2 className="text-3xl font-bold mb-6 text-center">Testimonials</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {portfolio.testimonials.map((test, index) => (
                             <blockquote key={index} className="p-6 bg-background rounded-lg shadow">
                                <p className="italic">"{test.testimonial}"</p>
                                <footer className="mt-4 text-right font-semibold"> - {test.author}</footer>
                            </blockquote>
                        ))}
                    </div>
                </section>

                {/* FAQs Section */}
                <section id="faqs">
                    <h2 className="text-3xl font-bold mb-6 text-center">FAQs</h2>
                    <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
                        {portfolio.faqs.map((faq, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger>{faq.question}</AccordionTrigger>
                                <AccordionContent>
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </section>

            </main>
            <footer className="text-center p-6 border-t mt-12">
                <p className="text-muted-foreground">© {new Date().getFullYear()} {portfolio.name}. All rights reserved.</p>
            </footer>
        </div>
    );
}