"use client";

import Link from "next/link";
import { Post as WPPost } from "@/lib/api/wordpress";
import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import styles from "./EventsNewsCarousel.module.scss";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// CarouselApi tipini doğru şekilde tanımla
type CarouselApi = UseEmblaCarouselType[1];

// Post tipini genişlet
interface Post extends WPPost {
  itemType?: 'events' | 'news';
}

interface EventsNewsCarouselProps {
  items: Post[];
  maxItems?: number;
  type?: 'events' | 'news';
}

// Tarih formatları - server-client uyumlu
function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  // Tarihi düzenli formatta göster (gün-ay-yıl)
  if (typeof dateString === 'string') {
    // Tarihin format kontrolü
    const numericDate = dateString.replace(/[^0-9]/g, '');
    
    // YYYYMMDD formatında WordPress özel tarih formatı kontrolü (örn: 20250508)
    if (numericDate.length === 8 && !dateString.includes('-')) {
      try {
        const year = numericDate.substring(0, 4);
        const month = numericDate.substring(4, 6);
        const day = numericDate.substring(6, 8);
        
        // Ay ismini sabit liste ile al
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'];
        const monthIndex = parseInt(month) - 1;
        
        if (monthIndex >= 0 && monthIndex < 12) {
          // Örnek: 8 May, 2025
          return `${parseInt(day)} ${monthNames[monthIndex]}, ${year}`;
        }
      } catch (error) {
        // Hata durumunda orijinal string'i döndür
      }
    }
    
    // Normal ISO formatı kontrol et
    try {
      const date = new Date(dateString);
      
      // Geçerli tarih kontrolü
      if (isNaN(date.getTime())) {
        return dateString; // Geçersizse raw string'i göster
      }
      
      // Tarihi formatla - gün ay, yıl olarak (23 January, 2023)
      const day = date.getDate();
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      
      return `${day} ${month}, ${year}`;
    } catch (error) {
      return dateString; // Hata durumunda raw string'i göster
    }
  }
  
  return String(dateString); // String değilse stringe çevir ve göster
}

// HTML etiketlerini temizleme fonksiyonu
function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

// Kart içeriğini ayrı bir bileşene çıkardık
const EventCardContent = ({ event, type = 'events' }: { event: Post; type?: 'events' | 'news' }) => {
  try {
    // Öğenin tipini belirle - itemType özelliğini server'da ekledik
    const itemType = event.itemType || type;
    
    // News için özel alanları kontrol et
    const title = itemType === 'news' ? event.acf?.news_title || event.title.rendered : event.title.rendered;
    
    // Açıklama için birden fazla alanı kontrol et
    let description = '';
    
    // Events için açıklama alanlarını kontrol et
    if (itemType === 'events') {
      description = event.acf?.events_description || 
                    event.acf?.description || 
                    event.excerpt?.rendered || 
                    event.content?.rendered || 
                    'No description available';
    } else {
      // News için açıklama alanlarını kontrol et
      description = event.acf?.description || 
                    event.excerpt?.rendered || 
                    event.content?.rendered || 
                    'No description available';
    }
    
    // HTML etiketleri temizle ve açıklamayı görünür hale getir
    const cleanDescription = stripHtml(description);
    
    // Tarih alanını kontrol et
    let eventDate = '';
    if (itemType === 'events') {
      // Events için tarih alanı
      eventDate = event.acf?.event_date || event.date;
    } else {
      // News için tarih alanı
      eventDate = event.acf?.publication_date || event.date;
    }
    
    // Türe göre etiket metni ve rengi
    const typeLabel = itemType === 'events' ? 'Event' : 'News';
    const typeColor = itemType === 'events' ? 'text-[var(--napoli-blue)]' : 'text-[var(--navy-color-alt)]';

    return (
      <Card className={`${styles.carouselCard} h-full flex flex-col`}>
        <CardHeader className="pb-0 relative">
          <div className="flex items-center mb-1">
            <div className={`${styles.cardDate}`}>
              {formatDate(eventDate)}
            </div>
            <span className={`${styles.cardTypeSeparator}`}>-</span>
            <div className={`${typeColor} ${styles.cardType}`}>
              {typeLabel}
            </div>
          </div>
          <CardTitle>
            <div className={`${styles.cardTitle}`} dangerouslySetInnerHTML={{ __html: title }} />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 flex-grow">
          {cleanDescription ? (
            <div className="text-gray-600 text-sm line-clamp-3">
              {cleanDescription}
            </div>
          ) : (
            <div className="text-gray-400 text-sm italic">
              No description available
            </div>
          )}
        </CardContent>
        <CardFooter className="mt-auto pt-2">
          <Link href={`/${itemType}/${event.slug}`}>
            <Button 
              variant="outline" 
              className="bg-white text-[var(--napoli-blue)] border-none hover:bg-[var(--napoli-blue)] hover:text-white transition-all duration-300 text-xs rounded-xl"
            >
              Read More
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  } catch (error) {
    console.error('EventCardContent render error:', error);
    return (
      <Card className="h-full overflow-hidden">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Error loading content</p>
        </CardContent>
      </Card>
    );
  }
};

export default function EventsNewsCarousel({ items, maxItems = 10, type = 'events' }: EventsNewsCarouselProps) {
  // En yeni içeriklerle sınırlı
  const carouselItems = items?.slice(0, maxItems) || [];
  
  // Carousel state management
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  // Dots click handler - 2'şer kart kayması için
  const scrollTo = useCallback((index: number) => {
    api?.scrollTo(index);
  }, [api]);

  if (!items) {
    return (
      <div className="w-full text-center py-10">
        <p>Loading content...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: false,
          slidesToScroll: 2, // 2'şer kart kayacak
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4 pl-4 md:pl-8 lg:pl-12">
          {carouselItems.length > 0 ? (
            carouselItems.map((item) => (
              <CarouselItem 
                key={`${item.itemType || type}-${item.id}`} 
                className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-2/5 lg:basis-2/5 "
              >
                <EventCardContent event={item} type={type} />
              </CarouselItem>
            ))
          ) : (
            <CarouselItem key="no-content" className="pl-2 md:pl-4">
              <div className="w-full text-center py-10">
                <p>No content available.</p>
              </div>
            </CarouselItem>
          )}
        </CarouselContent>
      </Carousel>
      
      {/* Beyaz Dots Pagination - Responsive */}
      {count > 1 && (
        <div className="flex items-center justify-center mt-6 space-x-2 md:space-x-3">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`rounded-full transition-all duration-300 ${
                index + 1 === current
                  ? 'w-4 h-4 md:w-5 md:h-5 scale-[1.2]' // Aktif dot: 1.2 kat büyük, napoli-blue
                  : 'w-3 h-3 md:w-4 md:h-4 bg-white/60 hover:bg-white/80' // Pasif dot: şeffaf beyaz
              }`}
              style={index + 1 === current ? { backgroundColor: 'var(--napoli-blue)' } : undefined}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
} 