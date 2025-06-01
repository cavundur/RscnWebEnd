import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MapPin } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description: string;
  rating: number;
  country: string;
  images?: string[];
}

interface ProjectListProps {
  projects: Project[];
  selectedCountry?: string;
}

// Ülke kodlarını adlara çevirme
const COUNTRY_NAMES: Record<string, string> = {
  'ITA': 'Italy',
  'FRA': 'France',
  'DEU': 'Germany',
  'ESP': 'Spain',
  'GBR': 'United Kingdom',
  'TUR': 'Turkey',
  'POL': 'Poland',
  'NLD': 'Netherlands',
  'BEL': 'Belgium',
  'CHE': 'Switzerland',
  'AUT': 'Austria',
  'PRT': 'Portugal',
  'SWE': 'Sweden',
  'NOR': 'Norway',
  'FIN': 'Finland',
  'DNK': 'Denmark',
  'IRL': 'Ireland',
  'GRC': 'Greece'
};

// Type guard: title veya description bir obje ve rendered alanı içeriyorsa onu döndür
function getRenderedString(val: any): string {
  if (val && typeof val === 'object' && typeof val.rendered === 'string') {
    return val.rendered;
  }
  return typeof val === 'string' ? val : '';
}

const ProjectList = ({ projects, selectedCountry }: ProjectListProps) => {
  // Seçili ülkeye göre projeleri filtrele
  const filteredProjects = selectedCountry
    ? projects.filter(project => project.country === selectedCountry)
    : projects;

  return (
    <div className="container mx-auto px-4 max-w-4xl flex flex-col gap-2">
      {filteredProjects.length > 0 ? (
        filteredProjects.map((project) => (
          <div key={project.id} className="flex flex-row items-center border rounded-lg p-4 bg-white">
            {/* Ülke ismi */}
            <div className="w-32 font-semibold text-gray-700">{COUNTRY_NAMES[project.country] || project.country}</div>
            {/* Proje ismi */}
            <div className="flex-1 font-bold text-lg text-blue-700">{getRenderedString(project.title)}</div>
            {/* Yıldızlar */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className={`w-5 h-5 ${index < project.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-gray-500 text-center py-8">Bu kriterlere uygun proje bulunamadı.</div>
      )}
    </div>
  );
};

export default ProjectList; 