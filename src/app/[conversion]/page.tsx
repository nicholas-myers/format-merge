import { notFound } from "next/navigation";
import { ConverterPanel } from "@/components/ConverterPanel";
import { JsonLd } from "@/components/JsonLd";
import { SeoContent } from "@/components/SeoContent";
import { CONVERSIONS, DataFormat } from "@/lib/formats";
import { getConversionSeoContent } from "@/lib/seo-content";
import { buildFaqJsonLd, buildPageMetadata, buildWebApplicationJsonLd } from "@/lib/seo";

type PageProps = {
  params: Promise<{ conversion: string }>;
};

function parseConversion(slug: string): { from: DataFormat; to: DataFormat; path: string } | null {
  const match = CONVERSIONS.find((c) => c.path.slice(1) === slug);
  if (!match) return null;
  return { from: match.from, to: match.to, path: match.path };
}

export function generateStaticParams() {
  return CONVERSIONS.map((c) => ({ conversion: c.path.slice(1) }));
}

export async function generateMetadata({ params }: PageProps) {
  const { conversion } = await params;
  const content = getConversionSeoContent(conversion);
  if (!content) return { title: "Not Found" };

  return buildPageMetadata({
    title: content.title,
    description: content.description,
    path: content.path,
    keywords: content.keywords,
  });
}

export default async function ConversionPage({ params }: PageProps) {
  const { conversion } = await params;
  const parsed = parseConversion(conversion);

  if (!parsed) {
    notFound();
  }

  const content = getConversionSeoContent(conversion);
  if (!content) {
    notFound();
  }

  return (
    <>
      <ConverterPanel from={parsed.from} to={parsed.to} />
      <SeoContent path={content.path} />
      <JsonLd
        data={[
          buildWebApplicationJsonLd({
            name: content.title,
            path: content.path,
            description: content.description,
            featureList: content.featureList,
          }),
          buildFaqJsonLd(content.faq),
        ]}
      />
    </>
  );
}
