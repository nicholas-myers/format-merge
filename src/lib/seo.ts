import type { Metadata } from "next";

export const SITE_NAME = "Format Merge";

export const DEFAULT_DESCRIPTION =
  "Free online CSV, JSON, and XML converter and ETL merge tool. Files are processed in your browser and never uploaded to a server.";

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return url.replace(/\/$/, "");
}

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
};

export function buildPageMetadata({
  title,
  description,
  path,
  keywords = [],
}: PageMetadataInput): Metadata {
  const canonicalPath = path.startsWith("/") ? path : `/${path}`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export type FaqItem = {
  question: string;
  answer: string;
};

export function buildWebApplicationJsonLd(options: {
  name: string;
  path: string;
  description: string;
  featureList: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: options.name,
    url: `${getSiteUrl()}${options.path}`,
    description: options.description,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: options.featureList,
  };
}

export function buildFaqJsonLd(faq: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function getAdSenseVerification(): string | undefined {
  const value = process.env.NEXT_PUBLIC_ADSENSE_VERIFICATION;
  return value || undefined;
}
