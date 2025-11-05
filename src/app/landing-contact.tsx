
'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SparklesCore } from '@/components/ui/sparkles';
import { Label } from '@/components/ui/label';
import { Check, Loader2, Mail, Phone } from 'lucide-react';

export default function LandingContact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const formRef = useRef(null);
  const isInView = useInView(formRef, { once: true, amount: 0.3 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Perform form submission logic here
      console.log('Form submitted:', { name, email, message });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setName('');
      setEmail('');
      setMessage('');
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-background relative w-full overflow-hidden py-16 md:py-24" id="contact">
      <div
        className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full opacity-20 blur-[120px]"
        style={{
          background: `radial-gradient(circle at center, #e60a64, transparent 70%)`,
        }}
      />
      <div
        className="absolute right-0 bottom-0 h-[300px] w-[300px] rounded-full opacity-10 blur-[100px]"
        style={{
          background: `radial-gradient(circle at center, #e60a64, transparent 70%)`,
        }}
      />

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="border-border/40 bg-secondary/20 mx-auto max-w-5xl overflow-hidden rounded-[28px] border shadow-xl backdrop-blur-sm">
           <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Form Section */}
            <div className="relative p-6 md:p-10" ref={formRef}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex w-full gap-2"
              >
                <h2 className="from-foreground to-foreground/80 mb-2 bg-gradient-to-r bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl">
                  Contact
                </h2>
                <span className="text-primary relative z-10 w-full text-4xl font-bold tracking-tight italic md:text-5xl">
                  Us
                </span>
                <SparklesCore
                  id="tsparticles"
                  background="transparent"
                  minSize={0.6}
                  maxSize={1.4}
                  particleDensity={500}
                  className="absolute inset-0 top-0 h-24 w-full"
                  particleColor="#e60a64"
                />
              </motion.div>

              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.5, delay: 0.3 }}
                onSubmit={handleSubmit}
                className="mt-8 space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message"
                    required
                    className="h-32 resize-none"
                  />
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full"
                >
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-b from-rose-500 to-rose-700 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </span>
                    ) : isSubmitted ? (
                      <span className="flex items-center justify-center">
                        <Check className="mr-2 h-4 w-4" />
                        Message Sent!
                      </span>
                    ) : (
                      <span>Send Message</span>
                    )}
                  </Button>
                </motion.div>
              </motion.form>
            </div>
            
            {/* Info Section */}
            <div className="p-6 md:p-10 text-foreground">
                <h3 className="text-3xl font-bold font-headline mb-4">Get in Touch</h3>
                <p className="text-muted-foreground mb-8">
                    Have a question or want to learn more about how Talxify can help you or your institution? We'd love to hear from you. Fill out the form or reach out to us directly.
                </p>

                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="bg-primary/10 text-primary p-3 rounded-lg mt-1">
                            <Mail className="w-5 h-5"/>
                        </div>
                        <div>
                            <p className="font-semibold">Email</p>
                            <p className="text-sm text-muted-foreground">For general inquiries and support.</p>
                            <a href="mailto:hii@talxify.space" className="text-primary font-medium hover:underline">hii@talxify.space</a>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="bg-primary/10 text-primary p-3 rounded-lg mt-1">
                            <Phone className="w-5 h-5"/>
                        </div>
                        <div>
                            <p className="font-semibold">Phone</p>
                            <p className="text-sm text-muted-foreground">Our support team is available Mon-Fri, 9am-5pm.</p>
                            <a href="tel:+918431326909" className="text-primary font-medium hover:underline">+91 8431326909</a>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
