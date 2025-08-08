
import type { AnswerAnalysis } from "@/ai/flows/analyze-coding-answers";
import type { QuizState } from "@/app/dashboard/coding-quiz/quiz/page";

export interface SignUpForm {
    name: string;
    email: string;
    password: string
}

export interface SignInForm {
    email: string;
    password: string
}

// A generic type for any activity stored in localStorage
export type StoredActivity = {
    id: string;
    type: 'quiz' | 'interview';
    timestamp: string;
    details: {
        topic: string;
        [key: string]: any;
    };
};

// A more specific type for completed quiz results
export interface QuizResult extends StoredActivity {
  type: 'quiz';
  quizState: QuizState;
  analysis: AnswerAnalysis[];
  topics: string; // for filtering, duplicated in details
  difficulty: string; // for filtering, duplicated in details
  details: {
    topic: string;
    difficulty: string;
    score: string | 'Pending';
  }
}
