import axios from 'axios';

// Sadece geliştirme ortamı için: SSL doğrulamasını devre dışı bırak
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// WordPress API endpoint
const API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'http://cavundur.online/wp-json/wp/v2';
//NEXT_PUBLIC_WORDPRESS_API_URL=https://cavundur.online/wp-json/wp/v2

// WordPress API client
const wpClient = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
  maxContentLength: 50 * 1024 * 1024,
  maxBodyLength: 50 * 1024 * 1024,
});

// Önbellek için basit bir cache mekanizması
const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 dakika (geliştirme için)
const STALE_WHILE_REVALIDATE_TTL = 30 * 60 * 1000; // 30 dakika - eski veri kullanılabilir kalacak süre

// Stale-while-revalidate strateji ile önbellekli API isteği
async function cachedApiRequest(endpoint: string, params: any = {}, cacheKey?: string) {
  const key = cacheKey || `${endpoint}:${JSON.stringify(params)}`;
  const now = Date.now();
  const cached = cache.get(key);
  
  // Önbellekte ve taze ise, doğrudan döndür
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    devLog(`[Fresh cache] for ${key}`);
    return cached.data;
  }
  
  // Önbellekte ama bayat ise, arka planda yenile ve eski veriyi döndür
  if (cached && (now - cached.timestamp) < STALE_WHILE_REVALIDATE_TTL) {
    devLog(`[Stale cache] for ${key}, revalidating in background`);
    
    // Arka planda yenile, promise beklemeden
    revalidateCache(endpoint, params, key).catch(err => {
      devLog(`Background revalidation error for ${key}:`, err);
    });
    
    // Mevcut eski veriyi hemen döndür
    return cached.data;
  }
  
  // Önbellekte yoksa veya çok eski ise
  try {
    devLog(`[Cache miss] for ${key}, fetching from API`);
    const response = await wpClient.get(endpoint, { params });
    
    // Sonucu önbelleğe al
    cache.set(key, {
      data: response.data,
      timestamp: now
    });
    
    return response.data;
  } catch (error) {
    // Hata durumunda, eğer varsa eski veriyi döndür
    if (cached) {
      devLog(`[Error recovery] for ${key}, using stale cache`);
      return cached.data;
    }
    throw error;
  }
}

// Arka planda önbelleği yenileme fonksiyonu
async function revalidateCache(endpoint: string, params: any = {}, cacheKey: string) {
  try {
    const response = await wpClient.get(endpoint, { params });
    
    // Sonucu önbelleğe al
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    });
    
    devLog(`[Background revalidated] for ${cacheKey}`);
    return response.data;
  } catch (error) {
    devLog(`[Revalidation failed] for ${cacheKey}:`, error);
    // Sessizce başarısız ol, mevcut önbellek korunacak
    return null;
  }
}

// Çoklu API isteği için paralel getirme yardımcı fonksiyonu
export async function fetchParallel<T>(fetchers: Array<() => Promise<T>>): Promise<T[]> {
  try {
    return await Promise.all(fetchers.map(fetcher => 
      fetcher().catch(error => {
        console.error('Parallel fetch error:', error);
        return null as unknown as T;
      })
    ));
  } catch (error) {
    console.error('fetchParallel error:', error);
    return [];
  }
}

// Hata yakalama için interceptor
wpClient.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNREFUSED') {
      if (process.env.NODE_ENV !== 'production') {
        console.error('WordPress API bağlantı hatası. WordPress çalışıyor mu?');
      }
    }
    
    if (error.isAxiosError) {
      const errorDetails = {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      };
      if (process.env.NODE_ENV !== 'production') {
        console.error('API Error:', errorDetails);
      }
    }
    
    return Promise.reject(error);
  }
);

const PER_PAGE = 10;

// Tip tanımları
export interface Post {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  slug: string;
  featured_media: number;
  acf?: {
    news_title?: string;
    event_title?: string;
    description?: string;
    events_description?: string;
    image?: string;
    publication_date?: string;
    event_date?: string;
    source_url?: string;
    author_name?: string;
    location?: string;
    registration_link?: string;
    // Galeri alanları - farklı olası isimlendirmeler
    gallery?: any[] | Record<string, any>;
    images?: any[] | Record<string, any>;
    image_gallery?: any[] | Record<string, any>;
    news_gallery?: any[] | Record<string, any>;
    news_images?: any[] | Record<string, any>;
    media?: any[] | Record<string, any>;
    photos?: any[] | Record<string, any>;
    picture_gallery?: any[] | Record<string, any>;
  };
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text?: string;
      media_details?: {
        sizes?: {
          [key: string]: {
            source_url: string;
          };
        };
      };
    }>;
    'wp:attachment'?: Array<{
      id: number;
      source_url: string;
      alt_text?: string;
      title?: {
        rendered: string;
      };
      description?: {
        rendered: string;
      };
      media_details?: {
        sizes?: {
          [key: string]: {
            source_url: string;
          };
        };
      };
    }>;
  };
}

export interface ReferenceSite {
  id: number;
  slug: string;
  title: string;
  country: string; // 3 harfli ISO kodu
  stars: number;
  link?: string;
}

export interface Event extends Post {
  acf?: {
    event_title?: string;
    event_date?: string;
    event_time?: string;
    event_location?: string;
    location?: string;
    lokasyon?: string;
    event_description?: string;
    events_description?: string;
    description?: string;
    event_organizer?: string;
    event_registration_link?: string;
    image?: string;
    // Galeri alanları - farklı olası isimlendirmeler
    gallery?: any[] | Record<string, any>;
    images?: any[] | Record<string, any>;
    image_gallery?: any[] | Record<string, any>;
    event_gallery?: any[] | Record<string, any>;
    event_images?: any[] | Record<string, any>;
    media?: any[] | Record<string, any>;
    photos?: any[] | Record<string, any>;
    picture_gallery?: any[] | Record<string, any>;
  }
}

export interface Page {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt?: { rendered: string };
  slug: string;
  featured_media?: number;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text?: string;
      media_details?: {
        sizes?: {
          [key: string]: {
            source_url: string;
          };
        };
      };
    }>;
  };
  acf?: {
    description?: string;
    page_description?: string;
    content_description?: string;
    news_description?: string;
    events_description?: string;
    event_description?: string;
    page_subtitle?: string;
    page_title?: string;
    page_banner_image?: string;
    page_image?: string;
    featured_image?: string;
    [key: string]: any; // Diğer ACF alanları için genel tip
  };
}

export interface Media {
  id: number;
  source_url: string;
  alt_text: string;
}

export interface Service {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  acf: {
    icon?: string;
    short_description?: string;
  };
  slug: string;
  featured_media: number;
}

export interface Project {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  slug: string;
  featured_media: number;
  featured_media_url?: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text?: string;
      media_details?: {
        sizes?: {
          [key: string]: {
            source_url: string;
          };
        };
      };
    }>;
  };
  acf?: {
    baslangic_tarihi?: string;
    bitis_tarihi?: string;
    lokasyon?: string;
    aciklama?: string;
    image_1?: number;
    image_2?: number | string;
    image_3?: number | string;
    project_url?: string;
    client?: string;
    completion_date?: string;
  };
}

export interface About {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  slug: string;
  featured_media: number;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text?: string;
    }>;
  };
  acf?: {
    secondary_image?: string;
    mission?: string;
    aims?: string;
    page_subtitle?: string;
    about_description?: string;
    about_schema_image?: string;
    supporting_aha_title?: string;
    supporting_aha_description?: string;
    supporting_aha_image?: string;
    board_member_name?: string;
    board_member_role?: string;
    board_member_image?: string;
    secretariat_member_name?: string;
    secretariat_member_role?: string;
    secretariat_member_image?: string;
    mission_info?: string;
    aims_info?: string;
    aims_list?: string;
  };
}

// Sadece geliştirme ortamında console.log kullanacak yardımcı fonksiyon
const devLog = (message: string, ...data: any[]) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(message, ...data);
  }
};

// API Functions
export async function getPages() {
  const cacheKey = 'pages';
  
  try {
    // cachedApiRequest kullan
    return await cachedApiRequest('/pages', { per_page: 100, _embed: true }, cacheKey);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('getPages error:', error);
    }
    return [];
  }
}

export async function getPageBySlug(slug: string) {
  if (!slug) return null;
  
  const cacheKey = `page:${slug}`;
  
  try {
    // cachedApiRequest kullan ve ilk öğeyi döndür
    const data = await cachedApiRequest('/pages', { slug, _embed: true }, cacheKey);
    
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    
    return null;
  } catch (error) {
    console.error('getPageBySlug error:', error);
    return null;
  }
}

export async function getPosts(page = 1, category?: number, postType = 'posts') {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Fetching posts from:', `${API_URL}/${postType}`);
    }
    const params: any = { 
      per_page: PER_PAGE, 
      page, 
      _embed: 'wp:featuredmedia,wp:attachment,author',
      status: 'publish',
      acf_format: 'standard',
      acf: true
    };
    if (category) params.categories = category;

    if (process.env.NODE_ENV !== 'production') {
      console.log('API request params:', params);
    }
    
    const { data, headers } = await wpClient.get(`/${postType}`, { params });
    
    // Sadece geliştirme ortamında loglama yap
    if (process.env.NODE_ENV !== 'production') {
      console.log('Posts API Response Summary:', {
        count: data?.length || 0,
        totalPages: headers['x-wp-totalpages'],
        hasData: data && data.length > 0
      });
      
      // İlk 3 öğenin özetini göster
      if (data && data.length > 0) {
        console.log(`Preview of first ${Math.min(3, data.length)} items:`);
        
        for (let i = 0; i < Math.min(3, data.length); i++) {
          const item = data[i];
          console.log(`Item ${i+1} (ID: ${item.id}):`, {
            title: item.title?.rendered?.substring(0, 30) + '...',
            hasFeaturedMedia: !!item.featured_media,
            featuredMediaId: item.featured_media,
            hasEmbedded: !!item._embedded,
            embeddedKeys: item._embedded ? Object.keys(item._embedded) : [],
            hasFeaturedMediaEmbedded: !!item._embedded?.['wp:featuredmedia'],
            featuredMediaEmbeddedCount: item._embedded?.['wp:featuredmedia']?.length || 0,
            directImageUrl: item._embedded?.['wp:featuredmedia']?.[0]?.source_url || null
          });
        }
      }
    }
    
    return {
      posts: data,
      totalPages: parseInt(headers['x-wp-totalpages'] || '1', 10),
      currentPage: page,
    };
  } catch (error) {
    console.error('getPosts error:', error);
    return { posts: [], totalPages: 0, currentPage: page };
  }
}

export async function getPostBySlug(slug: string, postType = 'posts') {
  try {
    console.log('Fetching post by slug:', slug, 'type:', postType);
    
    // API parametrelerini oluştur
    const params = { 
      slug, 
      _embed: 'wp:featuredmedia,wp:attachment,author',
      _render: true,
      acf_format: 'standard', // ACF verilerinin tüm yapısını al
      acf: true, // ACF alanlarını ekleyin
      _fields: 'id,title,content,excerpt,slug,date,featured_media,acf,_embedded,_links'
    };
    
    console.log('API request params:', params);
    
    const { data } = await wpClient.get(`/${postType}`, { params });
    
    console.log('Post data summary:', {
      found: data && data.length > 0,
      acfFields: data[0]?.acf ? Object.keys(data[0].acf) : [],
      hasAttachments: data[0]?._embedded?.['wp:attachment'] ? true : false,
      attachmentsCount: data[0]?._embedded?.['wp:attachment']?.length || 0,
      featuredMediaExists: data[0]?._embedded?.['wp:featuredmedia'] ? true : false
    });
    
    // ACF alanlarını detaylı şekilde logla
    if (data[0]?.acf) {
      // ACF'deki her anahtarı kontrol et
      Object.keys(data[0].acf).forEach(key => {
        const value = data[0].acf[key];
        console.log(`ACF field "${key}":`, {
          type: typeof value,
          isArray: Array.isArray(value),
          length: Array.isArray(value) ? value.length : null,
          sample: value
        });
      });
    }
    
    return data[0] || null;
  } catch (error) {
    console.error('getPostBySlug error:', error);
    return null;
  }
}

export async function getCategories() {
  try {
    const { data } = await wpClient.get('/categories', {
      params: { per_page: 100 },
    });
    return data;
  } catch (error) {
    console.error('getCategories error:', error);
    return [];
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    const { data } = await wpClient.get('/categories', {
      params: { slug },
    });
    return data[0] || null;
  } catch (error) {
    console.error('getCategoryBySlug error:', error);
    return null;
  }
}

export async function getMediaById(id: number) {
  if (!id || isNaN(id)) return null;
  try {
    const { data } = await wpClient.get(`/media/${id}`);
    return data;
  } catch (error: any) {
    console.error(`getMediaById error (${id}):`, error.message);
    return null;
  }
}

export async function getProjects(page = 1) {
  const cacheKey = `projects:page${page}`;
  
  try {
    // Önce önbellekli API isteği mekanizmasını kullan
    const data = await cachedApiRequest('/projects', { 
      per_page: PER_PAGE, 
      page, 
      _embed: true 
    }, cacheKey);
    
    // API yanıtını dönüştür
    let totalPages = 1;
    
    if (Array.isArray(data) && data.length > 0) {
      // headers bilgisi cachedApiRequest'ten gelmiyor, o yüzden tahmini hesaplama yapalım
      totalPages = Math.ceil(data.length / PER_PAGE);
      
      // Eğer sayfa tam doluysa, muhtemelen daha fazla sayfa vardır
      if (data.length === PER_PAGE) {
        totalPages = Math.max(totalPages, page + 1);
      }
      
      return {
        projects: data,
        totalPages: totalPages,
        currentPage: page,
      };
    }
    
    return { 
      projects: data || [], 
      totalPages: totalPages, 
      currentPage: page 
    };
  } catch (error) {
    console.error('getProjects error:', error);
    return { projects: [], totalPages: 0, currentPage: page };
  }
}

export async function getProjectBySlug(slug: string) {
  if (!slug) {
    devLog('getProjectBySlug called with empty slug');
    return null;
  }
  
  const cacheKey = `project:${slug}`;
  
  try {
    // API parametrelerini oluştur
    const params = { 
      slug, 
      _embed: 'wp:featuredmedia,wp:attachment,author',
      _render: true,
      acf_format: 'standard',
      acf: true
    };
    
    // cachedApiRequest kullan
    const data = await cachedApiRequest('/projects', params, cacheKey);
    
    // Eğer sonuç bir dizi ise, ilk öğeyi al
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    
    devLog(`No project found with slug: ${slug}`);
    return null;
  } catch (error) {
    console.error('getProjectBySlug error:', error);
    return null;
  }
}

export async function getEvents(page = 1) {
  try {
    const { data, headers } = await wpClient.get('/events', {
      params: { per_page: PER_PAGE, page, _embed: true },
    });
    return {
      events: data,
      totalPages: parseInt(headers['x-wp-totalpages'] || '1', 10),
      currentPage: page,
    };
  } catch (error) {
    console.error('getEvents error:', error);
    return { events: [], totalPages: 0, currentPage: page };
  }
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  try {
    console.log('Fetching event by slug:', slug);
    
    // API parametrelerini oluştur
    const params = { 
      slug, 
      _embed: 'wp:featuredmedia,wp:attachment,author',
      acf_format: 'standard',
      acf: true, // ACF alanlarını ekleyin
      _render: true,
      _fields: 'id,title,content,excerpt,slug,date,featured_media,acf,_embedded,_links'
    };
    
    const { data } = await wpClient.get('/events', { params });
    
    // Debug log for data from API
    if (data && data[0]) {
      console.log('Event data found:', {
        slug: data[0].slug,
        acfFields: data[0].acf ? Object.keys(data[0].acf) : [],
        acfRaw: data[0].acf,
        hasAttachments: data[0]._embedded?.['wp:attachment'] ? true : false,
        attachmentsCount: data[0]._embedded?.['wp:attachment']?.length || 0
      });
    } else {
      console.log('No event found with slug:', slug);
    }
    
    return data[0] || null;
  } catch (error) {
    console.error('getEventBySlug error:', error);
    return null;
  }
}

export async function searchContent(query: string, type = 'post') {
  try {
    const { data } = await wpClient.get('/search', {
      params: { search: query, type, per_page: PER_PAGE },
    });
    return data;
  } catch (error) {
    console.error('searchContent error:', error);
    return [];
  }
}

export function getFeaturedMediaUrl(post: any, size = 'large') {
  if (!post) {
    console.log('getFeaturedMediaUrl: post is null or undefined');
    return null;
  }

  // Debug log için post yapısını kontrol et
  console.log('getFeaturedMediaUrl input:', {
    postId: post.id,
    hasAcf: !!post.acf,
    hasAcfImage: !!post.acf?.image,
    acfImageType: post.acf?.image ? typeof post.acf.image : null,
    hasFeaturedMedia: !!post.featured_media,
    featuredMediaId: post.featured_media,
    hasEmbedded: !!post._embedded,
    embeddedKeys: post._embedded ? Object.keys(post._embedded) : [],
    hasFeaturedMediaEmbedded: !!post._embedded?.['wp:featuredmedia'],
    featuredMediaEmbeddedCount: post._embedded?.['wp:featuredmedia']?.length || 0
  });
  
  // Önce ACF image alanını kontrol et
  if (post.acf?.image) {
    // Eğer image bir URL ise direkt kullan
    if (typeof post.acf.image === 'string' && post.acf.image.startsWith('http')) {
      console.log('getFeaturedMediaUrl: Using ACF image URL:', post.acf.image);
      return post.acf.image;
    }
    // Eğer image bir ID ise, media endpoint'inden al
    if (typeof post.acf.image === 'number') {
      const mediaUrl = `${API_URL}/media/${post.acf.image}`;
      console.log('getFeaturedMediaUrl: Using ACF image ID:', post.acf.image, 'URL:', mediaUrl);
      return mediaUrl;
    }
  }
  
  // Featured media ID varsa ancak _embedded yoksa
  if (post.featured_media && !post._embedded?.['wp:featuredmedia']) {
    console.log('getFeaturedMediaUrl: Featured media ID exists but not embedded:', post.featured_media);
    const mediaUrl = `${API_URL}/media/${post.featured_media}`;
    return mediaUrl;
  }
  
  // ACF image yoksa _embedded içindeki görseli kontrol et
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  if (media) {
    // Önce belirtilen boyuttaki görseli dene
    const sizedImage = media?.media_details?.sizes?.[size]?.source_url;
    if (sizedImage) {
      console.log('getFeaturedMediaUrl: Using featured media sized image:', sizedImage);
      return sizedImage;
    }
    
    // Yoksa orijinal görseli kullan
    if (media.source_url) {
      console.log('getFeaturedMediaUrl: Using featured media source URL:', media.source_url);
      return media.source_url;
    }
  }
  
  // Son çare olarak, medya ID'si varsa direkt o ID'yi kullanalım
  if (post.featured_media && post.featured_media > 0) {
    console.log('getFeaturedMediaUrl: Using featured media ID as fallback:', post.featured_media);
    return `${API_URL}/media/${post.featured_media}`;
  }
  
  // Görsel bulunamazsa null döndür
  console.log('getFeaturedMediaUrl: No image found, returning null');
  return null;
}

export function cleanContent(content: string) {
  return content ? content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '';
}

export function formatDate(dateString: string, options: Intl.DateTimeFormatOptions = {}) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

export async function getAbout() {
  try {
    console.log('Fetching about page...');
    
    // About sayfasını pages endpoint'inden al
    const { data } = await wpClient.get('/pages', {
      params: { 
        slug: 'about',
        _embed: true,
        acf_format: 'standard'
      }
    });
    
    if (!data || data.length === 0) {
      console.log('About page not found');
      return null;
    }
    
    const aboutPage = data[0];
    console.log('About page found:', {
      id: aboutPage.id,
      title: aboutPage.title?.rendered,
      slug: aboutPage.slug
    });
    
    return aboutPage;
  } catch (error: any) {
    console.error('getAbout error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    return null;
  }
}

export async function getServices() {
  try {
    const response = await wpClient.get('/services', {
      params: {
        per_page: 100,
        _embed: 'wp:featuredmedia',
        status: 'publish',
        acf_format: 'standard',
        acf: true,
        _fields: 'id,title,content,excerpt,slug,featured_media,acf,_embedded'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

/**
 * WordPress Reference Sites API'den verileri çeker ve önbellek mekanizmasını kullanır
 * @returns Promise<ReferenceSite[]> Reference site verileri
 */
export async function fetchReferenceSites(): Promise<ReferenceSite[]> {
  const cacheKey = 'reference-sites';
  
  try {
    // Önbellek mekanizmasını kullan
    const data = await cachedApiRequest('/reference-sites', {
      per_page: 100,
      _embed: true,
      _fields: 'id,title,slug,acf'
    }, cacheKey);

    // API'den dönen veriyi normalize et
    return data.map((item: any) => ({
      id: item.id,
      slug: item.slug,
      title: item.title?.rendered || "",
      country: item.acf?.country || "",
      stars: Number(item.acf?.stars_awarded) || 0,
      link: item.acf?.external_link || undefined,
    }));
  } catch (error) {
    console.error('Error fetching reference sites:', error);
    return [];
  }
}

const wpApi = {
  getPages,
  getPageBySlug,
  getPosts,
  getPostBySlug,
  getCategories,
  getCategoryBySlug,
  getMediaById,
  getProjects,
  getProjectBySlug,
  getEvents,
  getEventBySlug,
  searchContent,
  getFeaturedMediaUrl,
  cleanContent,
  formatDate,
  getAbout,
  getServices,
  fetchReferenceSites,
};

export default wpApi;
