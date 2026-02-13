
import React from "react";
import { getUserBySlug, getAllUserSlugs } from "../../zaidmin/actions";
import { initialPortfolioData } from "@/lib/initial-data";
import PortfolioComponent from "./portfolio-component";
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const userData = await getUserBySlug(params.slug);
  const portfolio = userData?.portfolio ?? initialPortfolioData.portfolio;

  const title = `${portfolio.personalInfo.name} - ${portfolio.personalInfo.profession}`;
  const description = portfolio.personalInfo.bio;

  return {
    title: title,
    description: description,
    openGraph: {
        title: title,
        description: description,
        images: [
            {
                url: portfolio.personalInfo.bannerUrl || 'https://placehold.co/1200x630.png',
                width: 1200,
                height: 630,
                alt: 'Portfolio Banner',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
        images: [portfolio.personalInfo.bannerUrl || 'https://placehold.co/1200x630.png'],
    }
  }
}


export async function generateStaticParams() {
  const slugs = await getAllUserSlugs();
  return slugs.map((slug) => ({
    slug: slug,
  }));
}


// This page now fetches data on the server
export default async function PortfolioPage({ params }: { params: { slug:string } }) {
    const userData = await getUserBySlug(params.slug);

    // If no user is found, we can pass the initial data to show a template/default view
    const portfolioData = userData ?? {
      ...initialPortfolioData,
      id: "not-found", // Add a placeholder ID
      portfolio: {
        ...initialPortfolioData.portfolio,
        personalInfo: {
            ...initialPortfolioData.portfolio.personalInfo,
            name: "User Not Found",
            profession: "Please check the URL",
            bio: "This portfolio could not be found. Please make sure the slug is correct.",
            slug: params.slug,
        }
      }
    };
    
    return (
        <PortfolioComponent userData={portfolioData}/>
    )
}
