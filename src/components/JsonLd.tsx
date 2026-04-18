import React from 'react';
import { ElementData } from '@/types';

interface JsonLdProps {
  element?: ElementData;
}

const JsonLd: React.FC<JsonLdProps> = ({ element }) => {
  const baseData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Interactive Periodic Table",
    "description": "An advanced interactive periodic table with 3D atomic structures and chemical compound builder.",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web",
    "author": {
      "@type": "Person",
      "name": "Sourav Hossein"
    },
    "hasPart": [
      {
        "@type": "Dataset",
        "name": "Chemical Elements Data",
        "description": "Detailed properties of all 118 chemical elements including atomic mass, boiling point, density and more."
      }
    ],
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Interactive 3D atomic models",
      "Dynamic compound builder",
      "Historical discovery timeline",
      "Periodic trends visualization",
      "Element comparison tool"
    ]
  };

  const elementData = element ? {
    "@context": "https://schema.org",
    "@type": "ChemicalSubstance",
    "name": element.name,
    "description": element.summary,
    "identifiers": [
      {
        "@type": "PropertyValue",
        "name": "Atomic Number",
        "value": element.atomicNumber
      },
      {
        "@type": "PropertyValue",
        "name": "Symbol",
        "value": element.symbol
      }
    ],
    "chemicalComposition": element.symbol,
    "url": `https://interactive-periodic-table.vercel.app/element/${element.symbol}`
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(baseData) }}
      />
      {elementData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(elementData) }}
        />
      )}
    </>
  );
};

export default JsonLd;
