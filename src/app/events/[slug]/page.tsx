import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import wpApi, { Event } from "@/lib/api/wordpress";
import Section from "@/components/Section";
import { notFound } from "next/navigation";

export const revalidate = 3600; // Revalidate every hour

interface EventPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  try {
    console.log('Generating metadata for event:', params.slug);
    const event = await wpApi.getEventBySlug(params.slug);
    
    if (!event) {
      return {
        title: "Event Not Found | RSCN",
        description: "The requested event could not be found.",
      };
    }

    // Get title with fallback
    const title = event.acf?.event_title || event.title?.rendered || event.slug?.replace(/-/g, ' ') || "Event";
    const description = event.excerpt?.rendered?.replace(/<[^>]+>/g, '') || "";

    return {
      title: `${title} | RSCN Events`,
      description: description,
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: "Events | RSCN",
      description: "Latest events from RSCN",
    };
  }
}

// Helper function to ensure content preserves HTML formatting
function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  // Log the original HTML to see what's coming from WordPress
  console.log('Original HTML content:', html);
  
  // Remove wpautop issue where <p> tags might be wrapped in additional tags
  let sanitized = html.replace(/<p[^>]*><p>/g, '<p>');
  sanitized = sanitized.replace(/<\/p><\/p>/g, '</p>');
  
  // Ensure paragraphs are properly separated
  sanitized = sanitized.replace(/\n\n/g, '</p><p>');
  
  // Gutenberg galeri sınıflarını korumak ve düzgün render etmek için CSS sınıflarını ekle
  sanitized = sanitized.replace(
    /<figure class="wp-block-gallery([^>]*)>([\s\S]*?)<\/figure>/g, 
    '<figure class="wp-block-gallery$1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-8">$2</figure>'
  );
  
  sanitized = sanitized.replace(
    /<ul class="wp-block-gallery([^>]*)>([\s\S]*?)<\/ul>/g, 
    '<ul class="wp-block-gallery$1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-8 list-none">$2</ul>'
  );
  
  // Galeri içindeki resimlerin sınıflarını düzenle
  sanitized = sanitized.replace(
    /<li class="blocks-gallery-item([^>]*)>([\s\S]*?)<\/li>/g,
    '<li class="blocks-gallery-item$1 rounded-lg overflow-hidden aspect-square relative">$2</li>'
  );
  
  // Check if the content contains any HTML tags
  if (!/<[a-z][\s\S]*>/i.test(sanitized)) {
    // If it's plain text, wrap it in paragraph tags
    sanitized = `<p>${sanitized.replace(/\n/g, '</p><p>')}</p>`;
  }
  
  // Log the sanitized HTML
  console.log('Sanitized HTML content:', sanitized);
  
  return sanitized;
}

// Helper function to format date from various formats
function formatDateFromWordPress(dateString: string): string {
  if (!dateString) return "Unknown date";
  
  console.log('Trying to format date:', dateString);
  
  // Try to handle various date formats
  
  // First try standard ISO format
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (!isNaN(date.getTime())) {
      return new Intl.DateTimeFormat('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }).format(date);
    }
  } catch (e) {
    console.log('Error parsing standard date format:', e);
  }
  
  // Try YYYYMMDD format (commonly used in WordPress ACF)
  if (/^\d{8}$/.test(dateString.replace(/[^0-9]/g, ''))) {
    try {
      const cleanDate = dateString.replace(/[^0-9]/g, '');
      const year = parseInt(cleanDate.substring(0, 4));
      const month = parseInt(cleanDate.substring(4, 6)) - 1; // Months are 0-indexed
      const day = parseInt(cleanDate.substring(6, 8));
      
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return new Intl.DateTimeFormat('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }).format(date);
      }
    } catch (e) {
      console.log('Error parsing YYYYMMDD format:', e);
    }
  }
  
  // If we reach here, return the original string as fallback
  return dateString;
}

// Galeri görüntüleme için yardımcı fonksiyon
function renderGallerySection(event: any) {
  try {
    // Potansiyel galeri alanları
    const galleryFields = [
      'gallery', 'images', 'image_gallery', 'event_gallery', 'event_images', 
      'media', 'photos', 'picture_gallery'
    ];
    
    // ACF alanlarında galeri var mı kontrol et
    const hasGalleryInAcf = event.acf && galleryFields.some(field => {
      try {
        const value = event.acf[field];
        return value && (Array.isArray(value) ? value.length > 0 : typeof value === 'object');
      } catch (err) {
        console.error(`Error checking gallery field ${field}:`, err);
        return false;
      }
    });
    
    // WordPress standart ekleri kontrol et
    const hasAttachments = event._embedded?.['wp:attachment']?.length > 0;
    
    // İçerik içinde <figure class="wp-block-gallery"> var mı kontrol et
    const hasGalleryInContent = event.content?.rendered?.includes('wp-block-gallery');
    
    // Eğer hiçbir galeri yoksa görüntüleme yapma
    if (!hasGalleryInAcf && !hasAttachments && !hasGalleryInContent) return null;
    
    // Debug için galeri tipleri
    console.log('Gallery types found:', {
      hasGalleryInAcf,
      hasAttachments,
      hasGalleryInContent
    });
    
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Image Gallery</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* ACF alanlarındaki resimleri göster */}
          {event.acf && galleryFields.map(fieldName => {
            try {
              const galleryItems = event.acf[fieldName];
              if (!galleryItems) return null;
              
              // Galeri elemanlarını array olarak al
              const items = Array.isArray(galleryItems) 
                ? galleryItems 
                : typeof galleryItems === 'object' 
                  ? Object.values(galleryItems) 
                  : [];
              
              return items.map((item: any, index: number) => {
                try {
                  // Eğer item null veya undefined ise atla
                  if (!item) return null;
                  
                  // Farklı formatlarda gelen resimleri destekle
                  let imageUrl = null;
                  
                  if (typeof item === 'string' && item.startsWith('http')) {
                    // Doğrudan URL formatı
                    imageUrl = item;
                  } else if (item.url) {
                    // ACF standart format
                    imageUrl = item.url;
                  } else if (item.source_url) {
                    // WordPress API formatı
                    imageUrl = item.source_url;
                  } else if (item.guid?.rendered) {
                    // WordPress nesne formatı
                    imageUrl = item.guid.rendered;
                  } else if (item.sizes?.large) {
                    // Eski ACF formatı
                    imageUrl = item.sizes.large;
                  } else if (item.sizes?.medium) {
                    imageUrl = item.sizes.medium;
                  } else if (item.sizes?.full) {
                    imageUrl = item.sizes.full;
                  } else if (item.ID && typeof item.ID === 'number') {
                    // Sadece ID varsa, boş döndür
                    imageUrl = null;
                  } else if (typeof item === 'number') {
                    // Sadece ID varsa, boş döndür
                    imageUrl = null;
                  }
                            
                  if (!imageUrl) return null;
                  
                  const imageAlt = item.alt || 
                                  item.alt_text || 
                                  item.title || 
                                  (item.title?.rendered) || 
                                  'Gallery image';
                  
                  return (
                    <div key={`${fieldName}-${index}`} className="aspect-square relative rounded-lg overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={imageAlt}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  );
                } catch (err) {
                  console.error(`Error rendering gallery item ${index} in ${fieldName}:`, err);
                  return null;
                }
              });
            } catch (err) {
              console.error(`Error processing gallery field ${fieldName}:`, err);
              return null;
            }
          })}
          
          {/* WordPress eklerini göster */}
          {event._embedded?.['wp:attachment']?.map((attachment: any, index: number) => {
            try {
              // source_url yoksa veya boş string ise atla
              if (!attachment?.source_url || attachment.source_url === '') return null;
              
              return (
                <div key={`attachment-${index}`} className="aspect-square relative rounded-lg overflow-hidden">
                  <Image
                    src={attachment.source_url}
                    alt={attachment.alt_text || attachment.title?.rendered || 'Attachment image'}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              );
            } catch (err) {
              console.error(`Error rendering attachment ${index}:`, err);
              return null;
            }
          })}
        </div>
      </div>
    );
  } catch (err) {
    console.error('Error rendering gallery section:', err);
    return null;
  }
}

export default async function EventDetailPage({ params }: EventPageProps) {
  try {
    console.log('Fetching event detail for slug:', params.slug);
    const event = await wpApi.getEventBySlug(params.slug);
    
    if (!event) {
      notFound();
    }
    
    // Debug log to see the exact structure of the event data
    console.log('Event data structure:', {
      hasContent: !!event?.content,
      contentType: event?.content ? typeof event.content : 'undefined',
      contentRendered: event?.content?.rendered ? 'exists' : 'missing',
      contentLength: event?.content?.rendered?.length || 0,
      acfFields: event?.acf ? Object.keys(event.acf) : [],
      eventKeys: Object.keys(event),
      rawContent: event?.content?.rendered || '(no content)',
    });

    // Debug log for location fields specifically
    console.log('Location fields:', {
      event_location: event.acf?.event_location,
      location: event.acf?.location,
      locationFieldExists: 'location' in (event.acf || {}),
      eventLocationFieldExists: 'event_location' in (event.acf || {}),
      allAcfValues: event.acf
    });

    // Galeri için debug log
    console.log('Gallery related fields:', {
      acf: event?.acf,
      hasGallery: event?.acf?.gallery ? true : false,
      galleryItems: event?.acf?.gallery,
      hasImages: event?.acf?.images ? true : false,
      imagesItems: event?.acf?.images,
    });

    // Get title with more fallback options
    let title = "";
    if (event.acf?.event_title && event.acf.event_title.length > 0) {
      console.log('Using ACF event_title field');
      title = event.acf.event_title;
    } else if (event.title?.rendered && event.title.rendered.length > 0) {
      console.log('Using standard title.rendered field');
      title = event.title.rendered;
    } else if (event.slug) {
      console.log('Reconstructing title from slug');
      // Convert slug to title case (e.g., "my-post-slug" to "My Post Slug")
      title = event.slug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l: string) => l.toUpperCase());
    } else {
      console.log('Using default title');
      title = "Event";
    }
    
    // Try multiple sources for content with detailed fallbacks
    let content = '';
    
    // First check regular content field
    if (event.content?.rendered && event.content.rendered.length > 0) {
      console.log('Using standard content.rendered field');
      content = sanitizeHtml(event.content.rendered);
    } 
    // Then check ACF fields
    else if (event.acf?.events_description && event.acf.events_description.length > 0) {
      console.log('Using ACF events_description field');
      content = sanitizeHtml(event.acf.events_description);
    }
    // Then check event_description as another ACF field
    else if (event.acf?.event_description && event.acf.event_description.length > 0) {
      console.log('Using ACF event_description field');
      content = sanitizeHtml(event.acf.event_description);
    }
    // Then check description as another ACF field
    else if (event.acf?.description && event.acf.description.length > 0) {
      console.log('Using ACF description field');
      content = sanitizeHtml(event.acf.description);
    }
    // Then check excerpt as a fallback
    else if (event.excerpt?.rendered && event.excerpt.rendered.length > 0) {
      console.log('Using excerpt.rendered as content');
      content = sanitizeHtml(event.excerpt.rendered);
    }
    // If all else fails, use a default message
    else {
      console.log('No content found, using default message');
      content = "<p>No content available for this event.</p>";
    }
    
    // Get featured image if it exists (no placeholder)
    const hasFeaturedImage = event._embedded?.["wp:featuredmedia"]?.[0]?.source_url ? true : false;
    const featuredImageUrl = event._embedded?.["wp:featuredmedia"]?.[0]?.source_url || '';
    const featuredImageAlt = event._embedded?.["wp:featuredmedia"]?.[0]?.alt_text || title;
    
    // Get event date with fallback
    const eventDate = event.acf?.event_date || event.date;

    // Make sure we always have a date to display
    const formattedDate = formatDateFromWordPress(eventDate);

    return (
      <main className="pt-20">
        <Section noPadding>
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <Link 
                href="/events"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
              >
                ← Back to Events
              </Link>
              
              {/* Featured image only if it exists */}
              {hasFeaturedImage && featuredImageUrl && (
                <div className="aspect-video relative w-full mb-8 rounded-lg overflow-hidden">
                  <Image
                    src={featuredImageUrl}
                    alt={featuredImageAlt}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}
              
              {/* Galeri görüntüleme - tüm olası alanları kontrol ediyoruz */}
              {renderGallerySection(event)}
              
              {/* Main content area - flex container */}
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                {/* Left column: Title and Content */}
                <div className="flex-grow md:w-2/3">
                  <h1 className="text-3xl md:text-4xl font-bold mb-6" dangerouslySetInnerHTML={{ __html: title }}></h1>
                  
                  {/* Render content with enhanced HTML formatting */}
                  {content ? (
                    <article 
                      className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:mb-4 prose-p:my-4" 
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  ) : (
                    <div className="prose max-w-none">
                      <p className="text-gray-500 italic">No content available for this event.</p>
                    </div>
                  )}
                </div>
                
                {/* Right column: Event Details */}
                <div className="md:w-1/3">
                  <div className="bg-slate-50 p-6 rounded-lg sticky top-24">
                    <h3 className="text-lg font-bold mb-4">Event Details</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Date</p>
                        <p>{formattedDate}</p>
                      </div>
                      
                      {event.acf?.event_time && (
                        <div>
                          <p className="text-sm font-medium text-slate-600">Time</p>
                          <p>{event.acf.event_time}</p>
                        </div>
                      )}
                      
                      {/* Konum bilgisi - tüm olası alanları kontrol ediyoruz */}
                      {(event.acf?.event_location || event.acf?.location || event.acf?.lokasyon) && (
                        <div>
                          <p className="text-sm font-medium text-slate-600">Location</p>
                          <p>{event.acf?.event_location || event.acf?.location || event.acf?.lokasyon}</p>
                        </div>
                      )}
                      
                      {event.acf?.event_registration_link && (
                        <div>
                          <p className="text-sm font-medium text-slate-600">Registration</p>
                          <a 
                            href={event.acf.event_registration_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Register Now
                          </a>
                        </div>
                      )}
                      
                      {event.acf?.event_organizer && (
                        <div>
                          <p className="text-sm font-medium text-slate-600">Organizer</p>
                          <p>{event.acf.event_organizer}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </main>
    );
  } catch (error) {
    console.error('Error fetching event detail:', error);
    return (
      <main className="pt-20">
        <Section noPadding>
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <Link 
                href="/events" 
                className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
              >
                ← Back to Events
              </Link>
              <div className="mt-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">Error</h1>
                <p className="text-red-500">Error loading event. Please try again later.</p>
              </div>
            </div>
          </div>
        </Section>
      </main>
    );
  }
}

export async function generateStaticParams() {
  try {
    const events = await wpApi.getEvents();
    
    return events.map((event: any) => ({
      slug: event.slug,
    }));
  } catch (error) {
    console.error('Error generating static params for events:', error);
    return [];
  }
} 