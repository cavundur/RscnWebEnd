import Image from "next/image";
import Link from "next/link";
import Section from "@/components/Section";
import PageHeader from "@/components/PageHeader";
import wpApi from "@/lib/api/wordpress";
import { Button } from "@/components/ui/button";
import RSCNCard from "@/components/RSCNCard";
import Icon from "@/components/Icon";
import Logo from "@/components/Logo";

export const revalidate = 10; // Her 10 saniyede bir yeniden doğrula (dev modunda test için)

// Medya ID'sinden URL'yi al
async function getImageUrl(mediaId: number | string | undefined, defaultImage: string): Promise<string> {
  console.log(`getImageUrl called with mediaId:`, mediaId);
  
  if (!mediaId) {
    console.log("No mediaId provided, returning default:", defaultImage);
    return defaultImage;
  }
  
  try {
    // Eğer mediaId zaten bir URL ise
    if (typeof mediaId === 'string' && (mediaId.startsWith('http') || mediaId.startsWith('/'))) {
      console.log("mediaId is already a URL:", mediaId);
      return mediaId;
    }
    
    // Değilse, API'den medyayı getir
    console.log("Fetching media with ID:", mediaId);
    const media = await wpApi.getMediaById(Number(mediaId));
    
    if (!media) {
      console.log("Media not found for ID:", mediaId, "using default:", defaultImage);
      return defaultImage;
    }
    
    console.log("Media found:", media.id, "URL:", media.source_url);
    return media.source_url || defaultImage;
  } catch (error) {
    console.error('Failed to get media URL for ID:', mediaId, error);
    return defaultImage;
  }
}

// Yönetim Kurulu örnek üyeleri (ACF Pro ile dinamik olacak)
const executiveBoardMembers = [
  {
    name: "Maddalena ILLARIO",
    role: "Chair",
    image: "/imagesOld/board/Maddalena-I-980x653 (1).jpeg",
    bio: "Board member bio"
  },
  {
    name: "Vincenzo DE LUCA",
    role: "Secretary",
    image: "/imagesOld/board/VdL-Copie (2).jpg",
    bio: "Secretary bio"
  },
  {
    name: "John Doe",
    role: "Member",
    image: "/imagesOld/board/Maddalena-I-980x653 (1).jpeg",
    bio: "Member bio"
  },
  {
    name: "Jane Smith",
    role: "Member",
    image: "/imagesOld/board/VdL-Copie (2).jpg",
    bio: "Member bio"
  },
  {
    name: "Alice Brown",
    role: "Member",
    image: "/imagesOld/board/Maddalena-I-980x653 (1).jpeg",
    bio: "Member bio"
  },
  {
    name: "Bob White",
    role: "Member",
    image: "/imagesOld/board/VdL-Copie (2).jpg",
    bio: "Member bio"
  },
];

export default async function AboutPage() {
  // WordPress'ten about sayfası içeriğini getir
  const aboutPage = await wpApi.getPageBySlug('about');
  const executiveBoard = await wpApi.getPageBySlug('executive-board');
  const secretariat = await wpApi.getPageBySlug('secretariat');
  
  // CPT UI ile oluşturulan About içeriğini getir
  const aboutCPT = await wpApi.getAbout();
  
  // Debug için API yanıtını console'a yazdıralım
  console.log("About Page Data:", aboutPage);
  console.log("About CPT Data:", aboutCPT);
  console.log("About ACF fields:", aboutCPT?.acf);
  console.log("Mission Info:", aboutCPT?.acf?.mission_info);
  console.log("Aims Info:", aboutCPT?.acf?.aims_info);
  console.log("Aims List:", aboutCPT?.acf?.aims_list);
  
  // Öne çıkan görsel URL'si
  let featuredImageUrl;
  
  // Farklı seviyelerde kontrol ederek Featured Image URL'yi bulmaya çalışalım
  if (aboutCPT?._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
    featuredImageUrl = aboutCPT._embedded['wp:featuredmedia'][0].source_url;
    console.log("Featured Image from About CPT:", featuredImageUrl);
  } else if (aboutPage?._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
    featuredImageUrl = aboutPage._embedded['wp:featuredmedia'][0].source_url;
    console.log("Featured Image from About Page:", featuredImageUrl);
  } else {
    featuredImageUrl = "/images/aboutPage2.png"; // WordPress'ten görsel gelmezse statik görseli kullan
    console.log("Using default featured image:", featuredImageUrl);
  }
  
  // Diğer görseller için varsayılan placeholder
  const defaultAboutImage = "/images/placeholder/about-rscn.jpg";
  const defaultMemberImage = "/images/placeholder/member.jpg";
  const defaultStaffImage = "/images/placeholder/staff.jpg";
  
  // About içeriğini birleştir (CPT UI öncelikli)
  console.log("About Page Title:", aboutPage?.title?.rendered);
  console.log("About ACF title:", aboutPage?.acf?.about_title);
  
  // WordPress'te sayfa başlığı "The RSCN", ACF alanında "about_title" değeri "About"
  // Bu nedenle, ACF alanından öncelikli olarak başlığı alıyoruz
  const title = aboutCPT?.acf?.page_subtitle || "About";
  const subtitle = aboutCPT?.acf?.page_description || "Who we are, What we do, How we support AHA Reference Site Regions?";
  const aboutDescription = aboutCPT?.acf?.about_description || aboutPage?.content?.rendered || "";
  
  // Görsel URL'lerini al ve detaylı log'lar ekle
  console.log("Secondary Image (raw):", aboutCPT?.acf?.secondary_image);
  console.log("About Schema Image (raw):", aboutCPT?.acf?.about_schema_image);
  
  const secondaryImageUrl = await getImageUrl(aboutCPT?.acf?.secondary_image, "");
  const aboutSchemaImageUrl = await getImageUrl(aboutCPT?.acf?.about_schema_image, "");
  const supportingAHAImageUrl = await getImageUrl(aboutCPT?.acf?.supporting_aha_image, "");
  const boardMemberImageUrl = await getImageUrl(aboutCPT?.acf?.board_member_image, defaultMemberImage);
  const secretariatMemberImageUrl = await getImageUrl(aboutCPT?.acf?.secretariat_member_image, defaultStaffImage);
  
  // Hata ayıklama için görüntü URL'lerini yazdır
  console.log("Secondary Image URL (sayfanın başı):", secondaryImageUrl || "not set");
  console.log("About Schema Image URL (içerik bölümü):", aboutSchemaImageUrl || "not set");
  
  const mission = aboutCPT?.acf?.mission || "";
  const aims = aboutCPT?.acf?.aims || "";
  const missionTitle = aboutCPT?.acf?.mission_title || "Our Mission";
  const aimsTitle = aboutCPT?.acf?.aims_title || "Our Aims";
  
  // Yeni ACF alanlarını ekle
  const missionInfo = aboutCPT?.acf?.mission_info || "";
  const aimsInfo = aboutCPT?.acf?.aims_info || "";
  const aimsList = aboutCPT?.acf?.aims_list || "";
  
  // Debug için ACF alanlarını kontrol et
  console.log("About CPT ACF fields:", aboutCPT?.acf);
  console.log("Mission Info (raw):", missionInfo);
  console.log("Mission Info (type):", typeof missionInfo);
  console.log("Mission Info (is string):", typeof missionInfo === 'string');
  console.log("Mission Info (is empty):", missionInfo === '');
  console.log("Mission Info (is null):", missionInfo === null);
  console.log("Mission Info (is undefined):", missionInfo === undefined);
  
  const supportingAHATitle = aboutCPT?.acf?.supporting_aha_title || "Supporting AHA Reference Sites";
  const supportingAHADescription = aboutCPT?.acf?.supporting_aha_description || "";
  
  // Debug için aims içeriğini kontrol et
  console.log("Aims content:", aims);
  
  return (
    <PageHeader
      title={title}
      description={subtitle}
      imageUrl={secondaryImageUrl || featuredImageUrl}
      imageAlt={title}
      titleContainerClassName="pageHeaderTitle"
    >
      {/* About Main Content - The RSCN Section */}
      <Section id="rscn" isFirst={true}>
        <div className="grid grid-cols-1 gap-12 items-center">
          <div className="pageContent">
            <h2 className="pageHeaderSection mb-6">{aboutCPT?.acf?.about_title || "About"}</h2>
            <div 
              className="prose max-w-none text-slate-700"
              dangerouslySetInnerHTML={{ __html: aboutDescription }}
            />
          </div>
          <div className="rounded-lg overflow-hidden">
            {aboutSchemaImageUrl ? (
              <div className="aboutSchemaImage">
                <Image
                  src={aboutSchemaImageUrl}
                  alt="About Schema Image"
                  width={800}
                  height={600}
                  className="object-cover w-full h-auto"
                />
                <div className="aboutSchemaImageText">
                  <h2>Triple Win</h2>
                  <p>Overall Regional, National, and Europen Benefits</p>
                </div>
              </div>
            ) : (
              <p className="p-4 text-center text-gray-500">Schema image not available from WordPress</p>
            )}
          </div>
        </div>
      </Section>

      {/* Mission & Vision */}
      <Section className="bg-slate-50" direction="right">
        <div className="grid grid-cols-1 gap-8">
          <div className="p-8 rounded-lg">
            {/*<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="m4.93 4.93 4.24 4.24"></path>
                <path d="m14.83 9.17 4.24-4.24"></path>
                <path d="m14.83 14.83 4.24 4.24"></path>
                <path d="m9.17 14.83-4.24 4.24"></path>
                <circle cx="12" cy="12" r="4"></circle>
              </svg>
            </div>*/}
            <p className="mb-4 headInfoTitle">{missionTitle}</p>
            <div className="prose max-w-none text-slate-700 mb-4 head-info" dangerouslySetInnerHTML={{ __html: missionInfo || '' }} />
            <div className="head-info-line"></div>
            {mission && (
              <div className="prose max-w-none text-slate-700 mission-content" dangerouslySetInnerHTML={{ __html: mission }} />
            )}
          </div>
          
          <div className="p-8 rounded-lg">
            {/*<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </div>*/}
            <p className="mb-4 headInfoTitle">{aimsTitle}</p>
            
            {aimsList && (
              <div className="prose max-w-none text-slate-700 mb-4" dangerouslySetInnerHTML={{ __html: aimsList }} />
            
            )}
            {aimsInfo && (
              <div className="prose max-w-none text-slate-700 mb-4 head-info" dangerouslySetInnerHTML={{ __html: aimsInfo }} />
            )}
            <div className="head-info-line"></div>
            <div className="prose max-w-none text-slate-700 aims-content" dangerouslySetInnerHTML={{ __html: aims }} />
          </div>
        </div>
      </Section>

      {/* Supporting AHA Reference Sites - Title, Logo, Image */}
      <Section id="supporting-aha" className="bgSectionColor" direction="left" maxWidth="max-w-none">
        <div className="flex flex-col items-center py-12">
          {/* Title - Ortalanmış, belirli genişlik */}
          <div className="w-full max-w-4xl px-4 mb-6">
            <p className="mb-4 headInfoTitle">{supportingAHATitle}</p>
            <div className="head-info-line mt-4"></div>
          </div>
          
          

          
          {/* Supporting AHA Image - Ortalanmış */}
          {supportingAHAImageUrl && (
            <div className="w-full flex justify-center px-4">
              <Image
                src={supportingAHAImageUrl}
                alt="Supporting AHA Reference Sites Image"
                width={1000} 
                height={562} 
                className="rounded-lg object-cover w-full max-w-full h-auto"
              />
            </div>
          )}
        </div>
        {/* Kaldırılan Kartlar (Yorumlu) */}
        {/* ... */}
      </Section>

      {/* Supporting AHA Description Section */}
      {supportingAHADescription && (
        <Section id="supporting-aha-description">
          <div 
            className="prose max-w-none text-slate-700 mx-auto"
            dangerouslySetInnerHTML={{ __html: supportingAHADescription }}
          />
        </Section>
      )}

      {/* Executive Board Section */}
      <Section id="executive-board" direction="up" className="bg-slate-50">
        <p className="mb-4 headInfoTitle">{executiveBoard?.title?.rendered || "The Executive Board"}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {executiveBoardMembers.map((member, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform hover:shadow-md">
              <div className="aspect-square relative">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-blue-600 mb-4">{member.role}</p>
                <p className="text-slate-600">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Secretariat Section */}
      <Section id="secretariat" direction="left">
        
        <p className="mb-4 headInfoTitle">{secretariat?.title?.rendered || "Secretariat"}</p>


        {secretariat ? (
          <div 
            className="prose max-w-none mx-auto"
            dangerouslySetInnerHTML={{ __html: secretariat.content.rendered }}
          />
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <h3 className="text-xl font-bold mb-4">About the Secretariat</h3>
              <p className="text-slate-700 mb-4">
                The Secretariat is responsible for the day-to-day operations of the network, 
                facilitating communication between members, coordinating projects, and ensuring 
                the effective implementation of our strategic plan.
              </p>
              <p className="text-slate-700">
                Based in Brussels, the Secretariat serves as the central point of contact for all 
                network activities, providing administrative support, organizing events, and 
                maintaining relationships with partners and stakeholders.
              </p>
            </div>
            
            {/* Tek bir personel örneği */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col md:flex-row">
              <div className="md:w-1/3 aspect-[4/3] md:aspect-auto relative">
                <Image
                  src={secretariatMemberImageUrl}
                  alt="Secretariat Staff"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6 md:w-2/3">
                <h3 className="text-xl font-bold mb-1">{aboutCPT?.acf?.secretariat_member_name || "Jane Doe"}</h3>
                <p className="theme-primary-color mb-4">{aboutCPT?.acf?.secretariat_member_role || "Network Coordinator"}</p>
                <p className="text-slate-600">
                  {aboutCPT?.acf?.secretariat_member_bio || 
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisi aliquam."}
                </p>
                <div className="mt-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 mr-2">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <a href={`mailto:${aboutCPT?.acf?.secretariat_member_email || "contact@example.com"}`} className="text-blue-600 hover:underline theme-primary-color">
                    {aboutCPT?.acf?.secretariat_member_email || "contact@example.com"}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* CTA Section */}
      <Section className="theme-primary-bg text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-6">You Can Contact Us</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Get in touch with us to contribute to our work in the field of active and healthy ageing, 
            collaborate, or learn more about what we do.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg">Contact Us</Button>
            <Link href="/projects">
              <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600" size="lg">
                Explore Our Projects
              </Button>
            </Link>
          </div>
        </div>
      </Section>
    </PageHeader>
  );
} 