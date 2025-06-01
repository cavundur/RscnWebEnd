// import { useState } from 'react';
// import WorldMap from '@/components/WorldMap';
// import ProjectList from '@/components/ProjectList';
import wpApi from "@/lib/api/wordpress";
import PageHeader from "@/components/PageHeader";
import Section from "@/components/Section";
import Image from "next/image"; // Örnek için eklendi, gerekirse kullanılabilir
import AhaReferenceClient from '@/components/AhaReferenceClient';
import styles from './page.module.scss';
import Footer from "@/components/Footer";

// export const revalidate = 10; // Gerekirse revalidate süresi eklenebilir

/**
 * AHA Reference sayfası - WordPress'ten dinamik veri çeker
 * @returns JSX.Element
 */
export default async function AhaReferencePage() {
  // const [selectedCountry, setSelectedCountry] = useState<string | undefined>();

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

        {/* AHA Reference Sayfasının Ana İçeriği Buraya Gelecek */}
        <Section id="aha-introduction" isFirst={true} className={styles.ahaIntroduction}>
          <div className={`${styles.ahaIntroductionContent} container mx-auto px-4 py-8`}>
            <h2 className={`${styles.textHeader} text-3xl font-bold mb-4`}>What are AHA Reference Sites?</h2>
            <p className="text-lg text-slate-700 mb-4">
            AHA References Sites will have adopted a ”Quadruple Helix” model to ensure all stakeholders:
            </p>
            <ul className="list-disc list-inside text-lg text-slate-700 space-y-2">
              <li>
                <p className="text-lg text-slate-700">
                have a common understanding of the organisational, technical and financial challenges facing the region or area within health and care, and active and healthy ageing;
                </p>
              </li>
              <li>
                <p className="text-lg text-slate-700">
                are working collaboratively to define and implement innovative solutions for improving patient and service user outcomes, increasing the sustainability of health and care systems, and creating economic growth and jobs.
                </p>
              </li>
            </ul>
            <p className="text-lg text-slate-700">
            The lead authority for health and social care in the region is a fundamental stakeholder in the AHA Reference Site.
            </p>
          </div>
          <div className={`${styles.ahaIntroductionImage} container mx-auto px-4 py-8`}>
            <Image src="/images/aha-reference.png" alt="AHA Reference Sites" width={1000} height={1000} />
          </div>
        </Section>

        <Section id="aha-criteria" className={`${styles.ahaIntroduction} bg-slate-50`}>
          <div className="head-info container mx-auto px-4 py-8">

            <div className="prose max-w-none text-slate-700 mb-4 head-info" >Why Become an AHA Reference Site?</div>
              <div className="head-info-line"></div>
              <div className="prose max-w-none text-slate-700 mission-content">
              <ul className="list-disc list-inside text-lg text-slate-700 space-y-2">
                <li>
                  <p className="text-lg text-slate-700">
                  Opportunity to become a catalyst in your region, bringing other stakeholders on board to work collaboratively on the development of innovative and digital solutions to address a life-course approach to active and healthy ageing
                  </p>
                </li>
                <li>
                  <p className="text-lg text-slate-700">
                  Opportunity to scale up AHA/AHL service delivery models and innovative and digital solutions by ensuring providers are able to adopt innovative practices through capacity building
                  </p>
                </li>
                <li>
                  <p className="text-lg text-slate-700">
                  Internationalisation and networking within an innovative community of accredited AHA Reference Sites
                  </p>
                </li>
                <li>
                  <p className="text-lg text-slate-700">
                  Internal regional system’s development and evolution through mutual learning
                  </p>
                </li>
                <li>
                  <p className="text-lg text-slate-700">
                  Enhanced strategic oversight and direction to supporting regional and national policies and plans for life-course approaches to active and healthy ageing
                  </p>
                </li>
                <li>
                  <p className="text-lg text-slate-700">
                  Contribute to the development of Regional Strategies for Innovation, Economic Development, Regional Development, and Smart Specialisation, etc
                  </p>
                </li>
                <li>
                  <p className="text-lg text-slate-700">
                  Credibility to develop consortia and proposals for EC funding programmes that complement and accelerate transfer and scaling up activities within and across regions
                  </p>
                </li>
                
              </ul>
              </div>
            
          </div>
        </Section>

     
      {/* Reference Sites item'larını listele */}
      
      {/* Yeni client component ile harita ve liste */}
      <AhaReferenceClient projects={referenceSites} />
      <Footer />
    </>
  );
} 