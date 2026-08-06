import type { MetadataRoute } from "next";
import { CONVERSIONS } from "@/lib/formats";
import { getSiteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();

  const conversionEntries: MetadataRoute.Sitemap = CONVERSIONS.map((conversion) => ({
    url: `${baseUrl}${conversion.path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: conversion.path === "/csv-to-json" || conversion.path === "/json-to-csv" ? 0.9 : 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/etl`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...conversionEntries,
  ];
}
