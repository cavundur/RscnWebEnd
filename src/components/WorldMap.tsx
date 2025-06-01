"use client";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { useRef, useState, useMemo, useEffect } from 'react';
import { ReferenceSite } from '@/lib/api/wordpress';
import { getCountryName, alpha3ToNumeric } from '@/lib/countries';
import styles from './WorldMap.module.scss';
import Icon from './Icon';

interface WorldMapProps {
  projects: ReferenceSite[];
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
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);
  const [internalSelectedCountry, setInternalSelectedCountry] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Seçili ülke state'i: dışarıdan geliyorsa onu, yoksa internal state'i kullan
  const activeCountry = selectedCountry ?? internalSelectedCountry;

  // Projesi olan ülkeler (numeric kod) - useMemo ile sadece bir kez hesapla
  const countriesWithProjects = useMemo(
    () => Array.from(new Set(
      projects.map(project => {
        let country = project.country;
        if (Array.isArray(country)) country = country[0];
        // alpha-3'ü numeric string'e çevir
        return alpha3ToNumeric[country || ''] || '';
      }).filter(Boolean)
    )),
    [projects]
  );

  // Seçili ülkenin projelerini bul (alpha-3 kodu ile)
  const selectedProjects = activeCountry
    ? projects.filter(p => p.country === activeCountry)
    : [];

  // Ülke koduna göre en yüksek rating'i bul ve renklendir
  const countryRatings = useMemo(() => {
    const map: Record<string, number> = {};
    projects.forEach(project => {
      let country = project.country;
      if (Array.isArray(country)) country = country[0];
      const code = alpha3ToNumeric[country || ''] || '';
      if (!code) return;
      const stars = typeof project.stars !== 'undefined' ? project.stars : (project as any).rating;
      if (typeof map[code] === 'undefined' || (stars && stars > map[code])) {
        if (stars && stars >= 1 && stars <= 5) {
          map[code] = stars;
        }
      }
    });
    return map;
  }, [projects]);

  // Yıldız sayısına göre renk eşlemesi
  const ratingColors: Record<number, string> = {
    5: '#20A2D5',
    4: '#80CAE6',
    3: '#AADBED',
    2: '#D1ECF4',
    1: '#EBF6F9',
  };

  // Ülke rengini belirle (en yüksek rating'e göre)
  const getCountryColor = (countryCode: string) => {
    const rating = countryRatings[countryCode];
    if (ratingColors[rating]) return ratingColors[rating];
    return '#D6D6DA';
  };

  // Harita dışına tıklanınca popup'ı kapat
  useEffect(() => {
    if (!activeCountry) return;
    const handleClick = (e: MouseEvent) => {
      const popup = document.getElementById('country-popup');
      if (popup && !popup.contains(e.target as Node)) {
        setInternalSelectedCountry(null);
        setPopupPosition(null);
        // onCountrySelect çağrılmayacak, filtre açık kalacak
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [activeCountry]);

  useEffect(() => {
    // Debug için: Ülke rating map ve projeler
    console.log('countryRatings', countryRatings);
    console.log('projects', projects);
  }, [countryRatings, projects]);

  const handleZoomIn = () => setZoom(z => Math.min(z * 1.5, 8));
  const handleZoomOut = () => setZoom(z => Math.max(z / 1.5, 1));
  const handleReset = () => {
    setZoom(2.5);
    setCenter([15, 45]);
  };

  // Ülkeye tıklanınca popup'ı container'a göre mouse pozisyonunda aç
  const handleCountryClick = (geo: any, evt: any) => {
    if (countriesWithProjects.includes(geo.id)) {
      setInternalSelectedCountry(geo.id);
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setPopupPosition({
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        });
      } else {
        setPopupPosition({ x: evt.clientX, y: evt.clientY });
      }
      const alpha3 = Object.keys(alpha3ToNumeric).find(key => alpha3ToNumeric[key] === geo.id);
      if (onCountrySelect && alpha3) onCountrySelect(alpha3);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
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
          <div className="w-3 h-3 mr-1 rounded-sm" style={{ background: '#20A2D5' }}></div>
          <span>5 stars</span>
        </div>
        <div className="flex items-center text-xs mb-1">
          <div className="w-3 h-3 mr-1 rounded-sm" style={{ background: '#80CAE6' }}></div>
          <span>4 stars</span>
        </div>
        <div className="flex items-center text-xs mb-1">
          <div className="w-3 h-3 mr-1 rounded-sm" style={{ background: '#AADBED' }}></div>
          <span>3 stars</span>
        </div>
        <div className="flex items-center text-xs mb-1">
          <div className="w-3 h-3 mr-1 rounded-sm" style={{ background: '#D1ECF4' }}></div>
          <span>2 stars</span>
        </div>
        <div className="flex items-center text-xs mb-1">
          <div className="w-3 h-3 mr-1 rounded-sm" style={{ background: '#EBF6F9' }}></div>
          <span>1 star</span>
        </div>
        <div className="flex items-center text-xs">
          <div className="w-3 h-3 bg-[#D6D6DA] mr-1 rounded-sm border border-gray-400"></div>
          <span>Countries without projects</span>
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
                  onClick={(evt) => handleCountryClick(geo, evt)}
                />
              ))
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      
      <div className="absolute bottom-2 right-2 text-xs text-gray-500">
      You can use the mouse and control buttons to navigate and zoom the map.
      </div>

      {/* Country Popup - mouse pozisyonunda */}
      {activeCountry && popupPosition && (
        <div
          id="country-popup"
          className={`${styles.countryPopup} absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-[220px] max-w-[320px]`}
          style={{ left: popupPosition.x + 10, top: popupPosition.y + 10 }}
        >
          <div className={`${styles.countryPopupHeader} flex justify-between items-center mb-2`}>
            <span className={`${styles.countryPopupTitle} font-bold text-blue-700`}>
              {getCountryName(Object.keys(alpha3ToNumeric).find(key => alpha3ToNumeric[key] === activeCountry) || activeCountry)}
            </span>
            <button
              className={`${styles.countryPopupCloseButton} text-gray-400 hover:text-gray-700 ml-2`}
              onClick={() => {
                setInternalSelectedCountry(null);
                setPopupPosition(null);
                if (onCountrySelect) onCountrySelect('');
              }}
              aria-label="Close"
            >
              <Icon name="x-icon" />
            </button>
          </div>
          <div className={`${styles.countryPopupProjectsHead} font-semibold text-sm mb-2`}>Projects</div>
          {selectedProjects.length === 0 ? (
            <div className="text-gray-500">No projects found for this country.</div>
          ) : (
            <div className="space-y-2">
              {selectedProjects.map((project) => (
                <div key={project.id} className="flex flex-col">
                  <span className="font-medium text-blue-600">{project.title}</span>
                  {project.link && (
                    typeof project.link === 'string' ? (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 underline mt-1"
                      >
                        External Link
                      </a>
                    ) : (
                      typeof project.link === 'object' && project.link !== null && 'url' in project.link ? (
                        <a
                          href={(project.link as { url: string }).url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 underline mt-1"
                        >
                          External Link
                        </a>
                      ) : null
                    )
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorldMap; 