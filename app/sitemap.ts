import { MetadataRoute } from 'next';
import { allElementsData } from '@/data/elements';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://interactive-periodic-table.vercel.app';
  const lastModified = new Date();

  // Core routes
  const mainRoutes = [
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

  // Element specific routes
  const elementRoutes = allElementsData.map((element) => ({
    url: `${baseUrl}/element/${element.symbol}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...mainRoutes, ...elementRoutes];
}
