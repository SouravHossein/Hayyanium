import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { allElementsData } from '@/data/elements';
import ElementDetailContent from './ElementDetailContent';
import JsonLd from '@/components/JsonLd';

interface PageProps {
  params: Promise<{ symbol: string }>;
}

export async function generateStaticParams() {
  return allElementsData.map((element) => ({
    symbol: element.symbol,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { symbol } = await params;
  const element = allElementsData.find(
    (e) => e.symbol.toLowerCase() === symbol.toLowerCase()
  );

  if (!element) return { title: 'Element Not Found' };

  const title = `${element.name} (${element.symbol}) - Periodic Table Properties & Details`;
  const description = `Complete properties of ${element.name} (Atomic Number ${element.atomicNumber}). Discovery: ${element.discoveryYear}. ${element.summary.substring(0, 150)}...`;

  return {
    title,
    description,
    keywords: [element.name, element.symbol, 'chemistry', 'periodic table', 'atomic properties', 'isotopes'],
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://interactive-periodic-table.vercel.app/element/${element.symbol}`,
      images: [
        {
          url: `/api/og?symbol=${element.symbol}`, // Future improvement: OG image generator
          width: 1200,
          height: 630,
          alt: `${element.name} Properties`,
        },
      ],
    },
    alternates: {
      canonical: `https://interactive-periodic-table.vercel.app/element/${element.symbol}`,
    },
  };
}

export default async function ElementPage({ params }: PageProps) {
  const { symbol } = await params;
  const element = allElementsData.find(
    (e) => e.symbol.toLowerCase() === symbol.toLowerCase()
  );

  if (!element) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12 px-4">
      <JsonLd element={element} />
      <div className="max-w-4xl mx-auto">
        <ElementDetailContent element={element} />
      </div>
    </main>
  );
}
