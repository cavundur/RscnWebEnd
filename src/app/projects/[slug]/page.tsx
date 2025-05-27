import Image from "next/image";
import Link from "next/link";
import wpApi from "@/lib/api/wordpress";
import Section from "@/components/Section";
import { notFound } from "next/navigation";

/**
 * Proje detay sayfası - ACF alanları İngilizce'ye çevrilmiş ve gereksiz kodlar kaldırılmıştır.
 */
export const revalidate = 3600;

type Props = {
  params: { slug: string };
};

export default async function ProjectDetailPage({ params }: Props) {
  // Proje verisini slug'a göre çekiyoruz
  const project = await wpApi.getProjectBySlug(params.slug);

  if (!project) return notFound();

  return (
    <main className="pt-20">
      <Section noPadding>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/projects"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
            >
              ← Back to Projects
            </Link>

            <h1 className="text-3xl md:text-4xl font-bold mb-6">{project.title.rendered}</h1>

            {/* Kapak görseli varsa göster */}
            {project._embedded?.["wp:featuredmedia"]?.[0]?.source_url && (
              <div className="aspect-video relative w-full mb-8 rounded-lg overflow-hidden">
                <Image
                  src={project._embedded["wp:featuredmedia"][0].source_url}
                  alt={project.title.rendered}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="col-span-2">
                {/* Eğer klasik içerik kullanılmıyorsa bu alanı kaldırdık */}
              </div>

              <div className="bg-slate-50 p-6 rounded-lg h-fit">
                <h3 className="text-lg font-bold mb-4">Project Details</h3>
                <div className="space-y-3">
                  {/* ACF alanları İngilizce olarak güncellendi */}
                  {project.acf?.start_date && (
                    <div>
                      <p className="text-sm font-medium text-slate-600">Start Date</p>
                      <p>{project.acf.start_date}</p>
                    </div>
                  )}
                  {project.acf?.end_date && (
                    <div>
                      <p className="text-sm font-medium text-slate-600">End Date</p>
                      <p>{project.acf.end_date}</p>
                    </div>
                  )}
                  {project.acf?.location && (
                    <div>
                      <p className="text-sm font-medium text-slate-600">Location</p>
                      <p>{project.acf.location}</p>
                    </div>
                  )}
                  {project.acf?.description && (
                    <div>
                      <p className="text-sm font-medium text-slate-600">Description</p>
                      <p>{project.acf.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}

/**
 * Statik parametreler için slug listesi döndürülür
 */
export async function generateStaticParams() {
  const projects = await wpApi.getProjects();
  return projects.map((project: any) => ({ slug: project.slug }));
} 