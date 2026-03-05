import React, { useEffect, useState } from 'react';

const placeholderSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300" viewBox="0 0 480 300" fill="none"><rect width="480" height="300" fill="%232d3748" /><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%23a0aec0">Image not available</text></svg>`;

interface ElementImageProps {
  elementName: string;
}

const ElementImage: React.FC<ElementImageProps> = ({ elementName }) => {
  const [imageUrl, setImageUrl] = useState<string>(placeholderSvg);
  const [caption, setCaption] = useState<string>('Wikipedia image');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cacheKey = `element-image-${elementName}`;
    const fetchImage = async () => {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const data = JSON.parse(cached) as { url: string; caption: string };
          setImageUrl(data.url);
          setCaption(data.caption);
          return;
        }
      } catch (e) {
        console.error('Failed to read image cache', e);
      }

      if (!navigator.onLine) {
        setError('Offline mode: image unavailable.');
        return;
      }

      try {
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(elementName)}`);
        if (!res.ok) {
          setError('Image not found.');
          return;
        }
        const data = await res.json();
        const url = data?.thumbnail?.source || data?.originalimage?.source || placeholderSvg;
        const cap = data?.title ? `Image from ${data.title}` : 'Wikipedia image';
        setImageUrl(url);
        setCaption(cap);
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ url, caption: cap }));
        } catch (e) {
          console.error('Failed to cache image', e);
        }
      } catch (e) {
        setError('Image unavailable.');
      }
    };

    setError(null);
    fetchImage();
  }, [elementName]);

  return (
    <div className="rounded-xl overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-900">
      <img src={imageUrl} alt={elementName} className="w-full h-48 object-cover" loading="lazy" />
      <div className="px-3 py-2 text-xs text-gray-600 dark:text-gray-300">
        {error ? error : caption}
      </div>
    </div>
  );
};

export default ElementImage;
