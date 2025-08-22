
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Rocket, SearchX } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto bg-primary/10 text-primary rounded-full p-4 w-fit mb-4">
            <SearchX className="h-12 w-12" />
          </div>
          <CardTitle className="text-4xl font-bold font-headline">404 - Page Not Found</CardTitle>
          <CardDescription className="text-lg">
            Oops! The page you are looking for does not exist. It might have been moved or deleted.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Let's get you back on track. You can return to the homepage or explore one of our popular features.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go to Homepage
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/#features">
                <Rocket className="mr-2 h-4 w-4" />
                Explore Features
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
