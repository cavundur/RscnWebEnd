import wpApi from "@/lib/api/wordpress";
import PageHeader from "@/components/PageHeader";
import Section from "@/components/Section";
import Image from "next/image"; // Örnek için eklendi, gerekirse kullanılabilir

// export const revalidate = 10; // Gerekirse revalidate süresi eklenebilir

/**
 * AHA Reference sayfası - WordPress'ten dinamik veri çeker
 * @returns JSX.Element
 */
export default async function AhaReferencePage() {
  // WordPress'ten "aha-reference-sites" slug'lı sayfayı çek
  const page = await wpApi.getPageBySlug("aha-reference-sites");

  // Başlık ve açıklama ACF'den
  const pageTitle = page?.acf?.reference_sites_title || page?.title?.rendered || "AHA Reference Site Regions";
  const pageDescription = page?.acf?.reference_sites_description || page?.excerpt?.rendered || page?.content?.rendered || "";

  // Görsel ID'si varsa, media endpointinden görseli çek
  let headerImageUrl = "/imagesOld/aha-reference.png";
  if (page?.acf?.reference_sites_image) {
    try {
      const media = await wpApi.getMediaById(page.acf.reference_sites_image);
      headerImageUrl = media?.source_url || headerImageUrl;
    } catch (e) {
      // Hata olursa default görsel kullan
    }
  }

  // Reference Sites item'larını çek (CPT: reference_sites)
  const referenceSitesResponse = await wpApi.getPosts(1, 100, 'reference_sites');
  const referenceSites = referenceSitesResponse.posts || [];

  // Her bir reference site için map_image görselini çek
  async function getMapImageUrl(imageId: number) {
    if (!imageId) return null;
    try {
      const media = await wpApi.getMediaById(imageId);
      return media?.source_url || null;
    } catch {
      return null;
    }
  }

  // Map image url'lerini paralel olarak çek
  const mapImageUrls = await Promise.all(
    referenceSites.map(async (item: any) => {
      if (item.acf?.map_image && typeof item.acf.map_image === 'number') {
        return await getMapImageUrl(item.acf.map_image);
      }
      return null;
    })
  );

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
        {/* AHA Reference Sayfasının Ana İçeriği Buraya Gelecek */}
        <Section id="aha-introduction" isFirst={true}>
          <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold mb-4">Introduction to AHA Reference Sites</h2>
            <p className="text-lg text-slate-700 mb-4">
              The European Innovation Partnership on Active and Healthy Ageing (EIP on AHA) is a pilot initiative launched by the European Commission to foster innovation and digital transformation in the field of active and healthy ageing.
            </p>
            <p className="text-lg text-slate-700">
              Reference Sites are regions, cities, integrated hospitals or care organisations that have demonstrated excellence in the development, adoption, and scaling-up of innovative practices for active and healthy ageing.
            </p>
          </div>
        </Section>

        <Section id="aha-criteria" className="bg-slate-50">
          <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold mb-4">Criteria for Reference Sites</h2>
            <p className="text-lg text-slate-700 mb-4">
              To become a Reference Site, applicants must demonstrate a comprehensive, innovation-led approach to active and healthy ageing, with a focus on:
            </p>
            <ul className="list-disc list-inside text-lg text-slate-700 space-y-2">
              <li>Impact and sustainability of the innovative practices.</li>
              <li>Scalability and replicability of the solutions.</li>
              <li>Strong stakeholder engagement and co-creation.</li>
              <li>Evidence-based outcomes and a robust monitoring framework.</li>
            </ul>
          </div>
        </Section>

        <Section id="aha-benefits">
          <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold mb-4">Benefits of Being a Reference Site</h2>
            <p className="text-lg text-slate-700 mb-4">
              Becoming a Reference Site offers numerous benefits, including:
            </p>
            <ul className="list-disc list-inside text-lg text-slate-700 space-y-2">
              <li>Increased visibility and recognition at European level.</li>
              <li>Opportunities for networking and collaboration with other leading regions.</li>
              <li>Access to funding opportunities and support for innovation.</li>
              <li>Contribution to policy development and the European agenda on active and healthy ageing.</li>
            </ul>
          </div>
        </Section>
      </Section>
      {/* Reference Sites item'larını listele */}
      <Section id="reference-sites-list" className="bg-slate-50">
        <h2 className="text-2xl font-bold mb-6">Reference Sites</h2>
        <div className="grid">
          {referenceSites.length === 0 && (
            <div className="col-span-full text-center text-slate-500">No reference sites found.</div>
          )}
          {referenceSites.map((item: any, idx: number) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-2">{item.title?.rendered}</h3>
              {/* Ülkeler */}
              {item.acf?.country && (
                <div className="mb-2">
                  <strong>Country:</strong> {Array.isArray(item.acf.country) ? item.acf.country.join(', ') : item.acf.country}
                </div>
              )}
              {/* Yıldız */}
              {item.acf?.stars_awarded && (
                <div className="mb-2">
                  <strong>Stars Awarded:</strong> {item.acf.stars_awarded}
                </div>
              )}
              {/* Dış link */}
              {item.acf?.external_link && typeof item.acf.external_link === 'object' && (
                <div className="mb-2">
                  <strong>External Link:</strong>{' '}
                  <a
                    href={item.acf.external_link.url}
                    target={item.acf.external_link.target || '_blank'}
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {item.acf.external_link.title || item.acf.external_link.url}
                  </a>
                </div>
              )}
              {item.acf?.external_link && typeof item.acf.external_link === 'string' && (
                <div className="mb-2">
                  <strong>External Link:</strong>{' '}
                  <a
                    href={item.acf.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {item.acf.external_link}
                  </a>
                </div>
              )}
              {/* Map Image */}
              {mapImageUrls[idx] && (
                <div className="mb-2">
                  <strong>Map Image:</strong><br />
                  <img src={mapImageUrls[idx]} alt="Map" className="rounded w-full max-h-40 object-contain" />
                </div>
              )}
              {/* Açıklama alanları */}
              {item.acf?.description && (
                <div className="text-slate-700 mb-2" dangerouslySetInnerHTML={{ __html: item.acf.description }} />
              )}
              {item.acf?.reference_sites_description && (
                <div className="text-slate-700 mb-2" dangerouslySetInnerHTML={{ __html: item.acf.reference_sites_description }} />
              )}
              {item.content?.rendered && (
                <div className="text-slate-700 mb-2" dangerouslySetInnerHTML={{ __html: item.content.rendered }} />
              )}
              {item.excerpt?.rendered && (
                <div className="text-slate-500 mb-2" dangerouslySetInnerHTML={{ __html: item.excerpt.rendered }} />
              )}
            </div>
          ))}
        </div>
      </Section>
    </>
  );
} 