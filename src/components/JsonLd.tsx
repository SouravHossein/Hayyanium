import React from 'react';

const JsonLd = () => {
  const structuredData = {
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default JsonLd;
