
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mail, MapPin, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingContact() {
  return (
    <section className="bg-background py-16 sm:py-24">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-12 flex flex-col items-center">
          <Badge
            variant="outline"
            className="border-primary mb-4 px-3 py-1 text-xs font-medium tracking-wider uppercase"
          >
            Contact Us
          </Badge>
          <h2 className="text-foreground mb-6 text-center text-4xl font-bold tracking-tight md:text-5xl">
            Get in Touch
          </h2>
          <p className="text-muted-foreground max-w-2xl text-center">
            Have a question or want to learn more? We'd love to hear from you.
            Fill out the form below or reach out to us directly.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 text-primary mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Email</h3>
                <p className="text-muted-foreground">
                  For general inquiries and support.
                </p>
                <a
                  href="mailto:hii@talxify.space"
                  className="text-primary font-medium hover:underline"
                >
                  hii@talxify.space
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 text-primary mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Phone</h3>
                <p className="text-muted-foreground">
                  Our support team is available Mon-Fri, 9am-5pm.
                </p>
                <a
                  href="tel:+918431326909"
                  className="text-primary font-medium hover:underline"
                >
                  +91 8431326909
                </a>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-card/50 rounded-xl border p-6 md:p-8"
          >
            <form action="#" className="space-y-6">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium">
                  Full Name
                </label>
                <Input type="text" id="name" placeholder="John Doe" required />
              </div>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium">
                  Email
                </label>
                <Input
                  type="email"
                  id="email"
                  placeholder="john.doe@example.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-medium">
                  Message
                </label>
                <Textarea
                  id="message"
                  rows={6}
                  placeholder="How can we help you?"
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Send Message
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
