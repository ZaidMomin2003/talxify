
import type { UserData } from './types';

export const initialPortfolioData: UserData = {
    portfolio: {
        personalInfo: {
            name: 'John Doe',
            profession: 'Senior Software Engineer',
            bio: 'A passionate software engineer with a love for building scalable and user-friendly web applications.',
            bannerUrl: 'https://placehold.co/1200x300.png',
            email: 'john.doe@example.com',
            phone: '+1 234 567 890',
        },
        themeColor: '221.2 83.2% 53.3%',
        socials: {
            github: 'https://github.com/johndoe',
            linkedin: 'https://linkedin.com/in/johndoe',
            twitter: 'https://twitter.com/johndoe',
            website: 'https://johndoe.com',
            instagram: 'https://instagram.com/johndoe',
        },
        skills: [{ skill: 'React' }, { skill: 'Next.js' }, { skill: 'TypeScript' }, { skill: 'Node.js' }, { skill: 'GraphQL' }],
        experience: [{ role: 'Senior Software Engineer', company: 'Tech Innovations Inc.', duration: '2021 - Present', description: 'Led the development of a new microservices-based architecture, improving system scalability by 50%.' }],
        education: [{ degree: 'B.Sc. in Computer Science', institution: 'State University', year: '2018' }],
        projects: [{ title: 'Talxify - AI Interview Coach', description: 'An AI-powered platform to help users practice for technical interviews with real-time feedback and coding assistance.', link: 'https://talxify.ai', tags: 'Next.js, AI, Tailwind' }],
        certificates: [{ name: 'Google Cloud Certified - Professional Cloud Architect', body: 'Google Cloud', date: '2023-05' }],
        achievements: [{ description: "Speaker at React Conf 2023 on 'The Future of Web Development'." }],
        testimonials: [{ testimonial: 'John is a brilliant engineer who brings not only technical expertise but also a creative and collaborative spirit to every project. He was instrumental in our latest launch.', author: 'Jane Smith, CEO of Tech Innovations' }],
        faqs: [{ question: 'What are you most passionate about in software development?', answer: 'I am most passionate about creating elegant solutions to complex problems and building products that have a meaningful impact on people\'s lives. I love the blend of creativity and logic that software engineering requires.' }],
    },
    activity: [],
    subscription: {
        plan: 'free',
        status: 'inactive',
        endDate: null
    }
};
