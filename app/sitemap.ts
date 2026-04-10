import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://interactive-periodic-table-wheat.vercel.app';
  const lastModified = new Date();

  const routes = [
    '',
    '/elements',
    '/compounds',
    '/trends',
    '/history',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
