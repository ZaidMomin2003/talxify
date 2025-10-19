

import { blogPosts } from '@/lib/blog-data';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LandingHeader from '../landing-header';
import LandingFooter from '../landing-footer';
import { ArrowRight, Calendar, User } from 'lucide-react';

export default function BlogPage() {
    const latestPost = blogPosts[0];
    const otherPosts = blogPosts.slice(1);

  return (
    <div className="bg-background min-h-screen">
        <LandingHeader />
        <main className="container mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
            <header className="py-12 text-center">
                <h1 className="text-5xl font-bold font-headline tracking-tighter">The Talxify Blog</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                    Insights on career growth, interview preparation, and software engineering.
                </p>
            </header>
            
            {/* Featured Post */}
            <section className="mb-16">
                 <Link href={`/blog/${latestPost.slug}`} className="group block">
                    <Card className="grid md:grid-cols-2 overflow-hidden shadow-lg border-primary/20 hover:border-primary transition-all duration-300 transform hover:-translate-y-1">
                        <div className="relative w-full h-64 md:h-full">
                             <Image 
                                src={latestPost.imageUrl} 
                                alt={latestPost.title}
                                fill
                                style={{objectFit:"cover"}}
                                className="transition-transform duration-500 group-hover:scale-105"
                                data-ai-hint="abstract blog image"
                            />
                        </div>
                        <div className="p-8 flex flex-col justify-center">
                            <Badge variant="default" className="mb-4 w-fit">Latest Post</Badge>
                            <h2 className="text-3xl font-bold font-headline mb-4 group-hover:text-primary transition-colors">{latestPost.title}</h2>
                            <p className="text-muted-foreground mb-6">{latestPost.description}</p>
                            <div className="flex items-center text-sm text-muted-foreground space-x-4">
                                <span className="flex items-center gap-2"><User className="w-4 h-4" /> {latestPost.author}</span>
                                <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {latestPost.date}</span>
                            </div>
                        </div>
                    </Card>
                </Link>
            </section>

            {/* Grid of Other Posts */}
            <section>
                 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {otherPosts.map((post) => (
                        <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                             <Card className="overflow-hidden shadow-lg h-full flex flex-col hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1">
                                <div className="relative w-full h-48">
                                     <Image 
                                        src={post.imageUrl} 
                                        alt={post.title}
                                        fill
                                        style={{objectFit:"cover"}}
                                        className="transition-transform duration-500 group-hover:scale-105"
                                        data-ai-hint="abstract blog image"
                                    />
                                </div>
                                <CardHeader>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {post.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                                    </div>
                                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{post.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <CardDescription>{post.description}</CardDescription>
                                </CardContent>
                                <CardFooter>
                                     <div className="flex items-center text-sm text-muted-foreground space-x-4">
                                        <span className="flex items-center gap-2"><User className="w-4 h-4" /> {post.author}</span>
                                        <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {post.date}</span>
                                    </div>
                                </CardFooter>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>
        </main>
        <LandingFooter />
    </div>
  );
}
