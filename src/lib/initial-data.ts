
import type { UserData } from './types';

export const initialPortfolioData: Omit<UserData, 'activity' | 'subscription' | 'onboardingCompleted' | 'syllabus' | 'id'> = {
    portfolio: {
        personalInfo: {
            name: 'John Doe',
            slug: 'john-doe',
            profession: 'Senior Software Engineer',
            bio: 'A passionate software engineer with a love for building scalable and user-friendly web applications.',
            developmentPhilosophy: 'I believe in writing clean, maintainable code and fostering a collaborative team environment. My focus is on creating user-centric products that are both performant and scalable.',
            avatarUrl: 'https://placehold.co/150x150.png',
            bannerUrl: 'https://placehold.co/1200x300.png',
            email: 'john.doe@example.com',
            phone: '+1 234 567 890',
            youtubeVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        },
        displayOptions: {
            showAbout: true,
            showVideo: true,
            showStats: true,
            showSkills: true,
            showExperience: true,
            showEducation: true,
            showProjects: true,
            showCertificates: true,
            showAchievements: true,
            showTestimonials: true,
            showFaqs: true,
        },
        themeColor: '221.2 83.2% 53.3%',
        socials: {
            github: 'https://github.com/johndoe',
            linkedin: 'https://linkedin.com/in/johndoe',
            twitter: 'https://twitter.com/johndoe',
            website: 'https://johndoe.com',
            instagram: 'https://instagram.com/johndoe',
        },
        skills: [
            { skill: 'React', expertise: 95 },
            { skill: 'Next.js', expertise: 90 },
            { skill: 'TypeScript', expertise: 85 },
            { skill: 'Node.js', expertise: 80 },
            { skill: 'GraphQL', expertise: 75 },
        ],
        experience: [{ role: 'Senior Software Engineer', company: 'Tech Innovations Inc.', duration: '2021 - Present', description: 'Led the development of a new microservices-based architecture, improving system scalability by 50%.' }],
        education: [{ degree: 'B.Sc. in Computer Science', institution: 'State University', year: '2018' }],
        projects: [{ title: 'Talxify - AI Interview Coach', description: 'An AI-powered platform to help users practice for technical interviews with real-time feedback and coding assistance.', link: 'https://talxify.ai', tags: 'Next.js, AI, Tailwind', imageUrl: 'https://placehold.co/1200x630.png' }],
        certificates: [{ name: 'Google Cloud Certified - Professional Cloud Architect', body: 'Google Cloud', date: '2023-05', imageUrl: 'https://placehold.co/100x100.png' }],
        achievements: [{ description: "Speaker at React Conf 2023 on 'The Future of Web Development'.", imageUrl: 'https://placehold.co/100x100.png' }],
        testimonials: [{ testimonial: 'John is a brilliant engineer who brings not only technical expertise but also a creative and collaborative spirit to every project. He was instrumental in our latest launch.', author: 'Jane Smith, CEO of Tech Innovations' }],
        faqs: [{ question: 'What are you most passionate about in software development?', answer: 'I am most passionate about creating elegant solutions to complex problems and building products that have a meaningful impact on people\'s lives. I love the blend of creativity and logic that software engineering requires.' }],
    },
};

    
