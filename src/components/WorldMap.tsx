"use client";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { useRef, useState } from 'react';

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

  const zoomRef = useRef<any>(null);
  const [zoom, setZoom] = useState(2.5);
  const [center, setCenter] = useState<[number, number]>([15, 45]);

  // Projede verisi olan ülkeleri bul (benzersiz)
  const countriesWithProjects = Array.from(new Set(projects.map(project => project.country)));

  // Ülke rengini belirle
  const getCountryColor = (countryCode: string) => {
    if (selectedCountry === countryCode) return '#2563EB'; // Seçili ülke için mavi
    if (countriesWithProjects.includes(countryCode)) return '#4CAF50'; // Projesi olan ülkeler için yeşil
    return '#D6D6DA'; // Diğer ülkeler için gri
  };

  const handleZoomIn = () => setZoom(z => Math.min(z * 1.5, 8));
  const handleZoomOut = () => setZoom(z => Math.max(z / 1.5, 1));
  const handleReset = () => {
    setZoom(2.5);
    setCenter([15, 45]);
  };

  return (
    <div className="relative w-full h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* <div className="absolute top-4 left-4 z-10 bg-white bg-opacity-80 p-2 rounded shadow">
        <h3 className="text-sm font-bold mb-1">AHA Reference Sites</h3>
        <div className="flex items-center text-xs mb-1">
          <div className="w-3 h-3 bg-[#4CAF50] mr-1 rounded-sm"></div>
          <span>Countries with projects</span>
        </div>
        <div className="flex items-center text-xs">
          <div className="w-3 h-3 bg-[#2563EB] mr-1 rounded-sm"></div>
          <span>Seçilen ülke</span>
        </div>
      </div> */}
      
      {/* Zoom Kontrolleri */}
      <div className="absolute right-4 top-4 z-20 flex flex-col gap-2 bg-white bg-opacity-80 p-2 rounded shadow">
        <button onClick={handleZoomIn} className="p-1 rounded hover:bg-gray-200">+</button>
        <button onClick={handleZoomOut} className="p-1 rounded hover:bg-gray-200">-</button>
        <button onClick={handleReset} className="p-1 rounded hover:bg-gray-200">Reset</button>
      </div>
      
      {/* Legend - sol alt */}
      <div className="absolute bottom-4 left-4 z-10 bg-white bg-opacity-80 p-2 rounded shadow">
        <h3 className="text-sm font-bold mb-1">Legend</h3>
        <div className="flex items-center text-xs mb-1">
          <div className="w-3 h-3 bg-[#4CAF50] mr-1 rounded-sm"></div>
          <span>Countries with projects</span>
        </div>
        <div className="flex items-center text-xs mb-1">
          <div className="w-3 h-3 bg-[#D6D6DA] mr-1 rounded-sm border border-gray-400"></div>
          <span>Countries without projects</span>
        </div>
        <div className="flex items-center text-xs">
          <div className="w-3 h-3 bg-[#2563EB] mr-1 rounded-sm"></div>
          <span>Selected country</span>
        </div>
      </div>
      
      <ComposableMap
        width={800}
        height={400}
        projection="geoMercator"
        projectionConfig={{
          scale: 250 // Sadece scale bırakıldı
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup
          center={center}
          zoom={zoom}
          onMoveEnd={({ zoom, coordinates }) => {
            setZoom(zoom);
            setCenter(coordinates);
          }}
          filterZoomEvent={(e: any) => {
            if (e && e.type === 'wheel' && !e.ctrlKey) {
             
              return false;
            }
            return true;
          }}
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
      You can use the mouse and control buttons to navigate and zoom the map.
      </div>
    </div>
  );
};

export default WorldMap; 