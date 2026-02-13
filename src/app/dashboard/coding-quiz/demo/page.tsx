
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import CodeEditor from '@/components/ui/code-editor';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { CodingQuestion } from '@/ai/flows/generate-coding-questions';

const demoQuestion: CodingQuestion = {
    questionText: `
        <p>You are given a function <code>findDuplicates(nums)</code> that takes an array of integers <code>nums</code> as input. Each integer in the array is between 1 and n (inclusive), where n is the length of the array. Each integer appears once or twice.</p>
        <p>Your task is to write the body of the function to return an array of all the integers that appear twice.</p>
        <strong>Example:</strong>
        <ul>
            <li><strong>Input:</strong> <code>nums = [4,3,2,7,8,2,3,1]</code></li>
            <li><strong>Output:</strong> <code>[2,3]</code></li>
        </ul>
        <strong>Constraints:</strong>
        <ul>
            <li>You must not modify the input array.</li>
            <li>Your algorithm should run in O(n) time complexity.</li>
            <li>Your algorithm should use O(1) extra space.</li>
        </ul>
    `,
};


export default function CodingQuizDemoPage() {
  const router = useRouter();
  const [userAnswer, setUserAnswer] = useState('// Your code here');

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
            <Button variant="outline" size="sm" onClick={() => router.back()}><ChevronLeft className="mr-2"/> Back</Button>
            <div className="text-center my-2">
                <h1 className="font-headline text-2xl font-bold">Quiz UI Demo</h1>
                <p className="text-muted-foreground text-sm">This is a demo page for styling quiz questions.</p>
            </div>
            <Progress value={33} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
                Question 1 of 3 (Sample)
            </p>
        </div>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Question 1</CardTitle>
            <CardDescription className="prose dark:prose-invert max-w-none text-base">
                <div dangerouslySetInnerHTML={{ __html: demoQuestion.questionText }} />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeEditor 
                value={userAnswer}
                onChange={(value) => setUserAnswer(value || '')}
                language="javascript"
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Previous</Button>
            <Button>Next</Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
