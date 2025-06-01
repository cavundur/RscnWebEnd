import Image from "next/image";
import Link from "next/link";
import wpApi from "@/lib/api/wordpress";
import Section from "@/components/Section";
import { notFound } from "next/navigation";
import { convertToProxyUrl, preloadImage } from '@/lib/utils';
import { Suspense } from "react";

/**
 * Proje detay sayfası - Performans optimizasyonları yapıldı.
 */
export const revalidate = 3600;

type Props = {
  params: { slug: string };
};

// Yükleme durumu için bileşen
const LoadingState = () => (
  <div className="flex justify-center items-center min-h-[400px]">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
  </div>
);

// Error durumu için bileşen
const ErrorState = () => (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative my-6">
    <strong className="font-bold">Oops!</strong>
    <span className="block sm:inline"> Bu içeriği şu anda yükleyemiyoruz. Lütfen daha sonra tekrar deneyin.</span>
  </div>
);

// İçerik önbelleklemesi için optimize edilmiş görsel bileşeni
function OptimizedProjectImage({ url, alt, priority = true }: { url: string, alt: string, priority?: boolean }) {
  // URL'yi optimize et
  const optimizedImageUrl = convertToProxyUrl(url);
  
  // Sayfa yüklendiğinde görseli önceden yükle
  if (typeof window !== 'undefined' && priority) {
    preloadImage(optimizedImageUrl);
  }
  
  return (
    <Image
      src={optimizedImageUrl}
      alt={alt}
      height={200}
      width={400}
      style={{ width: 'auto', height: 200, maxWidth: '100%' }}
      className="object-contain"
      priority={priority}
    />
  );
}

export default async function ProjectDetailPage({ params }: Props) {
  if (!params?.slug) return notFound();
  
  try {
    // Proje verisini slug'a göre çekiyoruz
    const project = await wpApi.getProjectBySlug(params.slug);

    if (!project) return notFound();

    // Görsel fallback mantığı
    let imageUrl = '';
    if (project._embedded?.["wp:featuredmedia"]?.[0]?.source_url) {
      imageUrl = project._embedded["wp:featuredmedia"][0].source_url;
    } else if (project.acf?.project_images && Array.isArray(project.acf.project_images) && project.acf.project_images[0]?.url) {
      imageUrl = project.acf.project_images[0].url;
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

              <Suspense fallback={<LoadingState />}>
                <h1 className="text-3xl md:text-4xl font-bold mb-6">{project.title.rendered}</h1>

                {/* Kapak görseli varsa göster, yoksa placeholder */}
                <div className="w-full flex justify-left mb-8">
                  <div className="bg-white rounded-lg flex items-left justify-center" style={{ height: 200, width: 'auto', minWidth: 200 }}>
                    {imageUrl.startsWith('http') ? (
                      <OptimizedProjectImage url={imageUrl} alt={project.title.rendered} />
                    ) : (
                      <Image
                        src={imageUrl}
                        alt={project.title.rendered}
                        height={200}
                        width={400}
                        style={{ width: 'auto', height: 200, maxWidth: '100%' }}
                        className="object-contain"
                        priority
                      />
                    )}
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
                    </div>
                  </div>
                </div>
              </Suspense>
            </div>
          </div>
        </Section>
      </main>
    );
  } catch (error) {
    console.error('Error in ProjectDetailPage:', error);
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
              <ErrorState />
            </div>
          </div>
        </Section>
      </main>
    );
  }
}

/**
 * Statik parametreler için slug listesi döndürülür
 */
export async function generateStaticParams() {
  try {
    // Tüm projeleri getir (sayfalama ile)
    let allProjects: any[] = [];
    let page = 1;
    let hasMore = true;

    // Tüm sayfaları getir
    while (hasMore) {
      const projectsData = await wpApi.getProjects(page);
      const projects = projectsData.projects || [];
      
      if (!projects || projects.length === 0) {
        hasMore = false;
        break;
      }
      
      allProjects = [...allProjects, ...projects];
      
      // Daha fazla sayfa var mı?
      hasMore = page < projectsData.totalPages;
      page++;
      
      // Aşırı yüklenmeyi önlemek için 3 sayfa ile sınırla (geliştirme sırasında)
      if (process.env.NODE_ENV !== 'production' && page > 3) {
        hasMore = false;
      }
    }

    // Slug'ları dön (boş slug'ları filtrele)
    return allProjects
      .filter(project => project?.slug)
      .map(project => ({ 
        slug: project.slug 
      }));
  } catch (error) {
    console.error('Error generating static params for projects:', error);
    return [];
  }
} 