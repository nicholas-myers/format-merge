import Link from "next/link";
import { InContentAd } from "@/components/ads/AdPlacement";
import { JsonLd } from "@/components/JsonLd";
import { SeoContent } from "@/components/SeoContent";
import { CONVERSIONS } from "@/lib/formats";
import { HOME_SEO } from "@/lib/seo-content";
import { buildFaqJsonLd, buildPageMetadata, buildWebApplicationJsonLd } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: HOME_SEO.title,
  description: HOME_SEO.description,
  path: HOME_SEO.path,
  keywords: HOME_SEO.keywords,
});

export default function HomePage() {
  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{HOME_SEO.headline}</h1>
          <p className="mt-2 max-w-xl text-zinc-600">{HOME_SEO.intro}</p>
        </div>

        <Link
          href="/etl"
          className="group block rounded-xl border border-zinc-900 bg-zinc-900 p-6 text-white shadow-sm transition hover:bg-zinc-800"
        >
          <span className="text-lg font-medium">ETL Merge</span>
          <p className="mt-1 text-sm text-zinc-300">
            Upload multiple files in different formats, map fields, and define source of truth per
            field to build a master dataset.
          </p>
        </Link>

        <InContentAd />

        <div>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-400">
            Format conversions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CONVERSIONS.map((conversion) => (
              <Link
                key={conversion.path}
                href={conversion.path}
                className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md"
              >
                <span className="text-lg font-medium group-hover:text-zinc-900">
                  {conversion.label}
                </span>
                <p className="mt-1 text-sm text-zinc-500">
                  Transform {conversion.from.toUpperCase()} data into {conversion.to.toUpperCase()}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="md:hidden">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
            All conversions
          </p>
          <nav className="flex flex-wrap gap-2">
            <Link
              href="/etl"
              className="rounded-full border border-zinc-900 bg-zinc-900 px-3 py-1.5 text-sm text-white"
            >
              ETL Merge
            </Link>
            {CONVERSIONS.map((conversion) => (
              <Link
                key={conversion.path}
                href={conversion.path}
                className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-600"
              >
                {conversion.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <SeoContent path="/" />
      <JsonLd
        data={[
          buildWebApplicationJsonLd({
            name: HOME_SEO.title,
            path: HOME_SEO.path,
            description: HOME_SEO.description,
            featureList: HOME_SEO.featureList,
          }),
          buildFaqJsonLd(HOME_SEO.faq),
        ]}
      />
    </>
  );
}
