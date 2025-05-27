import Image from "next/image";
import Link from "next/link";
import Section from "@/components/Section";
import PageHeader from "@/components/PageHeader";
import wpApi, { Post as WPPost } from "@/lib/api/wordpress";
import { Button } from "@/components/ui/button";
import styles from "@/components/PageHeader.module.scss";
import SocialMediaLinks from "@/components/SocialMediaLinks";
import AnimatedCards from "@/components/AnimatedCards";
import EventsNewsCarousel from "@/components/EventsNewsCarousel";
import type { IconName } from "@/components/Icon";
import AnimatedDiv from "@/components/AnimatedDiv";
import HomePageClient from "@/components/HomePageClient";

// Post tipini genişlet
interface Post extends WPPost {
  itemType?: 'events' | 'news';
}

interface AboutCardData {
  card_title: string;
  card_description: string;
}

// Medya ID'sinden URL'yi al
async function getImageUrl(mediaId: number | string | undefined, defaultImage: string): Promise<string> {
  if (typeof mediaId === 'string' && (mediaId.startsWith('http') || mediaId.startsWith('/'))) return mediaId;
  if (!mediaId) return defaultImage;
  try {
    const media = await wpApi.getMediaById(Number(mediaId));
    return media?.source_url || defaultImage;
  } catch (error) {
    console.error('Media URL Error:', error);
    return defaultImage;
  }
}

const cardIcons: IconName[] = [
  "harita",
  "konusma",
  "bina",
  "fuze",
  "egitim",
  "grup"
];

// Server component
export default async function HomePage() {
  try {
    // Home sayfasının verilerini çek
    const homePage = await wpApi.getPageBySlug('home');
    
    // Events verileri çek
    const eventsData = await wpApi.getEvents();
    
    // News verileri çek - hem standart posts hem de news post type'ını kontrol et
    const newsResponse = await wpApi.getPosts(1);
    const newsData = newsResponse.posts || [];
    
    // News tipi özel veri varsa onu da çek
    let newsCustomData: WPPost[] = [];
    try {
      // Doğrudan wpApi.getPosts'u kullanarak daha güvenli şekilde isteği yapalım
      const newsCustomResponse = await wpApi.getPosts(1, undefined, 'news');
      if (newsCustomResponse && newsCustomResponse.posts) {
        newsCustomData = newsCustomResponse.posts || [];
        console.log('Custom news data fetched:', newsCustomData.length);
      }
    } catch (error) {
      console.log('No custom news endpoint available, using regular posts only');
    }
    
    // Her event post'una type: 'events' ekle
    const eventsWithType = eventsData?.map((event: WPPost) => ({
      ...event,
      itemType: 'events' // Tip bilgisini ekle
    })) || [];
    
    // Her news post'una type: 'news' ekle (hem normal hem custom)
    const newsWithType = [...newsData, ...newsCustomData].map((news: WPPost) => ({
      ...news,
      itemType: 'news' // Tip bilgisini ekle
    })) || [];
    
    // Events ve News verilerini birleştir
    const combinedItems = [...eventsWithType, ...newsWithType];
    
    // Tüm içerikleri tarihe göre sırala (en yeni en önce)
    const sortedItems = combinedItems.sort((a: Post, b: Post) => {
      // Event tarihi
      const dateA = a.acf?.event_date || a.acf?.publication_date || a.date;
      const dateB = b.acf?.event_date || b.acf?.publication_date || b.date;
      
      // Tarihleri karşılaştır
      const timeA = new Date(dateA).getTime();
      const timeB = new Date(dateB).getTime();
      
      // Geçersiz tarihler için son güncel tarihi kullan
      return isNaN(timeA) || isNaN(timeB) 
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : timeB - timeA;
    });

    // Gerekli verileri çıkar
    const defaultTitle = homePage?.title?.rendered || "Welcome to RSCN";
    const acf = homePage?.acf || {};

    // Hero Section Data
    const heroTitle = acf.hero_title || defaultTitle;
    const heroDescription = acf.hero_description || "Default description from WP or code.";
    const heroButtonText = acf.hero_button_text || "Learn More";
    const heroButtonLink = acf.hero_button_link || "/about";
    const sloganImageId = acf.hero_slogan_image;
    const sloganImageData = sloganImageId ? await wpApi.getMediaById(Number(sloganImageId)) : null;
    const sloganImageUrl = sloganImageData?.source_url || "/images/placeholder/slogan.png";

    // Hero Image Data
    const heroImageId = acf.hero_image;
    const heroImageDataFromApi = heroImageId ? await wpApi.getMediaById(Number(heroImageId)) : null;
    const featuredImageUrl = heroImageDataFromApi?.source_url || "/images/placeholder/hero.jpg";
    const heroImageAlt = heroImageDataFromApi?.alt_text || acf.hero_image?.alt || acf.hero_title || defaultTitle;

    // İletişim Bölümü ACF Alanları
    const contactSectionTitle = acf.contact_section_title || "Get in Touch";
    const contactInfoTitle = acf.contact_info_title || "Contact Us";
    const contactInfoDescription = acf.contact_info_description || "If you have any questions or projects, feel free to reach out. We will get back to you as soon as possible.";
    const contactPhone = acf.contact_phone || "+1 123 456 7890";
    const contactEmail = acf.contact_email || "info@example.com";
    const contactAddress = acf.contact_address || "City, Country";
    const contactFormNameLabel = acf.contact_form_name_label || "Name";
    const contactFormEmailLabel = acf.contact_form_email_label || "Email";
    const contactFormSubjectLabel = acf.contact_form_subject_label || "Subject";
    const contactFormMessageLabel = acf.contact_form_message_label || "Message";
    const contactFormSubmitLabel = acf.contact_form_submit_label || "Submit";

    // About Section Data
    const aboutSectionBackgroundImageId = acf.about_imaj;
    const aboutSectionBackgroundImageUrl = aboutSectionBackgroundImageId 
      ? await getImageUrl(aboutSectionBackgroundImageId, '/images/placeholder/about-bg.jpg')
      : '/images/placeholder/about-bg.jpg';

    // About Cards Data
    const aboutSectionCardsData = [
      {
        card_title: acf.reference_site_card || "Reference Site Card",
        card_description: acf.reference_site_card_description || "Accredited AHA Reference Site Regions"
      },
      {
        card_title: acf.citizens_card || "Citizens Card",
        card_description: acf.citizens_card_description || "Citizens"
      },
      {
        card_title: acf.public_authorities_card || "Public Authorities Card",
        card_description: acf.public_authorities_card_description || "Public Authorities, Hospitals, Primary and Community Care Providers, Social Care Providers"
      },
      {
        card_title: acf.smes_and_start_card || "SMEs and Start-ups Card",
        card_description: acf.smes_and_start_card_description || "SMEs and Start-ups"
      },
      {
        card_title: acf.universities_card || "Universities Card",
        card_description: acf.universities_card_description || "Universities, Colleges, and research centers"
      },
      {
        card_title: acf.patient_card || "Patient Card",
        card_description: acf.patient_card_description || "Voluntary and community Groups"
      }
    ];

    const aboutSectionTitle = acf.about_title_s || "About Our Network";
    const aboutSectionDescription = acf.about_description_s || "<p>Default description about our network. This content can be managed from WordPress.</p>";

    // Projeleri çek
    const allProjects = await wpApi.getProjects();
    // Görsel bulma algoritması (projects/page.tsx ile aynı)
    const projects = await Promise.all(
      allProjects.slice(0, 3).map(async (project: any) => {
        let imageUrl = null;
        if (Array.isArray(project.acf?.project_images) && project.acf.project_images.length > 0) {
          const firstImage = project.acf.project_images[0];
          if (typeof firstImage === "object" && firstImage.url) {
            imageUrl = firstImage.url;
          } else if (typeof firstImage === "number") {
            const media = await wpApi.getMediaById(firstImage);
            imageUrl = media?.source_url || null;
          }
        }
        if (!imageUrl && project._embedded?.["wp:featuredmedia"]?.[0]?.source_url) {
          imageUrl = project._embedded["wp:featuredmedia"][0].source_url;
        }
        if (!imageUrl && project.featured_media && project.featured_media > 0) {
          const media = await wpApi.getMediaById(project.featured_media);
          imageUrl = media?.source_url || null;
        }
        return {
          id: project.id,
          slug: project.slug,
          title: project.acf?.project_title || project.title.rendered,
          description: project.acf?.description || project.excerpt?.rendered || "",
          imageUrl,
        };
      })
    );

    return (
      <HomePageClient
        homePageData={homePage}
        eventsData={sortedItems}
        aboutSectionCardsData={aboutSectionCardsData}
        aboutSectionBackgroundImageUrl={aboutSectionBackgroundImageUrl}
        aboutSectionTitle={aboutSectionTitle}
        aboutSectionDescription={aboutSectionDescription}
        contactSectionTitle={contactSectionTitle}
        contactInfoTitle={contactInfoTitle}
        contactInfoDescription={contactInfoDescription}
        contactPhone={contactPhone}
        contactEmail={contactEmail}
        contactAddress={contactAddress}
        contactFormNameLabel={contactFormNameLabel}
        contactFormEmailLabel={contactFormEmailLabel}
        contactFormSubjectLabel={contactFormSubjectLabel}
        contactFormMessageLabel={contactFormMessageLabel}
        contactFormSubmitLabel={contactFormSubmitLabel}
        heroTitle={heroTitle}
        heroDescription={heroDescription}
        featuredImageUrl={featuredImageUrl}
        heroImageAlt={heroImageAlt}
        sloganImageUrl={sloganImageUrl}
        sloganImageData={sloganImageData}
        projects={projects || []}
      />
    );
  } catch (error) {
    console.error('HomePage Error:', error);
    return (
      <div className="home">
        <PageHeader
          title="Error"
          description="An error occurred while loading the page."
          imageUrl="/images/placeholder/hero.jpg"
          imageAlt="Error Image"
          titleContainerClassName="text-left"
          variant="home"
          socialLinks={<SocialMediaLinks className="SocialMediaLinks" />}
        >
          <div className="slogan-text">
            <h2 className="text-2xl font-light text-white">Stronger together</h2>
          </div>
        </PageHeader>
      </div>
    );
  }
}
