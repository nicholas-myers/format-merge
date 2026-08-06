# Format Merge

ETL and format conversion tool. Convert structured data between CSV, JSON, and XML.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Supported Conversions

| From | To |
|------|-----|
| CSV | JSON |
| JSON | CSV |
| CSV | XML |
| XML | CSV |
| XML | JSON |
| JSON | XML |

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [Tailwind CSS](https://tailwindcss.com/)
- [PapaParse](https://www.papaparse.com/) for CSV parsing
- [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser) for XML parsing

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run ESLint

## Google AdSense

Ads are optional and hidden until configured. Copy `.env.example` to `.env.local` and add your publisher ID and ad unit slot IDs.

| Placement | Location | Purpose |
|-----------|----------|---------|
| Sidebar | Desktop nav (sticky) | High viewability during tool use |
| Mobile banner | Below header on mobile | Replaces sidebar inventory |
| In-content | Tool pages + home | Natural break before main work area |
| Post-action | After convert / merge | Shown on user interaction with results |

Also update `public/ads.txt` with your publisher ID before submitting for AdSense review. The `pub-` ID in `ads.txt` must match your `NEXT_PUBLIC_ADSENSE_CLIENT_ID` (replace the `ca-` prefix with `pub-`).

Recommended ad units in AdSense dashboard:

- **Sidebar** — Display, vertical, responsive
- **Mobile banner** — Display, horizontal, responsive
- **In-content** — Display, responsive
- **Post-action** — Display, responsive or multiplex

### Production checklist

1. Set `NEXT_PUBLIC_SITE_URL` to your live domain (e.g. `https://formatmerge.com`)
2. Create 4 display ad units in the AdSense dashboard and set all env vars on your host
3. Set `NEXT_PUBLIC_ADSENSE_VERIFICATION` if Google provides a site verification meta tag
4. Update `public/ads.txt` with your real publisher ID
5. Deploy the site
6. Register the domain in [Google Search Console](https://search.google.com/search-console)
7. Submit `/sitemap.xml` in Search Console
8. Request indexing for `/`, `/csv-to-json`, and `/etl`
9. Apply for AdSense site approval (a privacy policy page is recommended)

## SEO

Each tool page includes keyword-targeted content, FAQ sections, JSON-LD structured data, and internal links to related converters. Technical SEO is handled via:

- `/sitemap.xml` — auto-generated from all routes
- `/robots.txt` — allows crawling and points to the sitemap
- Per-page metadata — title, description, canonical URL, Open Graph, and Twitter cards
