import { EtlPanel } from "@/components/EtlPanel";
import { JsonLd } from "@/components/JsonLd";
import { SeoContent } from "@/components/SeoContent";
import { ETL_SEO } from "@/lib/seo-content";
import { buildFaqJsonLd, buildPageMetadata, buildWebApplicationJsonLd } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: ETL_SEO.title,
  description: ETL_SEO.description,
  path: ETL_SEO.path,
  keywords: ETL_SEO.keywords,
});

export default function EtlPage() {
  return (
    <>
      <EtlPanel />
      <SeoContent path={ETL_SEO.path} />
      <JsonLd
        data={[
          buildWebApplicationJsonLd({
            name: ETL_SEO.title,
            path: ETL_SEO.path,
            description: ETL_SEO.description,
            featureList: ETL_SEO.featureList,
          }),
          buildFaqJsonLd(ETL_SEO.faq),
        ]}
      />
    </>
  );
}
