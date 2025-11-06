
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/auth-context';
import PromotionalPopup from '@/components/disclaimer-dialog';
import { ThemeProvider } from '@/components/theme-provider';
import GoogleAnalytics from '@/components/google-analytics';

export const metadata: Metadata = {
  title: 'Talxify: AI-Powered Interview & Coding Prep',
  description: 'Ace your tech interviews with AI-powered mock interviews, a coding assistant, and detailed performance analytics. Land your dream job with Talxify.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head />
      <body className="antialiased bg-background text-foreground">
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <GoogleAnalytics />
              {children}
              <PromotionalPopup />
            </ThemeProvider>
          </AuthProvider>
          <Toaster />
      </body>
    </html>
  );
}
