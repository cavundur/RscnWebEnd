import wpApi from "@/lib/api/wordpress";
import PageHeader from "@/components/PageHeader";
import Section from "@/components/Section";

/**
 * Thematic Working Groups sayfası - WordPress'ten dinamik veri çeker
 * @returns JSX.Element
 */
export default async function ThematicWorkingGroupsPage() {
  // WordPress'ten "thematic-working-groups" slug'lı sayfayı çek
  const page = await wpApi.getPageBySlug("thematic-working-groups");

  // Başlık ve açıklama ACF'den veya fallback olarak WP'den
  const pageTitle = page?.acf?.thematic_working_groups_title || page?.title?.rendered || "Thematic Working Groups";
  const pageDescription = page?.acf?.thematic_working_groups_description || page?.excerpt?.rendered || page?.content?.rendered || "";

  // Görsel ID'si varsa, media endpointinden görseli çek
  let headerImageUrl = "/imagesOld/thematic-working-groups.png";
  if (page?.acf?.thematic_working_groups_image) {
    try {
      const media = await wpApi.getMediaById(page.acf.thematic_working_groups_image);
      headerImageUrl = media?.source_url || headerImageUrl;
    } catch (e) {
      // Hata olursa default görsel kullan
    }
  } else if (page?._embedded?.["wp:featuredmedia"]?.[0]?.source_url) {
    headerImageUrl = page._embedded["wp:featuredmedia"][0].source_url;
  }

  return (
    <>
      <PageHeader
        title={pageTitle}
        description={pageDescription}
        imageUrl={headerImageUrl}
        imageAlt={`${pageTitle} Header Image`}
        titleContainerClassName="pageHeaderTitle"
      />
      <Section>
        {/* Thematic Working Groups ana içeriği buraya eklenebilir */}
        <div />
      </Section>
    </>
  );
} 