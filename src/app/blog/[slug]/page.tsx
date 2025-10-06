
import { blogPosts } from '@/lib/blog-data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import LandingHeader from '../../landing-header';
import LandingFooter from '../../landing-footer';
import { Calendar, User, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: `${post.title} | Talxify Blog`,
    description: post.description,
    openGraph: {
        title: post.title,
        description: post.description,
        images: [
            {
                url: post.imageUrl,
                width: 1200,
                height: 630,
                alt: post.title,
            },
        ],
    },
  }
}

export async function generateStaticParams() {
    return blogPosts.map((post) => ({
        slug: post.slug,
    }));
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = blogPosts.filter(p => p.slug !== post.slug && p.tags.some(tag => post.tags.includes(tag))).slice(0, 2);

  return (
    <div className="bg-background min-h-screen">
      <LandingHeader />
      <main className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <article>
          <header className="py-8 md:py-12">
             <div className="relative w-full h-56 md:h-72 rounded-xl overflow-hidden mb-8 shadow-lg border">
                <Image 
                    src={post.imageUrl} 
                    alt={post.title}
                    layout="fill"
                    objectFit="cover"
                    priority
                    data-ai-hint="abstract blog image"
                    className="opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold font-headline tracking-tighter mb-4">{post.title}</h1>
            <div className="flex items-center text-muted-foreground space-x-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <time dateTime={new Date(post.date).toISOString()}>{post.date}</time>
              </div>
            </div>
          </header>

          <div 
            className="prose prose-lg dark:prose-invert max-w-none prose-blockquote:border-primary prose-blockquote:text-muted-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-foreground"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {relatedPosts.length > 0 && (
            <aside className="mt-24">
                <h2 className="text-3xl font-bold font-headline mb-8 text-center">Related Reading</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    {relatedPosts.map(related => (
                        <Link href={`/blog/${related.slug}`} key={related.slug} className="group block">
                            <Card className="overflow-hidden shadow-lg h-full flex flex-col hover:border-primary transition-all duration-300 transform hover:-translate-y-1">
                                <div className="relative w-full h-40">
                                     <Image 
                                        src={related.imageUrl} 
                                        alt={related.title}
                                        layout="fill"
                                        objectFit="cover"
                                        className="transition-transform duration-300 group-hover:scale-105"
                                        data-ai-hint="abstract blog image"
                                    />
                                </div>
                                <CardContent className="p-6">
                                     <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{related.title}</h3>
                                     <p className="text-sm text-muted-foreground">{related.description}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </aside>
        )}
      </main>
      <LandingFooter />
    </div>
  );
}
