
'use client';

import InterviewUI from "@/components/InterviewUI";

export default function DraftPage() {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500">
          Error: NEXT_PUBLIC_GEMINI_API_KEY is not set in the environment.
        </p>
      </div>
    );
  }

  return (
    <main>
      <InterviewUI apiKey={apiKey} />
    </main>
  );
}
