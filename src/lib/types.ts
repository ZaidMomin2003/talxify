
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
export type StoredActivity = QuizResult | InterviewActivity;

export interface BaseActivity {
    id: string;
    type: 'quiz' | 'interview';
    timestamp: string;
    details: {
        topic: string;
        [key: string]: any;
    };
}


// A more specific type for completed quiz results
export interface QuizResult extends BaseActivity {
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

// A specific type for initiated interviews
export interface InterviewActivity extends BaseActivity {
    type: 'interview';
    details: {
        topic: string;
        role: string;
    }
}
