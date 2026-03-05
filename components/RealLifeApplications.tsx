import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { ElementData } from '../types';

interface Application {
    image: string;
    caption: string;
    link: string;
    title: string;
}

const placeholderSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200" fill="none"><rect width="300" height="200" fill="%232d3748" /><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%23a0aec0">Image not available</text></svg>`;

const RealLifeApplications: React.FC<{ element: ElementData }> = ({ element }) => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
    const ai = useMemo(() => {
        if (!apiKey) return null;
        return new GoogleGenAI({ apiKey });
    }, [apiKey]);

    const carouselRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        const fetchApplications = async () => {
            setIsLoading(true);
            setError(null);
            setCurrentIndex(0);

            const cacheKey = `real-apps-${element.name}`;
            try {
                const cachedData = localStorage.getItem(cacheKey);
                if (cachedData) {
                    setApplications(JSON.parse(cachedData));
                    setIsLoading(false);
                    return;
                }
            } catch (e) {
                console.error("Failed to read from cache", e);
            }

            if (!isOnline) {
                setError('Offline mode: real-life applications are unavailable.');
                setIsLoading(false);
                return;
            }

            try {
            if (!ai) {
                setError('Missing API key. Set VITE_GEMINI_API_KEY in .env.local.');
                setIsLoading(false);
                return;
            }

            const prompt = `List 3 to 5 common, tangible, real-world applications or forms of the element '${element.name}'. For each, provide a single, concise search term suitable for a Wikipedia page title.`;
                const geminiResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                applications: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            searchTerm: { type: Type.STRING, description: 'A concise search term for Wikipedia.' }
                                        },
                                        required: ['searchTerm'],
                                    }
                                }
                            }
                        }
                    }
                });

                const result = JSON.parse(geminiResponse.text);
                const searchTerms: { searchTerm: string }[] = result.applications || [];


                const wikiPromises = searchTerms.map(async ({ searchTerm }) => {
                    try {
                        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerm)}`);
                        if (!res.ok) return null;
                        const data = await res.json();
                        return {
                            image: data?.thumbnail?.source || data?.originalimage?.source || placeholderSvg,
                            caption: data?.description || data?.extract || 'No description available.',
                            link: data?.content_urls?.desktop?.page || '#',
                            title: data?.title || searchTerm
                        };
                    } catch (e) {
                        return null;
                    }
                });

                const resolvedApps = (await Promise.all(wikiPromises)).filter((app): app is Application => app !== null && app.title !== 'Not found.');
                
                if(resolvedApps.length > 0) {
                    setApplications(resolvedApps);
                    try {
                        localStorage.setItem(cacheKey, JSON.stringify(resolvedApps));
                    } catch (e) {
                        console.error("Failed to write to cache", e);
                    }
                } else {
                    setError(`Could not find applications for ${element.name}.`);
                }

            } catch (err) {
                console.error("Failed to fetch applications:", err);
                setError('Could not fetch applications at this time.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchApplications();
    }, [element.name, ai, isOnline]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setCurrentIndex(prev => (prev > 0 ? prev - 1 : applications.length - 1));
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                setCurrentIndex(prev => (prev < applications.length - 1 ? prev + 1 : 0));
            }
        };
        const carousel = carouselRef.current;
        carousel?.addEventListener('keydown', handleKeyDown);
        return () => carousel?.removeEventListener('keydown', handleKeyDown);
    }, [applications.length]);

    if (isLoading) {
        return (
            <div>
                <h4 className="font-bold text-cyan-600 dark:text-cyan-300 text-lg mb-2">Real-Life Applications</h4>
                <div className="flex justify-center items-center h-48 bg-gray-100 dark:bg-gray-900 rounded-md">
                    <svg className="animate-spin h-8 w-8 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div>
                <h4 className="font-bold text-cyan-600 dark:text-cyan-300 text-lg mb-2">Real-Life Applications</h4>
                <div className="p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 rounded-md text-sm">{error}</div>
            </div>
        )
    }

    if (applications.length === 0) return null;

    return (
        <div>
            <h4 className="font-bold text-cyan-600 dark:text-cyan-300 text-lg mb-2">Real-Life Applications</h4>
            <div ref={carouselRef} className="relative focus:outline-none" tabIndex={0}>
                <div className="overflow-hidden rounded-xl">
                    <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                        {applications.map((app, index) => (
                            <div key={index} className="flex-shrink-0 w-full" aria-hidden={currentIndex !== index}>
                                <div className="p-3 rounded-2xl shadow-lg bg-gray-100 dark:bg-gray-900">
                                    <img src={app.image} alt={app.title} loading="lazy" className="w-full h-48 object-cover rounded-xl bg-gray-700" />
                                    <div className="mt-3 text-center">
                                        <p className="font-semibold text-sm h-10 flex items-center justify-center">{app.caption}</p>
                                        <a href={app.link} target="_blank" rel="noopener noreferrer" className="text-cyan-500 dark:text-cyan-400 hover:underline text-xs" tabIndex={currentIndex !== index ? -1 : 0}>
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
                            onClick={() => setCurrentIndex(prev => (prev > 0 ? prev - 1 : applications.length - 1))}
                            className="absolute top-1/2 -translate-y-1/2 left-1 transform bg-black bg-opacity-40 text-white p-1 rounded-full hover:bg-opacity-60 focus:outline-none focus:ring-2 focus:ring-white"
                            aria-label="Previous application"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button 
                            onClick={() => setCurrentIndex(prev => (prev < applications.length - 1 ? prev + 1 : 0))}
                            className="absolute top-1/2 -translate-y-1/2 right-1 transform bg-black bg-opacity-40 text-white p-1 rounded-full hover:bg-opacity-60 focus:outline-none focus:ring-2 focus:ring-white"
                            aria-label="Next application"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                        
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                            {applications.map((_, index) => (
                                <button key={index} onClick={() => setCurrentIndex(index)} className={`w-2 h-2 rounded-full ${currentIndex === index ? 'bg-white' : 'bg-gray-400'}`} aria-label={`Go to slide ${index + 1}`}></button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default RealLifeApplications;
