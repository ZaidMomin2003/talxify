
import type { AnswerAnalysis } from "@/ai/flows/analyze-coding-answers";
import type { GenerateStudyNotesOutput } from "@/ai/flows/generate-study-notes";
import type { QuizState } from "@/app/dashboard/coding-quiz/quiz/page";
import type { SyllabusDay } from "@/ai/flows/generate-syllabus";
import { z } from 'genkit';
import { type serverTimestamp } from "firebase/firestore";

// A generic type for any activity stored in the user's document
export type StoredActivity = QuizResult | InterviewActivity | NoteGenerationActivity;

export const TranscriptEntrySchema = z.object({
  speaker: z.enum(['user', 'ai']),
  text: z.string(),
});
export type TranscriptEntry = z.infer<typeof TranscriptEntrySchema>;


// The base interface that all activity types extend
export interface BaseActivity {
    id: string;
    type: 'quiz' | 'interview' | 'note-generation';
    timestamp: string; // ISO 8601 date string
    details: {
        topic: string;
        [key: string]: any;
    };
    analysis?: any; // To allow for analysis property on all activities
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

// --- Interview Feedback Schemas ---
export const GenerateInterviewFeedbackInputSchema = z.object({
  transcript: z.array(TranscriptEntrySchema).describe("The full transcript of the interview, alternating between the AI interviewer and the user."),
  topic: z.string().describe("The main topic of the interview (e.g., 'React Hooks')."),
  role: z.string().describe("The role the user was interviewing for (e.g., 'Frontend Developer')."),
  company: z.string().optional().describe("The target company for the interview, if specified (e.g., 'Google').")
});
export type GenerateInterviewFeedbackInput = z.infer<typeof GenerateInterviewFeedbackInputSchema>;

export const GenerateInterviewFeedbackOutputSchema = z.object({
  crackingChance: z.number().min(0).max(100).describe("An estimated percentage (0-100) representing the candidate's likelihood of passing a real interview based on this performance."),
  fluencyScore: z.number().min(0).max(100).describe("A score (0-100) for the candidate's language fluency and smoothness of speech."),
  knowledgeScore: z.number().min(0).max(100).describe("A score (0-100) for the candidate's technical knowledge and accuracy."),
  confidenceScore: z.number().min(0).max(100).describe("A score (0-100) for the candidate's perceived confidence and poise."),
  overallScore: z.number().min(0).max(100).describe("A weighted average score (0-100) of all other scores."),
  strongConcepts: z.array(z.string()).describe("A list of topics or concepts the candidate demonstrated strong understanding of."),
  weakConcepts: z.array(z.string()).describe("A list of topics or concepts where the candidate showed weakness."),
  summary: z.string().describe("A detailed summary of the candidate's overall performance, highlighting strengths, weaknesses, and providing specific, actionable advice for improvement.")
});
export type GenerateInterviewFeedbackOutput = z.infer<typeof GenerateInterviewFeedbackOutputSchema>;


// A specific type for completed mock interviews
export interface InterviewActivity extends BaseActivity {
    type: 'interview';
    transcript: TranscriptEntry[];
    feedback: string;
    analysis?: GenerateInterviewFeedbackOutput;
    details: {
        topic: string;
        role?: string;
        level?: string;
        company?: string;
        score?: number; // e.g., 0-100
    }
}

// A specific type for when a user generates study notes
export interface NoteGenerationActivity extends BaseActivity {
    type: 'note-generation';
    notes?: GenerateStudyNotesOutput;
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

export const IcebreakerDataSchema = z.object({
    isIcebreaker: z.boolean().describe("Whether the text was identified as a self-introduction."),
    name: z.string().optional().describe("The candidate's first name."),
    college: z.string().optional().describe("The candidate's college or university."),
    city: z.string().optional().describe("The city the candidate is from."),
    skills: z.array(z.string()).optional().describe("A list of technical skills mentioned."),
    hobbies: z.array(z.string()).optional().describe("A list of hobbies mentioned."),
});
export type IcebreakerData = z.infer<typeof IcebreakerDataSchema>;

export interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
    createdAt: any; // Can be serverTimestamp or string
}


// All data stored under a user's document in Firestore
export interface UserData {
    id: string;
    portfolio: Portfolio;
    activity: StoredActivity[];
    subscription: Subscription;
    onboardingCompleted: boolean;
    syllabus: SyllabusDay[];
    retakeCounts?: { [topic: string]: number };
    timestamp?: any;
    todos: TodoItem[];
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
    plan: 'free' | 'pro-60d';
    status: 'active' | 'inactive' | 'cancelled';
    startDate?: string;
    endDate: string | null;
    usage?: {
        date: string; // YYYY-MM-DD
        count: number;
    };
    aiEnhancementsUsage?: {
        date: string;
        count: number;
    };
    resumeExports?: {
        date: string; // YYYY-MM-DD
        count: number;
    }
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
    hobbies: { name: string }[];
    displayOptions: {
        showAbout: boolean;
        showVideo: boolean;
        showStats: boolean;
        showSkills: boolean;
        showExperience: boolean;
        showEducation: boolean;
        showProjects: boolean;
        showCertificates: boolean;
        showAchievements: boolean;
        showTestimonials: boolean;
        showFaqs: boolean;
    }
}

export interface PersonalInfo {
    name: string;
    slug: string;
    profession: string;
    bio: string;
    avatarUrl: string;
    bannerUrl: string;
    email: string;
    phone: string;
    address?: string;
    youtubeVideoUrl?: string;
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
    expertise: number;
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

// --- Resume Builder ---
// This is the data structure for the resume enhancement AI flow.
const ExperienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  duration: z.string(),
  description: z.string(),
});

const EducationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  year: z.string(),
});

const SkillSchema = z.object({ skill: z.string(), expertise: z.number() });
const LanguageSchema = z.object({ name: z.string(), proficiency: z.string(), level: z.number() });
const HobbySchema = z.object({ name: z.string() });

export const ResumeDataInputSchema = z.object({
  personalInfo: z.object({
    name: z.string(),
    profession: z.string(),
    email: z.string(),
    phone: z.string(),
    address: z.string().optional(),
    linkedin: z.string(),
    github: z.string(),
    website: z.string(),
    summary: z.string(),
  }),
  experience: z.array(ExperienceSchema),
  education: z.array(EducationSchema),
  skills: z.array(SkillSchema),
  languages: z.array(LanguageSchema),
  hobbies: z.array(HobbySchema),
});
export type ResumeDataInput = z.infer<typeof ResumeDataInputSchema>;

export const EnhanceResumeOutputSchema = z.object({
  enhancedSummary: z.string().describe("The rewritten, enhanced professional summary."),
  enhancedExperience: z.array(z.object({
    originalRole: z.string(),
    enhancedDescription: z.string().describe("The rewritten, enhanced description for the work experience. Use action verbs and focus on achievements."),
  })),
});
export type EnhanceResumeOutput = z.infer<typeof EnhanceResumeOutputSchema>;


export type ResumeData = {
    personalInfo: {
        name: string;
        profession: string;
        email: string;
        phone: string;
        address: string;
        linkedin: string;
        github: string;
        website: string;
        summary: string;
    };
    experience: { company: string; role: string; duration: string; description: string; }[];
    education: { institution: string; degree: string; year: string; }[];
    skills: { name: string; }[];
    languages: { name: string; proficiency: string; level: number; }[];
    hobbies: { name: string; }[];
};


// --- Survey ---
// This represents the structure of a document in the surveySubmissions collection
export interface SurveySubmission {
    id?: string;
    timestamp?: {
        seconds: number;
        nanoseconds: number;
    };
    challenge?: string;
    aiValue?: string;
    practiceMethod?: string[];
    helpfulTools?: string[];
    pricePoint?: string;
    languages?: string[];
    feedbackImportance?: string;
    experienceLevel?: string;
    likelihood?: string;
    otherFeedback?: string;
    name?: string;
    email?: string;
}

// --- Waitlist ---
export interface WaitlistSubmission {
    name: string;
    email: string;
    timestamp: any;
}


// --- Interview Flow Schemas ---
export const InterviewFlowInputSchema = z.object({
  topic: z.string(),
  role: z.string(),
  company: z.string().optional(),
  history: z.array(TranscriptEntrySchema).optional(),
});

export const InterviewFlowStateSchema = z.object({
  status: z.string().optional(),
  aiText: z.string().optional(),
  userText: z.string().optional(),
  aiAudio: z.string().optional(),
});
export type InterviewFlowState = z.infer<typeof InterviewFlowStateSchema>;


export const InterviewFlowOutputSchema = z.object({
  transcript: z.array(TranscriptEntrySchema),
});
export type InterviewFlowOutput = z.infer<typeof InterviewFlowOutputSchema>;
