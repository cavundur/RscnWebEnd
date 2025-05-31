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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredProjects.length > 0 ? (
        filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{getRenderedString(project.title)}</CardTitle>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className={`w-4 h-4 ${
                      index < project.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center text-gray-500 mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{COUNTRY_NAMES[project.country] || project.country}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: getRenderedString(project.description) }}
              />
              {project.images && project.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {project.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${project.title} - Image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="lg:col-span-3 text-center py-10">
          <p className="text-gray-500">Bu ülkede proje bulunamadı</p>
        </div>
      )}
    </div>
  );
};

export default ProjectList; 