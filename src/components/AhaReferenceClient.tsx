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
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [projectFilter, setProjectFilter] = useState<string>("");
  const [starFilter, setStarFilter] = useState<number | "">("");

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

  // Filtrelenmiş projeler
  const filteredProjects = processedProjects.filter(project => {
    const countryMatch = countryFilter ? project.country === countryFilter : true;
    const projectMatch = projectFilter ? project.title.toLowerCase().includes(projectFilter.toLowerCase()) : true;
    const starMatch = starFilter ? project.rating === starFilter : true;
    const selectedCountryMatch = selectedCountry ? project.country === selectedCountry : true;
    return countryMatch && projectMatch && starMatch && selectedCountryMatch;
  });

  const handleClearFilters = () => {
    setCountryFilter("");
    setProjectFilter("");
    setStarFilter("");
    setSelectedCountry(undefined);
  };

  return (
    <div className="container mx-auto py-8">
      {/*<h1 className="text-3xl font-bold mb-8">AHA Reference Sites</h1>*/}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-2">
          <WorldMap
            projects={processedProjects}
            onCountrySelect={setSelectedCountry}
            selectedCountry={selectedCountry}
          />
        </div>
        <div className="lg:col-span-2">
          {/* Filtre Barı */}
          <div className="flex flex-wrap gap-4 mb-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">Ülke</label>
              <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)} className="border rounded px-2 py-1">
                <option value="">Tümü</option>
                {[...new Set(processedProjects.map(p => p.country))].map(code => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Proje Adı</label>
              <input type="text" value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="border rounded px-2 py-1" placeholder="Proje adı ara..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Yıldız</label>
              <select value={starFilter} onChange={e => setStarFilter(e.target.value ? Number(e.target.value) : "")} className="border rounded px-2 py-1">
                <option value="">Tümü</option>
                {[5,4,3,2,1].map(star => (
                  <option key={star} value={star}>{star}</option>
                ))}
              </select>
            </div>
            <button onClick={handleClearFilters} className="ml-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Tümünü Göster</button>
          </div>
          <ProjectList
            projects={filteredProjects}
            selectedCountry={selectedCountry}
          />
        </div>
      </div>
    </div>
  );
};

export default AhaReferenceClient; 