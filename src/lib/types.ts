
import type { AnswerAnalysis } from "@/ai/flows/analyze-coding-answers";
import type { QuizState } from "@/app/dashboard/coding-quiz/quiz/page";
import type { SyllabusDay } from "@/ai/flows/generate-syllabus";

// A generic type for any activity stored in the user's document
export type StoredActivity = QuizResult | InterviewActivity | NoteGenerationActivity;

// The base interface that all activity types extend
export interface BaseActivity {
    id: string;
    type: 'quiz' | 'interview' | 'note-generation';
    timestamp: string; // ISO 8601 date string
    details: {
        topic: string;
        [key: string]: any;
    };
}

// A specific type for completed quiz results
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

// A specific type for completed mock interviews
export interface InterviewActivity extends BaseActivity {
    type: 'interview';
    transcript: { speaker: string; text: string }[];
    feedback: string;
    details: {
        topic: string;
        role?: string;
        level?: string;
        score?: number; // e.g., 0-100
    }
}

// A specific type for when a user generates study notes
export interface NoteGenerationActivity extends BaseActivity {
    type: 'note-generation';
    details: {
        topic: string;
    }
}


// Data collected during the onboarding process
export interface OnboardingData {
    name: string;
    university: string;
    major: string;
    roles: string[];
    companies: string[];
}

// All data stored under a user's document in Firestore
export interface UserData {
    portfolio: Portfolio;
    activity: StoredActivity[];
    subscription: Subscription;
    onboardingCompleted: boolean;
    syllabus: SyllabusDay[];
}

// --- Auth ---
export interface SignUpForm {
    name: string;
    email: string;
    password: string
}

export interface SignInForm {
    email: string;
    password: string
}

// --- Subscription ---
export interface Subscription {
    plan: 'free' | 'monthly' | 'yearly';
    status: 'active' | 'inactive' | 'cancelled';
    startDate?: string;
    endDate: string | null;
}


// --- Portfolio Types ---
export interface Portfolio {
    personalInfo: PersonalInfo;
    themeColor: string;
    socials: SocialLinks;
    skills: Skill[];
    experience: WorkExperience[];
    education: Education[];
    projects: Project[];
    certificates: Certificate[];
    achievements: Achievement[];
    testimonials: Testimonial[];
    faqs: FAQ[];
}

export interface PersonalInfo {
    name: string;
    profession: string;
    bio: string;
    bannerUrl: string;
    email: string;
    phone: string;
}

export interface SocialLinks {
    github: string;
    linkedin: string;
    twitter: string;
    website: string;
    instagram: string;
}

export interface Skill {
    skill: string;
}

export interface WorkExperience {
    role: string;
    company: string;
    duration: string;
    description: string;
}

export interface Education {
    degree: string;
    institution: string;
    year: string;
}

export interface Project {
    title: string;
    description: string;
    link: string;
    tags: string;
    imageUrl: string;
}

export interface Certificate {
    name: string;
    body: string;
    date: string;
    imageUrl: string;
}

export interface Achievement {
    description: string;
    imageUrl: string;
}

export interface Testimonial {
    testimonial: string;
    author: string;
}

export interface FAQ {
    question: string;
    answer: string;
}
