"use client";
import { useState, useEffect } from "react";
import WorldMap from "@/components/WorldMap";
import ProjectList from "@/components/ProjectList";

interface Project {
  id: number;
  title: string;
  description: string;
  rating: number;
  country: string; // ISO ülke kodu
  images?: string[];
}

interface AhaReferenceClientProps {
  projects: any[]; // WordPress'ten gelen ham veri
}

// Ülke adlarını ISO ülke kodlarına çevirme tablosu
const COUNTRY_NAME_TO_ISO: Record<string, string> = {
  "Turkey": "TUR",
  "Italy": "ITA",
  "France": "FRA",
  "Germany": "DEU",
  "Spain": "ESP",
  "United Kingdom": "GBR",
  "Poland": "POL",
  "Netherlands": "NLD",
  "Belgium": "BEL",
  "Switzerland": "CHE",
  "Austria": "AUT"
};

// Örnek projeler
const SAMPLE_PROJECTS: Project[] = [
  {
    id: 1,
    title: "Rome Innovation Hub",
    description: "A cutting-edge healthcare innovation center in Rome.",
    rating: 4,
    country: "ITA",
    images: []
  },
  {
    id: 2,
    title: "Paris Medical Research",
    description: "Advanced medical research facility focused on aging.",
    rating: 5,
    country: "FRA",
    images: []
  },
  {
    id: 3,
    title: "Berlin Health Tech",
    description: "Technology solutions for healthcare challenges.",
    rating: 3,
    country: "DEU",
    images: []
  },
  {
    id: 4,
    title: "Madrid Care Center",
    description: "Comprehensive elderly care solutions.",
    rating: 4,
    country: "ESP",
    images: []
  },
  {
    id: 5,
    title: "London Aging Research",
    description: "Research institute dedicated to healthy aging.",
    rating: 5,
    country: "GBR",
    images: []
  },
  {
    id: 6,
    title: "Istanbul Health Initiative",
    description: "Public health project for elderly citizens.",
    rating: 3,
    country: "TUR",
    images: []
  }
];

const AhaReferenceClient = ({ projects }: AhaReferenceClientProps) => {
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>();
  const [processedProjects, setProcessedProjects] = useState<Project[]>(SAMPLE_PROJECTS);

  useEffect(() => {
    if (projects && projects.length > 0) {
      const transformed = projects.map(project => {
        // Ülke adını ISO koduna çevirme
        let countryCode = "";
        if (project.acf?.country) {
          const countryName = Array.isArray(project.acf.country) 
            ? project.acf.country[0] 
            : project.acf.country;
          
          countryCode = COUNTRY_NAME_TO_ISO[countryName] || countryName;
        }

        return {
          id: project.id,
          title: typeof project.title === 'object' ? project.title.rendered : project.title,
          description: project.acf?.description || (project.content?.rendered || ''),
          rating: parseInt(project.acf?.stars_awarded || '0'),
          country: countryCode,
          images: project.acf?.map_image ? [project.acf.map_image] : []
        };
      });
      
      console.log('Transformed WordPress projects:', transformed);
      setProcessedProjects(transformed);
    } else {
      console.log('Using sample projects');
      setProcessedProjects(SAMPLE_PROJECTS);
    }
  }, [projects]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">AHA Reference Sites</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-2">
          <WorldMap
            projects={processedProjects}
            onCountrySelect={setSelectedCountry}
            selectedCountry={selectedCountry}
          />
        </div>
        <div className="lg:col-span-2">
          <ProjectList
            projects={processedProjects}
            selectedCountry={selectedCountry}
          />
        </div>
      </div>
    </div>
  );
};

export default AhaReferenceClient; 