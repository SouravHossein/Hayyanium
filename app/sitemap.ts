import { MetadataRoute } from 'next';
import { allElementsData } from '@/data/elements';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://hayyanium.vercel.app';
  const lastModified = new Date();

  const mainRoutes = [
    { route: '', priority: 1, changeFrequency: 'weekly' as const },
    { route: '/community', priority: 0.7, changeFrequency: 'weekly' as const },
    { route: '/quiz', priority: 0.8, changeFrequency: 'weekly' as const },
    { route: '/quiz/setup', priority: 0.6, changeFrequency: 'monthly' as const },
    { route: '/quiz/premium', priority: 0.4, changeFrequency: 'monthly' as const },
    { route: '/timeline', priority: 0.8, changeFrequency: 'monthly' as const },
  ].map(({ route, priority, changeFrequency }) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency,
    priority,
  }));

  const elementRoutes = allElementsData.map((element) => ({
    url: `${baseUrl}/element/${element.symbol}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...mainRoutes, ...elementRoutes];
}
