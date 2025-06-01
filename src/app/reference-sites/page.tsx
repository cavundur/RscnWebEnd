import { fetchReferenceSites } from "@/lib/api";
import dynamic from "next/dynamic";
import { getCountryName } from "@/lib/countries";
import Link from "next/link";

const WorldMap = dynamic(() => import("@/components/WorldMap"), { ssr: false });

export default async function ReferenceSitesPage() {
  const projects = await fetchReferenceSites();

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Reference Sites</h1>
      <div className="mb-8">
        <WorldMap projects={projects} />
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Projects</h2>
        <ul className="divide-y divide-gray-200">
          {projects.map((project) => (
            <li key={project.id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <Link href={`/reference-sites/${project.slug}`} className="text-blue-600 hover:underline font-medium">
                  {project.title}
                </Link>
                <span className="ml-2 text-gray-500">({getCountryName(project.country)})</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(project.stars)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.04 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" /></svg>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 