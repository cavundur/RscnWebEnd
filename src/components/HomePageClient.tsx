'use client';

import Image from "next/image";
import Link from "next/link";
import Section from "@/components/Section";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import styles from "@/components/PageHeader.module.scss";
import SocialMediaLinks from "@/components/SocialMediaLinks";
import AnimatedCards from "@/components/AnimatedCards";
import EventsNewsCarousel from "@/components/EventsNewsCarousel";
import type { IconName } from "@/components/Icon";
import type { Post as WPPost } from "@/lib/api/wordpress";
import AnimatedDiv from "@/components/AnimatedDiv";

// Post tipini genişlet
interface Post extends WPPost {
  itemType?: 'events' | 'news';
}

interface AboutCardData {
  card_title: string;
  card_description: string;
}

interface HomePageClientProps {
  homePageData: any;
  eventsData: Post[];
  aboutSectionCardsData: AboutCardData[];
  aboutSectionBackgroundImageUrl: string;
  aboutSectionTitle: string;
  aboutSectionDescription: string;
  contactSectionTitle: string;
  contactInfoTitle: string;
  contactInfoDescription: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  contactFormNameLabel: string;
  contactFormEmailLabel: string;
  contactFormSubjectLabel: string;
  contactFormMessageLabel: string;
  contactFormSubmitLabel: string;
  heroTitle: string;
  heroDescription: string;
  featuredImageUrl: string;
  heroImageAlt: string;
  sloganImageUrl: string;
  sloganImageData: any;
  projects: any[]; // Son 3 proje
}

const cardIcons: IconName[] = [
  "harita",
  "konusma",
  "bina",
  "fuze",
  "egitim",
  "grup"
];

// Açıklama metnini HTML'den arındırıp kısaltan fonksiyon (projects/page.tsx ile aynı)
function getShortText(html: string, maxLength = 180): string {
  if (!html) return '';
  // Basit bir regex ile HTML etiketlerini temizle
  const clean = html.replace(/<[^>]+>/g, '');
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength).trim() + '...';
}

export default function HomePageClient({
  homePageData,
  eventsData,
  aboutSectionCardsData,
  aboutSectionBackgroundImageUrl,
  aboutSectionTitle,
  aboutSectionDescription,
  contactSectionTitle,
  contactInfoTitle,
  contactInfoDescription,
  contactPhone,
  contactEmail,
  contactAddress,
  contactFormNameLabel,
  contactFormEmailLabel,
  contactFormSubjectLabel,
  contactFormMessageLabel,
  contactFormSubmitLabel,
  heroTitle,
  heroDescription,
  featuredImageUrl,
  heroImageAlt,
  sloganImageUrl,
  sloganImageData,
  projects
}: HomePageClientProps) {
  return (
    <div className="home">
      {/* Dinamik Hero Section - WordPress'ten gelen veri */}
      <PageHeader
        title={heroTitle}
        description={heroDescription}
        imageUrl={featuredImageUrl}
        imageAlt={heroImageAlt}
        titleContainerClassName="text-left"
        variant="home"
        socialLinks={<SocialMediaLinks className="SocialMediaLinks" />}
      >
        {sloganImageData ? (
          <AnimatedDiv className="sloganImage" direction="down">
            <Image
              src={sloganImageUrl}
              alt="Slogan"
              width={300}
              height={100}
              className="slogan-image"
            />
          </AnimatedDiv>
        ) : (
          <div className="slogan-text">
            <h2 className="text-2xl font-light text-white">Stronger Together</h2>
          </div>
        )}
      </PageHeader>


      {/* About Section - FLUID background ve overlay */}
      <div
        className="w-full bg-cover bg-center relative text-white"
        style={{ backgroundImage: `url('${aboutSectionBackgroundImageUrl}')`, backgroundPosition: 'top', height:'120vh' }}
      >
        <div className="absolute inset-0 z-0"></div>
        <div className="overlay"></div>
        <Section id="about" className="relative z-10 py-0">
          <div className="container mx-auto max-w-7xl">
            <AnimatedCards cards={aboutSectionCardsData.map((card, i) => ({ ...card, icon: cardIcons[i] }))} />
          </div>
        </Section>
      </div>

      <AnimatedDiv id="aboutAs" className="relative z-10 py-0">
        <div className="container mx-auto px-4 max-w-4xl homeAboutText">
          {aboutSectionTitle && (
            <p>
              {aboutSectionTitle}
            </p>
          )}
          {aboutSectionDescription && (
            <div 
              className="prose prose-lg prose-invert mx-auto text-gray-100" 
              dangerouslySetInnerHTML={{ __html: aboutSectionDescription }} 
            />
          )}
          {/* See More Button */}
          <div className="flex justify-left mt-8">
            <Link href="/about">
              <Button 
                variant="outline" 
                className="bg-transparent border-white text-white hover:bg-white hover:text-black transition-all duration-300 rounded-xl"
              >
                See More
              </Button>
            </Link>
          </div>
        </div>
      </AnimatedDiv>

      {/*<Section id="aboutAs" className="relative z-10 py-0" direction="up">
        <div className="container mx-auto px-4 max-w-4xl homeAboutText">
          {aboutSectionTitle && (
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
              {aboutSectionTitle}
            </h2>
          )}
          {aboutSectionDescription && (
            <div 
              className="prose prose-lg prose-invert mx-auto text-gray-100" 
              dangerouslySetInnerHTML={{ __html: aboutSectionDescription }} 
            />
          )}
        </div>
      </Section>*/}

      {/* Events & News Section */}
      <AnimatedDiv id="events-news" className="bg-slate-50 py-10 overflow-hidden">
        <div className="container mx-auto px-4 max-w-4xl mb-8 mt-8 text-left">
          <p className="text-4xl">Events & News</p>
        </div>
        <EventsNewsCarousel items={eventsData} maxItems={10} />
      </AnimatedDiv>

      {/* Projeler Section */}
      <Section id="projeler">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-0 homeProjectsTitle">
            <h2 className="text-3xl font-bold text-left">Our latest projects</h2>
            <p className="text-lg">RSCN involvment in EU projects</p>
            <div className="homeProjectsDivider"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {projects.slice(0, 3).map((project) => {
              const title = project.title;
              const imageUrl = project.imageUrl;
              const description = project.description || '';
              const shortDescription = getShortText(description, 180);
              return (
                <div
                  key={project.id}
                  className="bg-white items-start rounded-xl border-2 flex flex-col items-center p-6 min-h-[370px]"
                  style={{ borderColor: 'var(--theme-primary-light-text)' }}
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
                  <p className="text-gray-600 text-sm text-center mb-4 flex-1">
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

      {/* İletişim Section */}
      <Section id="iletisim" className="bg-slate-900 text-white" direction="up">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">{contactSectionTitle}</h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <h3 className="text-xl font-semibold mb-4">{contactInfoTitle}</h3>
              <p className="mb-6">
                {contactInfoDescription}
              </p>
              <div className="space-y-4">
                {contactPhone && (
                  <div className="flex items-center gap-3">
                    <span>{contactPhone}</span>
                  </div>
                )}
                {contactEmail && (
                  <div className="flex items-center gap-3">
                    <a href={`mailto:${contactEmail}`} className="hover:text-blue-400 transition-colors">{contactEmail}</a>
                  </div>
                )}
                {contactAddress && (
                  <div className="flex items-center gap-3">
                    <span>{contactAddress}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="md:w-1/2 bg-slate-800 p-6 rounded-lg">
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block mb-1 text-sm">{contactFormNameLabel}</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      className="w-full bg-slate-700 border-slate-600 rounded-md p-2 text-white"
                      suppressHydrationWarning={true}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block mb-1 text-sm">{contactFormEmailLabel}</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      className="w-full bg-slate-700 border-slate-600 rounded-md p-2 text-white"
                      suppressHydrationWarning={true}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block mb-1 text-sm">{contactFormSubjectLabel}</label>
                  <input 
                    type="text" 
                    id="subject" 
                    name="subject" 
                    className="w-full bg-slate-700 border-slate-600 rounded-md p-2 text-white"
                    suppressHydrationWarning={true}
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block mb-1 text-sm">{contactFormMessageLabel}</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    rows={4} 
                    className="w-full bg-slate-700 border-slate-600 rounded-md p-2 text-white"
                    suppressHydrationWarning={true}
                  ></textarea>
                </div>
                <Button type="submit" className="w-full">{contactFormSubmitLabel}</Button>
              </form>
            </div>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold">LOGO</h2>
            </div>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-blue-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </Link>
              <Link href="#" className="hover:text-blue-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </Link>
              <Link href="#" className="hover:text-blue-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-6 pt-6 text-center text-sm text-slate-400">
            &copy; 2024 Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
} 