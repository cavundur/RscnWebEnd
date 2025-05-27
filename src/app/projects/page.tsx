import Image from "next/image";
import Link from "next/link";
import wpApi from "@/lib/api/wordpress";
import Section from "@/components/Section";
import PageHeader from "@/components/PageHeader";
import DOMPurify from 'isomorphic-dompurify';

export const revalidate = 3600; // Her saat yeniden oluştur

/**
 * Açıklama metnini HTML'den arındırıp kısaltır
 * @param html Açıklama HTML'i
 * @param maxLength Maksimum karakter
 */
function getShortText(html: string, maxLength = 180): string {
  // HTML etiketlerini temizle
  const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength).trim() + '...';
}

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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {projects.map((project: any, idx: number) => {
              const imageUrl = imageUrls[idx];
              const title = project.acf?.project_title || project.title.rendered;
              const description =
                project.acf?.explanation ||
                project.acf?.aciklama ||
                project.acf?.description ||
                project.excerpt?.rendered ||
                project.content?.rendered ||
                "";
              const shortDescription = getShortText(description, 180);

              return (
                <div
                  key={project.id}
                  className="bg-white items-start rounded-xl border-2 flex flex-col items-center p-6 min-h-[370px]"
                  style={{ borderColor: "var(--theme-primary-light-text)" }}
                >
                  {imageUrl ? (
                    <div className="w-full flex justify-center mb-4 cardImageBorder">
                      <img
                        src={imageUrl}
                        alt={title}
                        className="h-30 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-full flex justify-center mb-4">
                      <div className="h-20 w-20 bg-slate-100 rounded flex items-center justify-center text-slate-400 text-2xl">
                        <span>No Image</span>
                      </div>
                    </div>
                  )}
                  <p className="text-lg mb-2" style={{ color: '#001F54', fontWeight: 500, fontSize: '1.25rem', lineHeight: '1.2' }}>{title}</p>
                  <p className="text-gray-600 text-sm mb-4 flex-1">
                    {shortDescription}
                  </p>
                  <a
                    href={`/projects/${project.slug}`}
                    className="mt-auto text-sky-500 font-medium hover:underline"
                    style={{ color: "var(--napoli-blue)" }}
                  >
                    See More
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </Section>
    </PageHeader>
  );
} 