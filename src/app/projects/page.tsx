import Image from "next/image";
import Link from "next/link";
import wpApi from "@/lib/api/wordpress";
import Section from "@/components/Section";
import PageHeader from "@/components/PageHeader";

export const revalidate = 3600; // Her saat yeniden oluştur

export default async function ProjectsPage() {
  const projects = await wpApi.getProjects();
  
  // Projects ana sayfa verisini çek
  const projectsPage = await wpApi.getPageBySlug("projects-page");
  const pageTitle = projectsPage?.acf?.projects_title || projectsPage?.title?.rendered || "Projects";
  const pageDescription = projectsPage?.acf?.projects_description || projectsPage?.excerpt?.rendered || projectsPage?.content?.rendered || "";

  // Ana görseli çek (her türlü dönüş biçimi için)
  let headerImageUrl: string | null = null;
  const img = projectsPage?.acf?.projects_image;
  if (!img) {
    headerImageUrl = null;
  } else if (typeof img === 'string' && img.startsWith('http')) {
    headerImageUrl = img;
  } else if (typeof img === 'number') {
    const media = await wpApi.getMediaById(img);
    headerImageUrl = media?.source_url || null;
  } else if (typeof img === 'object' && img !== null) {
    if ('url' in img && img.url) {
      headerImageUrl = img.url;
    } else if ('ID' in img && img.ID) {
      const media = await wpApi.getMediaById(img.ID);
      headerImageUrl = media?.source_url || null;
    }
  } else if (projectsPage?._embedded?.["wp:featuredmedia"]?.[0]?.source_url) {
    headerImageUrl = projectsPage._embedded["wp:featuredmedia"][0].source_url;
  }

  // PageHeader propslarını oluştur
  const pageHeaderProps: any = {
    title: pageTitle,
    description: pageDescription,
    titleContainerClassName: "pageHeaderTitle",
  };
  if (headerImageUrl !== null) {
    pageHeaderProps.imageUrl = headerImageUrl;
    pageHeaderProps.imageAlt = pageTitle + " Header Image";
  }

  // Proje görselleri için gerçek source_url'leri topla
  const imageUrls = await Promise.all(projects.map(async (project: any) => {
    let url = null;
    // Öncelik: Galeri alanı (project_images)
    if (
      Array.isArray(project.acf?.project_images) &&
      project.acf.project_images.length > 0
    ) {
      const firstImage = project.acf.project_images[0];
      if (typeof firstImage === "object" && firstImage.url) {
        url = firstImage.url;
      } else if (typeof firstImage === "number") {
        const media = await wpApi.getMediaById(firstImage);
        url = media?.source_url || null;
      }
    }
    // Fallback: _embedded featured media
    if (!url && project._embedded?.["wp:featuredmedia"]?.[0]?.source_url) {
      url = project._embedded["wp:featuredmedia"][0].source_url;
    }
    // Fallback: featured_media ID
    if (!url && project.featured_media && project.featured_media > 0) {
      const media = await wpApi.getMediaById(project.featured_media);
      url = media?.source_url || null;
    }
    return url;
  }));

  return (
    <PageHeader {...pageHeaderProps}>
      <Section isFirst={true}>
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project: any, idx: number) => {
              // Görsel URL'sini imageUrls dizisinden al
              const imageUrl = imageUrls[idx];
              // Başlık ve açıklama için önceliklendirme
              const title = project.acf?.project_title || project.title.rendered;
              const description =
                project.acf?.explanation ||
                project.acf?.aciklama ||
                project.acf?.description ||
                project.excerpt?.rendered ||
                project.content?.rendered ||
                "";

              return (
                <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                  {imageUrl ? (
                    <div className="relative w-full h-56">
                      <Image
                        src={imageUrl}
                        alt={project.title.rendered}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No image available</span>
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <h2 className="text-2xl font-semibold mb-2">
                      {title}
                    </h2>
                    {description && (
                      <div
                        className="text-gray-700 mb-4 project-description"
                        dangerouslySetInnerHTML={{ __html: description }}
                      />
                    )}
                    <Link
                      href={`/projects/${project.slug}`}
                      className="mt-auto inline-block text-blue-600 hover:underline font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Section>
    </PageHeader>
  );
} 