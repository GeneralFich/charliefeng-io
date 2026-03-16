import type { MetadataRoute } from 'next';
import { getAllEssays, getAllCaseStudies, getAllArtifacts } from '@/lib/mdx';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://charliefeng.io';

  const staticPages = [
    '',
    '/work',
    '/writing',
    '/artifacts',
    '/resume',
    '/about',
  ];

  const staticEntries = staticPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
  }));

  const essays = getAllEssays('en').map((e) => ({
    url: `${baseUrl}/writing/${e.slug}`,
    lastModified: new Date(e.date),
    changeFrequency: 'yearly' as const,
  }));

  const caseStudies = getAllCaseStudies('en').map((s) => ({
    url: `${baseUrl}/work/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
  }));

  const artifacts = getAllArtifacts('en').map((a) => ({
    url: `${baseUrl}/artifacts/${a.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
  }));

  return [...staticEntries, ...essays, ...caseStudies, ...artifacts];
}
