'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FlaskConical } from "lucide-react";

export default function DraftPage() {
  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <FlaskConical className="h-6 w-6" />
              Draft Page
            </CardTitle>
            <CardDescription>
              This is a blank draft page. You can add new components and features here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-border">
              <p className="text-muted-foreground">Draft content goes here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
