import Image from "next/image";
import Link from "next/link";
import wpApi from "@/lib/api/wordpress";
import Section from "@/components/Section";
import { notFound } from "next/navigation";
import { convertToProxyUrl } from '@/lib/utils';

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

  // Görsel fallback mantığı
  let imageUrl = '';
  if (project._embedded?.["wp:featuredmedia"]?.[0]?.source_url) {
    imageUrl = convertToProxyUrl(project._embedded["wp:featuredmedia"][0].source_url);
  } else if (project.acf?.project_images && Array.isArray(project.acf.project_images) && project.acf.project_images[0]?.url) {
    imageUrl = convertToProxyUrl(project.acf.project_images[0].url);
  } else {
    imageUrl = '/images/placeholder/project.png';
  }

  // İçerik fallback mantığı
  const description = project.acf?.description || project.content?.rendered || project.excerpt?.rendered || '';

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

            {/* Kapak görseli varsa göster, yoksa placeholder */}
            <div className="w-full flex justify-left mb-8">
              <div className="bg-white rounded-lg flex items-left justify-center" style={{ height: 200, width: 'auto', minWidth: 200 }}>
                <Image
                  src={imageUrl}
                  alt={project.title.rendered}
                  height={200}
                  width={400}
                  style={{ width: 'auto', height: 200, maxWidth: '100%' }}
                  className="object-contain"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="col-span-2">
                {/* İçerik varsa göster, yoksa bilgilendirici mesaj */}
                {description ? (
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: description }} />
                ) : (
                  <p className="text-gray-500 italic">No content available for this project.</p>
                )}
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