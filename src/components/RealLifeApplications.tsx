import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Type } from '@google/genai';
import { createGeminiClient } from '../lib/gemini';
import { ElementData } from '../types';
import SkeletonLoader from './ui/SkeletonLoader';

interface Application {
  image: string;
  caption: string;
  link: string;
  title: string;
}

const placeholderSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200" fill="none"><rect width="300" height="200" fill="%232d3748" /><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%23a0aec0">Image not available</text></svg>`;

const createFallbackApplications = (element: ElementData): Application[] => {
  const uses = element.commonUses?.slice(0, 4) ?? [];

  if (uses.length === 0) {
    return [
      {
        image: placeholderSvg,
        caption: element.everydayExample,
        link: `https://en.wikipedia.org/wiki/${encodeURIComponent(element.name)}`,
        title: element.name,
      },
    ];
  }

  return uses.map((use) => ({
    image: placeholderSvg,
    caption: `${element.name} is commonly used in ${use}.`,
    link: `https://en.wikipedia.org/wiki/${encodeURIComponent(element.name)}`,
    title: use,
  }));
};

const RealLifeApplications: React.FC<{ element: ElementData }> = ({ element }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const ai = useMemo(() => createGeminiClient(), []);
  const carouselRef = useRef<HTMLDivElement>(null);

  const loadInitialApplications = async () => {
    setCurrentIndex(0);
    setError(null);
    setIsLoading(true); // Set loading to true when starting

    const cacheKey = `real-apps-${element.name}`;
    try {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        setApplications(JSON.parse(cachedData));
        setIsAiGenerated(true);
        setIsLoading(false);
        return;
      }
    } catch (cacheError) {
      console.error('Failed to read from cache', cacheError);
    }

    const fallback = createFallbackApplications(element);
    try {
      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(element.name)}`
      );
      if (response.ok) {
        const data = await response.json();
        fallback[0].image = data?.thumbnail?.source || data?.originalimage?.source || placeholderSvg;
        fallback[0].caption = data?.description || data?.extract || fallback[0].caption;
      }
    } catch (e) {
      // use fallback as is
    }
    setApplications(fallback);
    setIsAiGenerated(false);
    setIsLoading(false);
  };

  useEffect(() => {
    loadInitialApplications();
  }, [element]);

  const handleGenerateAI = async () => {
    if (!ai) {
      setError('AI service is not configured.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentIndex(0);

    const cacheKey = `real-apps-${element.name}`;

    try {
      const prompt = `List 3 to 5 common, tangible, real-world applications or forms of the element '${element.name}'. For each, provide a single, concise search term suitable for a Wikipedia page title.`;
      const geminiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              applications: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    searchTerm: {
                      type: Type.STRING,
                      description: 'A concise search term for Wikipedia.',
                    },
                  },
                  required: ['searchTerm'],
                },
              },
            },
          },
        },
      });

      const responseText = await geminiResponse.text;
      if (!responseText) {
        throw new Error('Empty response received from AI.');
      }
      const result = JSON.parse(responseText);
      const searchTerms: { searchTerm: string }[] = result.applications || [];

      const wikiPromises = searchTerms.map(async ({ searchTerm }) => {
        try {
          const response = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerm)}`,
          );
          if (!response.ok) {
            return null;
          }

          const data = await response.json();
          return {
            image: data?.thumbnail?.source || data?.originalimage?.source || placeholderSvg,
            caption: data?.description || data?.extract || 'No description available.',
            link: data?.content_urls?.desktop?.page || '#',
            title: data?.title || searchTerm,
          };
        } catch {
          return null;
        }
      });

      const resolvedApps = (await Promise.all(wikiPromises)).filter(
        (application): application is Application =>
          application !== null && application.title !== 'Not found.',
      );

      if (resolvedApps.length > 0) {
        setApplications(resolvedApps);
        setIsAiGenerated(true);
        try {
          localStorage.setItem(cacheKey, JSON.stringify(resolvedApps));
        } catch (cacheError) {
          console.error('Failed to write to cache', cacheError);
        }
      } else {
        throw new Error('Could not find enough details for this element.');
      }
    } catch (requestError: any) {
      console.error('Failed to fetch applications:', requestError);

      let errorMessage = 'Failed to generate examples. Please try again later.';
      if (requestError.status === 503 || requestError.message?.includes('503')) {
        errorMessage = 'AI model is currently experiencing high demand. Please try again later.';
      } else if (requestError.message) {
        errorMessage = requestError.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (applications.length <= 1) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : applications.length - 1));
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        setCurrentIndex((prev) => (prev < applications.length - 1 ? prev + 1 : 0));
      }
    };

    const carousel = carouselRef.current;
    carousel?.addEventListener('keydown', handleKeyDown);
    return () => carousel?.removeEventListener('keydown', handleKeyDown);
  }, [applications.length]);

  if (isLoading) {
    return (
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-lg font-bold text-cyan-600 dark:text-cyan-300">
            Real-Life Applications &#129514;
          </h4>
        </div>
        <div className="grid gap-4">
          {/* Skeleton cards for loading state - show 3 placeholder cards */}
          {[1, 2, 3].map((index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
              <SkeletonLoader width="100%" height="200px" radius="xl" className="mb-3" />
              <div className="space-y-2">
                <SkeletonLoader width="70%" height="1.5rem" radius="md" />
                <SkeletonLoader width="50%" height="1rem" radius="sm" />
                <SkeletonLoader width="80%" height="1rem" radius="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (applications.length === 0 && error) {
    return (
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-lg font-bold text-cyan-600 dark:text-cyan-300">
            Real-Life Applications &#129514;
          </h4>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              // Trigger reload
              loadInitialApplications();
            }}
            className="rounded-md bg-cyan-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 dark:bg-cyan-700 dark:hover:bg-cyan-600"
          >
            Retry
          </button>
        </div>
        <div className="rounded-md bg-red-100 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800">
          {error}
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Unable to load real-life applications. Please check your connection and try again.
        </p>
      </div>
    );
  }

  if (applications.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-lg font-bold text-cyan-600 dark:text-cyan-300">
          Real-Life Applications &#129514;
        </h4>
        {!isAiGenerated && (
          <button
            onClick={handleGenerateAI}
            disabled={isLoading || !ai}
            className="rounded-md bg-cyan-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 dark:bg-cyan-700 dark:hover:bg-cyan-600"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              'Enhance with AI ✨'
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-3 rounded-md bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <div
        ref={carouselRef}
        className="relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
        tabIndex={0}
        aria-roledescription="carousel"
        aria-label={`Real-life applications of ${element.name}. Use left and right arrow keys to navigate.`}
      >
        <div className="overflow-hidden rounded-xl">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {applications.map((application, index) => (
              <div
                key={`${application.title}-${index}`}
                className="w-full flex-shrink-0"
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${applications.length}`}
                aria-hidden={currentIndex !== index}
              >
                <div className="rounded-2xl bg-gray-100 p-3 shadow-lg dark:bg-gray-900">
                  <img
                    src={application.image}
                    alt={application.title}
                    loading="lazy"
                    className="h-48 w-full rounded-xl bg-gray-700 object-cover"
                  />
                  <div className="mt-3 text-center">
                    <p className="flex h-10 items-center justify-center text-sm font-semibold">
                      {application.caption}
                    </p>
                    <a
                      href={application.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-500 hover:underline dark:text-cyan-400"
                      tabIndex={currentIndex !== index ? -1 : 0}
                    >
                      Learn more on Wikipedia &rarr;
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {applications.length > 1 && (
          <>
            <button
              onClick={() =>
                setCurrentIndex((prev) => (prev > 0 ? prev - 1 : applications.length - 1))
              }
              className="absolute top-1/2 left-1 -translate-y-1/2 transform rounded-full bg-black/40 p-1 text-white transition-colors hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Previous application"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() =>
                setCurrentIndex((prev) => (prev < applications.length - 1 ? prev + 1 : 0))
              }
              className="absolute top-1/2 right-1 -translate-y-1/2 transform rounded-full bg-black/40 p-1 text-white transition-colors hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Next application"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-2" role="tablist" aria-label="Slides">
              {applications.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 w-2 rounded-full ${currentIndex === index ? 'bg-white' : 'bg-gray-400'}`}
                  aria-selected={currentIndex === index}
                  role="tab"
                  aria-label={`Go to slide ${index + 1}`}
                ></button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RealLifeApplications;
