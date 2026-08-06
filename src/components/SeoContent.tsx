import Link from "next/link";
import { InContentAd } from "@/components/ads/AdPlacement";
import { getSeoContent } from "@/lib/seo-content";

type SeoContentProps = {
  path: string;
};

export function SeoContent({ path }: SeoContentProps) {
  const content = getSeoContent(path);
  if (!content) return null;

  const isHome = path === "/";

  return (
    <section className="mt-12 space-y-8 border-t border-zinc-200 pt-10">
      {!isHome && (
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900">{content.headline}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-600">{content.intro}</p>
        </div>
      )}

      {!isHome && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            How it works
          </h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-600">
            {content.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Common use cases
        </h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-600">
          {content.useCases.map((useCase) => (
            <li key={useCase}>{useCase}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Frequently asked questions
        </h3>
        <dl className="mt-3 space-y-4">
          {content.faq.map((item) => (
            <div key={item.question}>
              <dt className="text-sm font-medium text-zinc-900">{item.question}</dt>
              <dd className="mt-1 text-sm text-zinc-600">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>

      <InContentAd />

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Related tools
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {content.relatedLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
