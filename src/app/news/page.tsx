import Image from "next/image";
import Link from "next/link";
import wpApi, { Post } from "@/lib/api/wordpress";
import Section from "@/components/Section";
import PageHeader from "@/components/PageHeader";
import { convertToProxyUrl, devLog } from '@/lib/utils';

export const revalidate = 3600; // Her saat yeniden oluştur

export default async function NewsPage() {
  try {
    // News sayfası (varsa) ve news postlarını çek
    const newsPage = await wpApi.getPageBySlug("news");
    const response = await wpApi.getPosts(1, undefined, 'posts');
    const { posts: news } = response;

    // Sayfa yapısını incele
    console.log("=== NEWS PAGE STRUCTURE ===");
    console.log("News page keys:", newsPage ? Object.keys(newsPage) : "No news page");
    console.log("News page ACF:", newsPage?.acf ? Object.keys(newsPage.acf) : "No ACF");
    if (newsPage?.acf) {
      Object.keys(newsPage.acf).forEach(key => {
        console.log(`News page ACF field "${key}":`, {
          type: typeof newsPage.acf[key],
          value: newsPage.acf[key]
        });
      });
    }
    console.log("News page content:", newsPage?.content?.rendered?.substring(0, 100) + "...");
    console.log("News page excerpt:", newsPage?.excerpt?.rendered?.substring(0, 100) + "...");

    // API yanıtını incele
    if (news && news.length > 0) {
      console.log("=== NEWS API RESPONSE ANALYSIS ===");
      const firstNews = news[0];
      console.log("First news item ID:", firstNews.id);
      console.log("First news item ACF keys:", firstNews.acf ? Object.keys(firstNews.acf) : "No ACF");
      
      // ACF yapısını incele
      if (firstNews.acf) {
        Object.keys(firstNews.acf).forEach(key => {
          const value = firstNews.acf[key];
          console.log(`ACF field "${key}":`, {
            type: typeof value,
            isArray: Array.isArray(value),
            sample: value,
            isObject: typeof value === 'object' && !Array.isArray(value) && value !== null
          });
          
          // Eğer bu bir dizi veya nesne ise içeriğini daha detaylı incele
          if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value) && value.length > 0) {
              console.log(`  Array field "${key}" first item:`, {
                type: typeof value[0],
                isObject: typeof value[0] === 'object' && value[0] !== null,
                sample: value[0],
                keys: typeof value[0] === 'object' && value[0] !== null ? Object.keys(value[0]) : "Not an object"
              });
            } else if (!Array.isArray(value)) {
              console.log(`  Object field "${key}" keys:`, Object.keys(value));
            }
          }
        });
      }
    }

    // About sayfasındaki gibi görsel ve açıklama çekme mantığı
    let featuredImageUrl = null;
    if (newsPage?._embedded?.["wp:featuredmedia"]?.[0]?.source_url) {
      featuredImageUrl = newsPage._embedded["wp:featuredmedia"][0].source_url;
    }

    const title = newsPage?.title?.rendered || "News";

    // Açıklama için olası tüm ACF alanlarını kontrol et
    const description = 
      newsPage?.acf?.news_description || 
      newsPage?.acf?.page_description || 
      newsPage?.acf?.content_description || 
      newsPage?.acf?.description || 
      newsPage?.content?.rendered || 
      newsPage?.excerpt?.rendered || 
      "";

    console.log("Final news description used:", description ? description.substring(0, 100) + "..." : "Empty");

    const imageAlt = newsPage?._embedded?.["wp:featuredmedia"]?.[0]?.alt_text || title;

    // Sort news by date (newest first)
    const sortedNews = news?.sort((a: Post, b: Post) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }) || [];

    return (
      <PageHeader
        title={title}
        description={description}
        imageUrl={featuredImageUrl}
        imageAlt={imageAlt}
        titleContainerClassName="pageHeaderTitle"
      >
        <Section isFirst={true}>
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedNews && sortedNews.length > 0 ? (
                sortedNews.map((item: Post) => {
                  // Görsel URL'sini belirle - daha güçlü kontrol
                  let imageUrl = null;
                  
                  // Her news için ACF yapısını detaylı incele
                  console.log(`=== ANALYZING NEWS ID: ${item.id} ===`);
                  console.log(`ACF keys:`, item.acf ? Object.keys(item.acf) : "No ACF");
                  
                  // ÖNCELİKLE: ACF Pro'da oluşturulan "image" alanını kontrol et
                  if (item.acf && "image" in item.acf) {
                    const gallery = item.acf["image" as keyof typeof item.acf];
                    console.log(`Found ACF gallery field "image":`, gallery);
                    
                    // "image" alanı bir dizi olabilir
                    if (Array.isArray(gallery) && gallery.length > 0) {
                      console.log(`Processing array gallery with ${gallery.length} items`);
                      
                      // İlk öğeyi al
                      const firstItem = gallery[0];
                      console.log("First gallery item:", firstItem);
                      
                      // Nesne içinde url veya diğer görsel alanlarını kontrol et
                      if (typeof firstItem === 'object' && firstItem !== null) {
                        // Konsol logları: Nesne anahtarlarını incele
                        console.log("Gallery item keys:", Object.keys(firstItem));
                        
                        // ACF görsel nesnesinde bulunan URL'yi kontrol et
                        if ('url' in firstItem && firstItem.url) {
                          imageUrl = firstItem.url;
                          console.log(`Using gallery item URL:`, imageUrl);
                        } else if ('sizes' in firstItem && typeof firstItem.sizes === 'object') {
                          // ACF sizes nesnesinden görseli çek
                          const sizes = firstItem.sizes as any;
                          console.log("Available sizes:", Object.keys(sizes));
                          
                          if (sizes.large) {
                            imageUrl = typeof sizes.large === 'string' ? sizes.large : sizes.large.url;
                            console.log(`Using large size:`, imageUrl);
                          } else if (sizes.medium) {
                            imageUrl = typeof sizes.medium === 'string' ? sizes.medium : sizes.medium.url;
                            console.log(`Using medium size:`, imageUrl);
                          } else if (sizes.thumbnail) {
                            imageUrl = typeof sizes.thumbnail === 'string' ? sizes.thumbnail : sizes.thumbnail.url;
                            console.log(`Using thumbnail size:`, imageUrl);
                          }
                        } else if ('source_url' in firstItem && firstItem.source_url) {
                          // WordPress REST API bazen source_url kullanır
                          imageUrl = firstItem.source_url;
                          console.log(`Using gallery item source_url:`, imageUrl);
                        } else {
                          // Herhangi bir img/src benzeri alan kontrolü
                          const possibleImageFields = ['src', 'source', 'image', 'img', 'link'];
                          for (const field of possibleImageFields) {
                            if (field in firstItem && typeof firstItem[field] === 'string' && firstItem[field].startsWith('http')) {
                              imageUrl = firstItem[field];
                              console.log(`Using gallery item ${field} field:`, imageUrl);
                              break;
                            }
                          }
                          
                          // ID ile oluşturma (son çare)
                          if (!imageUrl && 'id' in firstItem && typeof firstItem.id === 'number') {
                            imageUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/media/${firstItem.id}`;
                            console.log(`Using gallery item ID:`, imageUrl);
                          }
                        }
                      }
                    }
                  }
                  
                  // Eğer ACF galeri alanından görsel bulunamazsa diğer yöntemlere devam et
                  
                  // Detay sayfasıyla uyumlu şekilde görüntü URL'sini al
                  if (!imageUrl) {
                    const hasFeaturedImage = item._embedded?.['wp:featuredmedia']?.[0]?.source_url ? true : false;
                    
                    if (hasFeaturedImage) {
                      imageUrl = item._embedded?.['wp:featuredmedia']?.[0]?.source_url;
                      console.log(`Direct featured image URL for ${item.id}:`, imageUrl);
                    } else {
                      // getFeaturedMediaUrl fonksiyonunu yedek olarak kullan
                      imageUrl = wpApi.getFeaturedMediaUrl(item);
                      console.log(`getFeaturedMediaUrl result for ${item.id}:`, imageUrl);
                    }
                  }
                  
                  // Eğer imageUrl hala null ise ve ACF içinde image varsa
                  if (!imageUrl && item.acf?.image) {
                    if (typeof item.acf.image === 'string' && item.acf.image.startsWith('http')) {
                      imageUrl = item.acf.image;
                      console.log(`Using ACF image string for ${item.id}:`, imageUrl);
                    } else if (typeof item.acf.image === 'number') {
                      imageUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/media/${item.acf.image}`;
                      console.log(`Using ACF image ID for ${item.id}:`, imageUrl);
                    }
                  }
  
                  // ACF'deki diğer galeri alanlarından ilk görseli kontrol et
                  if (!imageUrl && item.acf) {
                    // Olası galeri alan isimleri
                    const galleryFields = [
                      'gallery', 'images', 'image_gallery', 'news_gallery', 
                      'news_images', 'media', 'photos', 'picture_gallery'
                    ];
                    
                    console.log(`Searching for gallery fields in ${item.id}...`);
                    // Tüm olası galeri alanlarını kontrol et
                    for (const field of galleryFields) {
                      // TypeScript hatası almamak için safe erişim
                      const gallery = item.acf[field as keyof typeof item.acf];
                      
                      if (gallery) {
                        console.log(`Found gallery field "${field}" in ${item.id}:`, {
                          type: typeof gallery,
                          isArray: Array.isArray(gallery),
                          length: Array.isArray(gallery) ? gallery.length : null,
                          isObject: typeof gallery === 'object' && !Array.isArray(gallery) && gallery !== null,
                          keys: typeof gallery === 'object' && !Array.isArray(gallery) && gallery !== null ? Object.keys(gallery) : null
                        });
                        
                        // Galeri bir dizi ise
                        if (Array.isArray(gallery) && gallery.length > 0) {
                          const firstImage = gallery[0];
                          console.log(`Gallery array first item:`, firstImage);
                          
                          // Görsel bir URL ise
                          if (typeof firstImage === 'string' && firstImage.startsWith('http')) {
                            imageUrl = firstImage;
                            console.log(`Using gallery field "${field}" first image URL for ${item.id}:`, imageUrl);
                            break;
                          } 
                          // Görsel bir nesne ise
                          else if (typeof firstImage === 'object' && firstImage !== null) {
                            console.log(`First image is an object:`, {
                              keys: Object.keys(firstImage),
                              hasUrl: 'url' in firstImage,
                              hasId: 'id' in firstImage,
                              urlValue: 'url' in firstImage ? firstImage.url : null,
                              idValue: 'id' in firstImage ? firstImage.id : null
                            });
                            
                            // ACF tarafından döndürülen URL/ID formatlarını kontrol et
                            if ('url' in firstImage && firstImage.url) {
                              imageUrl = firstImage.url;
                              console.log(`Using gallery field "${field}" first image object URL for ${item.id}:`, imageUrl);
                              break;
                            } else if ('id' in firstImage && firstImage.id) {
                              imageUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/media/${firstImage.id}`;
                              console.log(`Using gallery field "${field}" first image ID for ${item.id}:`, imageUrl);
                              break;
                            } else if ('sizes' in firstImage && typeof firstImage.sizes === 'object') {
                              // WordPress bazen sizes nesnesi içinde görselleri saklar
                              const sizes = firstImage.sizes;
                              if ('large' in sizes && sizes.large) {
                                imageUrl = typeof sizes.large === 'string' ? sizes.large : sizes.large.url;
                                console.log(`Using gallery image sizes.large for ${item.id}:`, imageUrl);
                                break;
                              } else if ('medium' in sizes && sizes.medium) {
                                imageUrl = typeof sizes.medium === 'string' ? sizes.medium : sizes.medium.url;
                                console.log(`Using gallery image sizes.medium for ${item.id}:`, imageUrl);
                                break;
                              } else if ('thumbnail' in sizes && sizes.thumbnail) {
                                imageUrl = typeof sizes.thumbnail === 'string' ? sizes.thumbnail : sizes.thumbnail.url;
                                console.log(`Using gallery image sizes.thumbnail for ${item.id}:`, imageUrl);
                                break;
                              }
                            }
                          }
                          // Görsel bir ID ise
                          else if (typeof firstImage === 'number') {
                            imageUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/media/${firstImage}`;
                            console.log(`Using gallery field "${field}" first image ID for ${item.id}:`, imageUrl);
                            break;
                          }
                        } 
                        // Galeri bir nesne ise (ACF formatına bağlı olarak)
                        else if (typeof gallery === 'object' && gallery !== null && !Array.isArray(gallery)) {
                          console.log(`Gallery object keys:`, Object.keys(gallery));
                          
                          // Nesne içinde ID veya URL kontrolü
                          if ('url' in gallery && gallery.url) {
                            imageUrl = gallery.url;
                            console.log(`Using gallery object URL for ${item.id}:`, imageUrl);
                            break;
                          } else if ('id' in gallery && gallery.id) {
                            imageUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/media/${gallery.id}`;
                            console.log(`Using gallery object ID for ${item.id}:`, imageUrl);
                            break;
                          } else if (Object.keys(gallery).length > 0) {
                            // Bazen ACF görselleri 0, 1, 2, ... şeklinde anahtarlar ile döndürür
                            const firstKey = Object.keys(gallery)[0];
                            const firstItem = gallery[firstKey];
                            
                            console.log(`Gallery first key item:`, {
                              key: firstKey,
                              value: firstItem,
                              type: typeof firstItem,
                              isObject: typeof firstItem === 'object' && firstItem !== null
                            });
                            
                            if (typeof firstItem === 'string' && firstItem.startsWith('http')) {
                              imageUrl = firstItem;
                              console.log(`Using gallery object first key URL for ${item.id}:`, imageUrl);
                              break;
                            } else if (typeof firstItem === 'object' && firstItem !== null) {
                              if ('url' in firstItem && firstItem.url) {
                                imageUrl = firstItem.url;
                                console.log(`Using gallery object first key object URL for ${item.id}:`, imageUrl);
                                break;
                              } else if ('id' in firstItem && firstItem.id) {
                                imageUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/media/${firstItem.id}`;
                                console.log(`Using gallery object first key object ID for ${item.id}:`, imageUrl);
                                break;
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                    
                  // Hala görüntü yoksa ve featured_media ID'si varsa API endpoint'inden oluştur
                  if (!imageUrl && item.featured_media && item.featured_media > 0) {
                    imageUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/media/${item.featured_media}`;
                    console.log(`Using featured_media ID for ${item.id}:`, imageUrl);
                  }

                  // Sonuç hakkında detaylı bilgi
                  console.log(`Final image check for ${item.id}:`, {
                    hasFeaturedImage: !!item._embedded?.['wp:featuredmedia']?.[0]?.source_url,
                    hasEmbedded: !!item._embedded,
                    featuredMediaPath: item._embedded?.['wp:featuredmedia'] ? 'exists' : 'missing',
                    finalImageUrl: imageUrl
                  });
                  
                  return (
                    <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                      {imageUrl ? (
                      <div className="relative w-full h-56">
                        <Image
                          src={convertToProxyUrl(imageUrl)}
                          alt={item.acf?.news_title || item.title.rendered}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      ) : (
                        <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">No image available</span>
                        </div>
                      )}
                      <div className="p-6 flex-1 flex flex-col">
                        <h2 className="text-2xl font-semibold mb-2">
                          {item.acf?.news_title || item.title.rendered}
                        </h2>
                        
                        {/* Debug log ekleyelim */}
                        {process.env.NODE_ENV !== 'production' && (() => {
                          console.log("Rendering description for news", item.id, "description value:", item.acf?.description);
                          return null;
                        })()}
                        
                        {/* Açıklama (description) alanı - doğrudan HTML render */}
                        {item.acf?.description && (
                          <div
                            className="text-gray-700 mb-4 news-description"
                            dangerouslySetInnerHTML={{ __html: item.acf.description }}
                          />
                        )}
                        
                        <Link
                          href={`/news/${item.slug}`}
                          className="mt-auto inline-block text-blue-600 hover:underline font-medium"
                        >
                          Devamını Oku
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 text-center text-gray-500">Henüz haber eklenmemiş.</div>
              )}
            </div>
          </div>
        </Section>
      </PageHeader>
    );
  } catch (error) {
    console.error("Error fetching news data:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">News</h1>
        <p className="text-red-500">Error loading news. Please try again later.</p>
      </div>
    );
  }
} 