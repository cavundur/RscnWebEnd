"use client";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

interface WorldMapProps {
  projects: any[];
  onCountrySelect?: (countryCode: string) => void;
  selectedCountry?: string;
}

// Avrupa ve Afrika ülkelerinin ISO kodları
const EUROPE_AFRICA_COUNTRIES = [
  // Avrupa
  "ALB", "AND", "AUT", "BEL", "BGR", "BIH", "BLR", "CHE", "CYP", "CZE", 
  "DEU", "DNK", "ESP", "EST", "FIN", "FRA", "GBR", "GRC", "HRV", "HUN", 
  "IRL", "ISL", "ITA", "LTU", "LUX", "LVA", "MDA", "MKD", "MLT", "MNE", 
  "NLD", "NOR", "POL", "PRT", "ROU", "RUS", "SRB", "SVK", "SVN", "SWE", 
  "UKR", "VAT", "XKX",
  // Ortadoğu
  "TUR", "SYR", "IRQ", "IRN", "ISR", "JOR", "LBN", "SAU",
  // Afrika
  "DZA", "AGO", "BEN", "BWA", "BFA", "BDI", "CMR", "CPV", "CAF", "TCD", 
  "COM", "COG", "CIV", "COD", "DJI", "EGY", "GNQ", "ERI", "ETH", "GAB", 
  "GMB", "GHA", "GIN", "GNB", "KEN", "LSO", "LBR", "LBY", "MDG", "MWI", 
  "MLI", "MRT", "MUS", "MAR", "MOZ", "NAM", "NER", "NGA", "RWA", "STP", 
  "SEN", "SYC", "SLE", "SOM", "ZAF", "SSD", "SDN", "SWZ", "TZA", "TGO", 
  "TUN", "UGA", "ZMB", "ZWE"
];

const WorldMap = ({ projects, onCountrySelect, selectedCountry }: WorldMapProps) => {
  console.log('WorldMap props:', { projects, selectedCountry });

  // Projede verisi olan ülkeleri bul
  const countriesWithProjects = projects.map(project => project.country);

  // Ülke rengini belirle
  const getCountryColor = (countryCode: string) => {
    if (selectedCountry === countryCode) return '#2563EB'; // Seçili ülke için mavi
    if (countriesWithProjects.includes(countryCode)) return '#4CAF50'; // Projesi olan ülkeler için yeşil
    return '#D6D6DA'; // Diğer ülkeler için gri
  };

  return (
    <div className="relative w-full h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="absolute top-4 left-4 z-10 bg-white bg-opacity-80 p-2 rounded shadow">
        <h3 className="text-sm font-bold mb-1">AHA Reference Sites</h3>
        <div className="flex items-center text-xs mb-1">
          <div className="w-3 h-3 bg-[#4CAF50] mr-1 rounded-sm"></div>
          <span>Proje bulunan ülkeler</span>
        </div>
        <div className="flex items-center text-xs">
          <div className="w-3 h-3 bg-[#2563EB] mr-1 rounded-sm"></div>
          <span>Seçilen ülke</span>
        </div>
      </div>
      
      <ComposableMap
        width={800}
        height={600}
        projection="geoMercator"
        projectionConfig={{
          scale: 150 // Sadece scale bırakıldı
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup
          center={[15, 45]} // Avrupa'ya odaklı başlat
          zoom={2.5}
          minZoom={1}
          maxZoom={8}
        >
          <Geographies geography="/world-110m.json">
            {({ geographies }) =>
              geographies.map(geo => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getCountryColor(geo.id)}
                  stroke="#FFFFFF"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#F53", outline: "none", cursor: "pointer" },
                    pressed: { outline: "none" }
                  }}
                  onClick={() => {
                    console.log('Clicked on:', geo.id, geo.properties.name);
                    if (onCountrySelect) {
                      onCountrySelect(geo.id);
                    }
                  }}
                />
              ))
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      
      <div className="absolute bottom-2 right-2 text-xs text-gray-500">
        Haritada gezinmek ve yakınlaştırmak için fareyi kullanabilirsiniz
      </div>
    </div>
  );
};

export default WorldMap; 