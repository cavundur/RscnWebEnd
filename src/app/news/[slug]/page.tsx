import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import wpApi from "@/lib/api/wordpress";
import Section from "@/components/Section";
import { convertToProxyUrl } from '@/lib/utils';

export const revalidate = 3600; // Revalidate every hour

interface NewsPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  try {
    console.log('Generating metadata for news:', params.slug);
    // Check both posts and news endpoints
    let post = await wpApi.getPostBySlug(params.slug, 'posts');
    
    if (!post) {
      return {
        title: "News Not Found | RSCN",
        description: "The requested news article could not be found.",
      };
    }

    // Get title from news_title in ACF if available, otherwise use default title
    const title = typeof post.acf?.news_title === 'string' 
      ? post.acf.news_title 
      : typeof post.title?.rendered === 'string'
        ? post.title.rendered
        : typeof post.slug === 'string'
          ? post.slug.replace(/-/g, ' ')
          : "News Article";

    const description = typeof post.excerpt?.rendered === 'string'
      ? post.excerpt.rendered.replace(/<[^>]+>/g, '')
      : "Latest news and updates from RSCN";

    return {
      title: `${title} | RSCN News`,
      description: description,
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: "News | RSCN",
      description: "Latest news and updates from RSCN",
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

// İçerik içindeki WordPress Medya ID'lerini çıkaran yardımcı fonksiyon
function extractMediaIds(content: string): number[] {
  const mediaIds: number[] = [];
  
  // wp-image-123 formatındaki ID'leri bul
  const wpImageRegex = /wp-image-(\d+)/g;
  let match;
  while ((match = wpImageRegex.exec(content)) !== null) {
    mediaIds.push(parseInt(match[1], 10));
  }
  
  // data-id="123" formatındaki ID'leri bul
  const dataIdRegex = /data-id="(\d+)"/g;
  while ((match = dataIdRegex.exec(content)) !== null) {
    mediaIds.push(parseInt(match[1], 10));
  }
  
  // class="wp-block-gallery... formatındaki galerileri bul
  // Bu daha karmaşık, içeriği basitçe kontrol ediyoruz
  const hasGallery = content.includes('wp-block-gallery') || 
                     content.includes('gallery') ||
                     content.includes('wp-block-image');
  
  console.log('İçerik içinde bulunan medya ID\'leri:', mediaIds);
  console.log('İçerik içinde galeri var mı?', hasGallery);
  
  return mediaIds;
}

// Galeri görüntüleme için yardımcı fonksiyon
function renderGallerySection(post: any) {
  try {
    // Potansiyel galeri alanları
    const galleryFields = [
      'gallery', 'images', 'image_gallery', 'news_gallery', 'news_images', 
      'media', 'photos', 'picture_gallery'
    ];

    // ACF'nin içindeki tüm anahtarları kontrol edelim
    console.log('Tüm ACF anahtarları:', post?.acf ? Object.keys(post.acf) : []);
    
    // ACF'deki tüm anahtarları döngüye alalım ve içinde obje veya dizi olan her alanı kontrol edelim
    const acfKeys = post?.acf ? Object.keys(post.acf) : [];
    
    // Tüm içeriği JSON olarak görüntüleyelim
    console.log('Post içeriği (JSON):', JSON.stringify(post, null, 2));
    
    // Özel olarak 'galeri' ifadesi geçen alanları bulalım
    const galleryRelatedKeys = acfKeys.filter(key => 
      key.toLowerCase().includes('galer') || 
      key.toLowerCase().includes('gallery') || 
      key.toLowerCase().includes('image') || 
      key.toLowerCase().includes('resim') || 
      key.toLowerCase().includes('foto')
    );
    
    console.log('Galeri ile ilgili olabilecek anahtarlar:', galleryRelatedKeys);
    
    // ACF alanlarında galeri var mı kontrol et
    const hasGalleryInAcf = post.acf && galleryFields.some(field => {
      try {
        const value = post.acf[field];
        return value && (Array.isArray(value) ? value.length > 0 : typeof value === 'object');
      } catch (err) {
        console.error(`Error checking gallery field ${field}:`, err);
        return false;
      }
    });
    
    // Özel olarak bulunan galeri alanlarını kontrol edelim
    const hasCustomGallery = galleryRelatedKeys.some(key => {
      const value = post.acf[key];
      return value && (
        Array.isArray(value) || 
        typeof value === 'object' ||
        (typeof value === 'string' && value.startsWith('http'))
      );
    });
    
    // WordPress standart ekleri kontrol et
    const hasAttachments = post._embedded?.['wp:attachment']?.length > 0;
    
    // İçerik içindeki medya ID'lerini çıkar
    const contentMediaIds = post.content?.rendered 
      ? extractMediaIds(post.content.rendered) 
      : [];
      
    console.log('İçerik içinde bulunan medya ID\'leri:', contentMediaIds);
    
    // İçerik içinde <figure class="wp-block-gallery"> var mı kontrol et
    const hasGalleryInContent = post.content?.rendered?.includes('wp-block-gallery') ||
                              post.content?.rendered?.includes('gallery') ||
                              post.content?.rendered?.includes('wp-block-image') ||
                              contentMediaIds.length > 0;
    
    // Eğer hiçbir galeri yoksa görüntüleme yapma
    if (!hasGalleryInAcf && !hasAttachments && !hasGalleryInContent && !hasCustomGallery) {
      console.log('Galeriye ait veri bulunamadı!');
      return null;
    }
    
    // Debug için galeri tipleri
    console.log('Gallery types found:', {
      hasGalleryInAcf,
      hasAttachments,
      hasGalleryInContent,
      hasCustomGallery,
      galleryRelatedKeys
    });
    
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Image Gallery</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* ACF alanlarındaki resimleri göster */}
          {post.acf && [...galleryFields, ...galleryRelatedKeys].map(fieldName => {
            try {
              const galleryItems = post.acf[fieldName];
              if (!galleryItems) return null;
              
              console.log(`Alan ${fieldName} içeriği:`, galleryItems);
              
              // Galeri elemanlarını array olarak al
              let items: any[] = [];
              
              if (Array.isArray(galleryItems)) {
                items = galleryItems;
              } else if (typeof galleryItems === 'object') {
                items = Object.values(galleryItems);
              } else if (typeof galleryItems === 'string' && galleryItems.startsWith('http')) {
                // Tek bir URL string'i ise, onu bir resim olarak al
                items = [galleryItems];
              } else if (typeof galleryItems === 'number') {
                // Tek bir ID ise, onu bir resim olarak al
                items = [galleryItems];
              }
              
              console.log(`Alan ${fieldName} işlenmiş öğeleri:`, items);
              
              return items.map((item: any, index: number) => {
                try {
                  // Eğer item null veya undefined ise atla
                  if (!item) return null;
                  
                  console.log(`${fieldName} içindeki item ${index}:`, item);
                  
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
                  
                  console.log(`${fieldName} içindeki item ${index} için URL:`, imageUrl);
                            
                  if (!imageUrl) return null;
                  
                  const imageAlt = item.alt || 
                                  item.alt_text || 
                                  item.title || 
                                  (item.title?.rendered) || 
                                  'Gallery image';
                  
                  return (
                    <div key={`${fieldName}-${index}`} className="aspect-square relative rounded-lg overflow-hidden">
                      <Image
                        src={convertToProxyUrl(imageUrl)}
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
          
          {/* İçerik içindeki medya ID'lerini göster */}
          {contentMediaIds.map((mediaId, index) => {
            try {
              // WordPress medya URL'si bulunamadı, atla
              return null;
            } catch (err) {
              console.error(`Error rendering content media ${index}:`, err);
              return null;
            }
          })}
          
          {/* WordPress eklerini göster */}
          {post._embedded?.['wp:attachment']?.map((attachment: any, index: number) => {
            try {
              // source_url yoksa veya boş string ise atla
              if (!attachment?.source_url || attachment.source_url === '') return null;
              
              return (
                <div key={`attachment-${index}`} className="aspect-square relative rounded-lg overflow-hidden">
                  <Image
                    src={convertToProxyUrl(attachment.source_url)}
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

export async function generateStaticParams() {
  try {
    // Get posts from both regular posts and custom news post type
    const newsResponse = await wpApi.getPosts(1);
    const newsData = newsResponse.posts || [];
    
    // Try to get custom news post type if available
    let newsCustomData = [];
    try {
      const newsCustomResponse = await wpApi.getPosts(1, undefined, 'news');
      if (newsCustomResponse && newsCustomResponse.posts) {
        newsCustomData = newsCustomResponse.posts;
      }
    } catch (error) {
      console.log('No custom news endpoint available');
    }
    
    // Combine and return slugs, excluding 'webinar'
    const allNews = [...newsData, ...newsCustomData];
    return allNews
      .filter((news: any) => news.slug && news.slug !== 'webinar')
      .map((news: any) => ({
        slug: news.slug || '',
      }))
      .filter(({ slug }) => slug !== '');
  } catch (error) {
    console.error('Error generating static params for news:', error);
    return [];
  }
}

export default async function NewsDetailPage({ params }: NewsPageProps) {
  try {
    console.log('Fetching news detail for slug:', params.slug);
    
    // Validate slug
    if (!params.slug || typeof params.slug !== 'string') {
      console.log('Invalid slug, returning notFound()');
      return notFound();
    }

    // First check regular posts endpoint
    let post = await wpApi.getPostBySlug(params.slug, 'posts');
    
    if (!post) {
      console.log('Post not found, returning notFound()');
      return notFound();
    }

    // Validate post data
    if (typeof post !== 'object' || post === null) {
      console.log('Invalid post data, returning notFound()');
      return notFound();
    }

    // Get title with more fallback options
    let title = "";
    if (typeof post.acf?.news_title === 'string') {
      console.log('Using ACF news_title field');
      title = post.acf.news_title;
    } else if (typeof post.title?.rendered === 'string') {
      console.log('Using standard title.rendered field');
      title = post.title.rendered;
    } else if (typeof post.slug === 'string') {
      console.log('Reconstructing title from slug');
      title = post.slug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l: string) => l.toUpperCase());
    } else {
      console.log('Using default title');
      title = "News Article";
    }

    // Try multiple sources for content with detailed fallbacks
    let content = '';
    
    // First check regular content field
    if (typeof post.content?.rendered === 'string') {
      console.log('Using standard content.rendered field');
      content = sanitizeHtml(post.content.rendered);
    } 
    // Then check ACF fields
    else if (typeof post.acf?.description === 'string') {
      console.log('Using ACF description field');
      content = sanitizeHtml(post.acf.description);
    }
    // Then check excerpt as a fallback
    else if (typeof post.excerpt?.rendered === 'string') {
      console.log('Using excerpt.rendered as content');
      content = sanitizeHtml(post.excerpt.rendered);
    }
    // If all else fails, use a default message
    else {
      console.log('No content found, using default message');
      content = "<p>No content available for this news article.</p>";
    }

    // Get featured image if it exists
    const hasFeaturedImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url ? true : false;
    const featuredImageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';
    const featuredImageAlt = post._embedded?.['wp:featuredmedia']?.[0]?.alt_text || title;

    // Get publication date with fallback
    const publicationDate = post.acf?.publication_date || post.date;
    const formattedDate = formatDateFromWordPress(publicationDate);

    // Validate all ACF fields before rendering
    const authorName = typeof post.acf?.author_name === 'string' ? post.acf.author_name : '';
    const sourceUrl = typeof post.acf?.source_url === 'string' ? post.acf.source_url : '';
    const location = typeof post.acf?.location === 'string' ? post.acf.location : '';
    const publicationTime = typeof post.acf?.publication_time === 'string' ? post.acf.publication_time : '';
    const registrationLink = typeof post.acf?.registration_link === 'string' ? post.acf.registration_link : '';

    return (
      <main className="pt-20">
        <Section noPadding>
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <Link 
                href="/news"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
              >
                ← Back to News
              </Link>
              
              {/* Featured image only if it exists */}
              {hasFeaturedImage && featuredImageUrl && (
                <div className="aspect-video relative w-full mb-8 rounded-lg overflow-hidden">
                  <Image
                    src={convertToProxyUrl(featuredImageUrl)}
                    alt={featuredImageAlt}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}
              
              {/* Galeri görüntüleme */}
              {renderGallerySection(post)}
              
              {/* Main content area */}
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                {/* Left column: Title and Content */}
                <div className="flex-grow md:w-2/3">
                  <h1 className="text-3xl md:text-4xl font-bold mb-6">{title}</h1>
                  
                  {/* Render content with enhanced HTML formatting */}
                  {content ? (
                    <article 
                      className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:mb-4 prose-p:my-4" 
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  ) : (
                    <div className="prose max-w-none">
                      <p className="text-gray-500 italic">No content available for this news article.</p>
                    </div>
                  )}
                </div>
                
                {/* Right column: News Details */}
                <div className="md:w-1/3">
                  <div className="bg-slate-50 p-6 rounded-lg sticky top-24">
                    <h3 className="text-lg font-bold mb-4">News Details</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Publication Date</p>
                        <p>{formattedDate}</p>
                      </div>
                      
                      {authorName && (
                        <div>
                          <p className="text-sm font-medium text-slate-600">Author</p>
                          <p>{authorName}</p>
                        </div>
                      )}
                      
                      {sourceUrl && (
                        <div>
                          <p className="text-sm font-medium text-slate-600">Source</p>
                          <a 
                            href={sourceUrl}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Source
                          </a>
                        </div>
                      )}
                      
                      {location && (
                        <div>
                          <p className="text-sm font-medium text-slate-600">Location</p>
                          <p>{location}</p>
                        </div>
                      )}
                      
                      {publicationTime && (
                        <div>
                          <p className="text-sm font-medium text-slate-600">Time</p>
                          <p>{publicationTime}</p>
                        </div>
                      )}
                      
                      {registrationLink && (
                        <div>
                          <p className="text-sm font-medium text-slate-600">Registration Link</p>
                          <a 
                            href={registrationLink}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Register
                          </a>
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
    console.error('Error fetching news detail:', error);
    return notFound();
  }
} 