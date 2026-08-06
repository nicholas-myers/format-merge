import { CONVERSIONS } from "@/lib/formats";
import type { FaqItem } from "@/lib/seo";

export type SeoPageContent = {
  path: string;
  title: string;
  description: string;
  keywords: string[];
  headline: string;
  intro: string;
  steps: string[];
  useCases: string[];
  faq: FaqItem[];
  relatedLinks: { href: string; label: string }[];
  featureList: string[];
};

const PRIVACY_NOTE =
  "All processing happens locally in your browser — your files are never uploaded to a server.";

function conversionContent(
  from: string,
  to: string,
  fromLower: string,
  toLower: string,
  extraKeywords: string[] = [],
): Omit<SeoPageContent, "path" | "relatedLinks"> {
  return {
    title: `${from} to ${to} Converter Online`,
    description: `Convert ${from} to ${to} online for free. Upload or paste your data, convert instantly, and download the result. ${PRIVACY_NOTE}`,
    keywords: [
      `${fromLower} to ${toLower}`,
      `convert ${fromLower} to ${toLower}`,
      `${fromLower} to ${toLower} online`,
      `${fromLower} to ${toLower} converter`,
      ...extraKeywords,
    ],
    headline: `Free ${from} to ${to} Converter Online`,
    intro: `Use this free ${from} to ${to} converter to transform structured data in seconds. Paste your ${from} content or upload a file, click convert, then copy or download the ${to} output. ${PRIVACY_NOTE}`,
    steps: [
      `Paste your ${from} data or upload a ${fromLower} file.`,
      `Review the input and click Convert to ${to}.`,
      `Copy the ${to} output or download it as a file.`,
    ],
    useCases: [
      `Prepare ${fromLower} exports for apps that expect ${toLower}`,
      "Move data between spreadsheets, APIs, and legacy systems",
      "Validate and reformat structured data before import",
      "Quick one-off conversions without installing desktop software",
    ],
    faq: [
      {
        question: `How do I convert ${from} to ${to} online?`,
        answer: `Paste your ${from} into the input box or upload a file, then click Convert to ${to}. The tool generates formatted ${to} you can copy or download immediately.`,
      },
      {
        question: `Is this ${from} to ${to} converter free?`,
        answer: `Yes. Format Merge is free to use with no account required. ${PRIVACY_NOTE}`,
      },
      {
        question: "Are my files uploaded to your servers?",
        answer: `No. Conversion runs entirely in your browser using JavaScript. Your ${fromLower} data never leaves your device.`,
      },
      {
        question: `Can I upload a ${fromLower} file instead of pasting text?`,
        answer: `Yes. Use the Upload file button or drag and drop a .${fromLower} file into the input area.`,
      },
    ],
    featureList: [
      `Convert ${from} to ${to} in the browser`,
      "Upload files or paste text",
      "Copy or download converted output",
      "No account or server upload required",
    ],
  };
}

function buildRelatedLinks(currentPath: string): { href: string; label: string }[] {
  const links = [
    { href: "/etl", label: "ETL Merge" },
    ...CONVERSIONS.map((c) => ({ href: c.path, label: c.label })),
  ];
  return links.filter((link) => link.href !== currentPath);
}

const conversionPages: Record<string, SeoPageContent> = {
  "/csv-to-json": {
    path: "/csv-to-json",
    ...conversionContent("CSV", "JSON", "csv", "json", [
      "csv to json online",
      "csv json converter",
    ]),
    relatedLinks: buildRelatedLinks("/csv-to-json"),
  },
  "/json-to-csv": {
    path: "/json-to-csv",
    ...conversionContent("JSON", "CSV", "json", "csv", [
      "json to csv converter",
      "json to csv online",
    ]),
    relatedLinks: buildRelatedLinks("/json-to-csv"),
  },
  "/csv-to-xml": {
    path: "/csv-to-xml",
    ...conversionContent("CSV", "XML", "csv", "xml", ["csv to xml online"]),
    relatedLinks: buildRelatedLinks("/csv-to-xml"),
  },
  "/xml-to-csv": {
    path: "/xml-to-csv",
    ...conversionContent("XML", "CSV", "xml", "csv", ["xml to csv online", "xml to csv converter"]),
    relatedLinks: buildRelatedLinks("/xml-to-csv"),
  },
  "/xml-to-json": {
    path: "/xml-to-json",
    ...conversionContent("XML", "JSON", "xml", "json", ["xml to json online"]),
    relatedLinks: buildRelatedLinks("/xml-to-json"),
  },
  "/json-to-xml": {
    path: "/json-to-xml",
    ...conversionContent("JSON", "XML", "json", "xml", ["json to xml converter"]),
    relatedLinks: buildRelatedLinks("/json-to-xml"),
  },
};

export const HOME_SEO: SeoPageContent = {
  path: "/",
  title: "Free CSV, JSON & XML Converter and ETL Merge Tool",
  description: `Convert CSV, JSON, and XML online or merge multiple data sources into one master dataset. ${PRIVACY_NOTE}`,
  keywords: [
    "csv json xml converter",
    "format converter online",
    "data format conversion",
    "merge csv files",
    "etl tool online",
    "csv to json",
    "json to csv",
  ],
  headline: "Free Online Data Format Converter",
  intro: `Format Merge helps you convert between CSV, JSON, and XML or merge multiple files into a single source of truth. Every tool runs in your browser for speed and privacy — no uploads, no account required.`,
  steps: [
    "Choose a conversion (e.g. CSV to JSON) or open ETL Merge for multi-file workflows.",
    "Paste data or upload files in supported formats.",
    "Convert or merge, then copy or download your result.",
  ],
  useCases: [
    "Convert exports from spreadsheets, APIs, and legacy XML systems",
    "Merge customer or product data from multiple CSV, JSON, and XML sources",
    "Prepare datasets for import into databases and SaaS tools",
    "Quick format checks during development and data migration",
  ],
  faq: [
    {
      question: "What formats does Format Merge support?",
      answer:
        "You can convert between CSV, JSON, and XML in any direction. The ETL Merge tool combines multiple files with field mapping and source-of-truth rules.",
    },
    {
      question: "Is Format Merge free?",
      answer: `Yes. All converters and the ETL merge tool are free. ${PRIVACY_NOTE}`,
    },
    {
      question: "Do you store my data?",
      answer:
        "No. Processing happens locally in your browser. Files and pasted content are not sent to our servers.",
    },
    {
      question: "Can I merge CSV and JSON files together?",
      answer:
        "Yes. Use ETL Merge to upload mixed-format sources, map fields to a master schema, and pick which source wins for each field.",
    },
  ],
  relatedLinks: [
    { href: "/etl", label: "ETL Merge" },
    ...CONVERSIONS.map((c) => ({ href: c.path, label: c.label })),
  ],
  featureList: [
    "CSV, JSON, and XML conversion",
    "Multi-source ETL merge with field mapping",
    "Browser-based processing with no upload",
    "File upload, copy, and download support",
  ],
};

export const ETL_SEO: SeoPageContent = {
  path: "/etl",
  title: "ETL Merge Tool — Combine CSV, JSON & XML Files",
  description: `Merge multiple CSV, JSON, and XML files into one master dataset. Map fields, set source of truth per column, and export as JSON, CSV, or XML. ${PRIVACY_NOTE}`,
  keywords: [
    "merge csv files",
    "merge json and csv",
    "combine data sources",
    "etl merge online",
    "data merge tool",
    "source of truth dataset",
    "merge xml and csv",
  ],
  headline: "Merge Multiple Data Sources into One Master Dataset",
  intro: `Upload CSV, JSON, and XML files in a single workflow, map their columns to a master schema, and choose which file is the source of truth for each field. Perfect for consolidating exports from different systems without writing custom scripts. ${PRIVACY_NOTE}`,
  steps: [
    "Upload two or more CSV, JSON, or XML files.",
    "Define master fields and map each source column to them.",
    "Set a match key to join records and pick source-of-truth per field.",
    "Merge and export the unified dataset as JSON, CSV, or XML.",
  ],
  useCases: [
    "Combine CRM exports with spreadsheet and API data",
    "Build a single customer or product catalog from multiple systems",
    "Resolve conflicting field values with explicit source-of-truth rules",
    "Prototype ETL pipelines before automating in production",
  ],
  faq: [
    {
      question: "Can I merge files in different formats?",
      answer:
        "Yes. ETL Merge accepts CSV, JSON, and XML in the same session. Each file is parsed and mapped to your master schema.",
    },
    {
      question: "How does source of truth work?",
      answer:
        "For each master field you choose a primary source. When records match on your key field, that source is used first; other sources fill in missing values.",
    },
    {
      question: "What is a match key?",
      answer:
        "The match key is the field used to join rows across files, such as email or id. Records with the same key are merged into one output row.",
    },
    {
      question: "Is my data uploaded to a server?",
      answer: `No. Parsing and merging run entirely in your browser. ${PRIVACY_NOTE}`,
    },
  ],
  relatedLinks: buildRelatedLinks("/etl"),
  featureList: [
    "Merge CSV, JSON, and XML in one workflow",
    "Field mapping and source-of-truth rules",
    "Match-key based record joining",
    "Export merged data as JSON, CSV, or XML",
  ],
};

export function getSeoContent(path: string): SeoPageContent | undefined {
  if (path === "/") return HOME_SEO;
  if (path === "/etl") return ETL_SEO;
  return conversionPages[path];
}

export function getConversionSeoContent(slug: string): SeoPageContent | undefined {
  return conversionPages[`/${slug}`];
}
