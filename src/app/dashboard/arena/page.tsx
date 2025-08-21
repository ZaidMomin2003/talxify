
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Swords } from "lucide-react";

export default function ArenaPage() {
  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Swords /> Arena
            </CardTitle>
            <CardDescription>
              This is the Arena. The battleground for your skills. What would you like to build here?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Page content coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

    