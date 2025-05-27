# WordPress Headless CMS Kurulum Rehberi

Bu rehber, Next.js ön yüzümüz için WordPress'i headless CMS olarak yapılandırma adımlarını içerir.

## 1. Gerekli Eklentiler

Aşağıdaki eklentileri WordPress'inize yüklemelisiniz:

- **Advanced Custom Fields (ACF) Pro**: Özel alanlar oluşturmak için
- **Custom Post Type UI**: Özel içerik tipleri oluşturmak için
- **WP REST API Menus**: Menüleri API üzerinden erişilebilir yapmak için
- **JWT Authentication for WP REST API**: Güvenli API erişimi için (isteğe bağlı)
- **Yoast SEO**: SEO meta verilerini API'ye eklemek için
- **WP REST API Customizer**: API özelleştirmeleri için

## 2. Özel İçerik Tipleri

### Hizmetler (Services)

Custom Post Type UI ile aşağıdaki ayarlarla oluşturun:

- Post Type Slug: `services`
- Plural Label: `Hizmetler`
- Singular Label: `Hizmet`
- REST API'de göster: `Evet`

ACF Pro ile aşağıdaki alanları ekleyin:
- Grup Adı: `Hizmet Detayları`
- Alanlar:
  - Alan Adı: `icon`, Tür: `Text`, Açıklama: `Lucide ikon adı`
  - Alan Adı: `short_description`, Tür: `Textarea`, Açıklama: `Kısa açıklama`

### Projeler (Projects)

Custom Post Type UI ile aşağıdaki ayarlarla oluşturun:

- Post Type Slug: `projects`
- Plural Label: `Projeler`
- Singular Label: `Proje`
- REST API'de göster: `Evet`

ACF Pro ile aşağıdaki alanları ekleyin:
- Grup Adı: `Proje Detayları`
- Alanlar:
  - Alan Adı: `project_url`, Tür: `URL`, Açıklama: `Proje URL'si`
  - Alan Adı: `client`, Tür: `Text`, Açıklama: `Müşteri adı`
  - Alan Adı: `completion_date`, Tür: `Date`, Açıklama: `Tamamlanma tarihi`

## 3. Menü Oluşturma

1. WordPress yönetim panelinde `Görünüm > Menüler` bölümüne gidin
2. Yeni bir menü oluşturun: `Ana Menü`
3. İstediğiniz sayfaları ekleyin
4. Menü konumu olarak `Ana Menü`'yü seçin
5. Menüyü kaydedin

## 4. API Erişimi için CORS Ayarları

WordPress'in `functions.php` dosyasına aşağıdaki kodu ekleyin:

```php
// CORS için header'ları ayarla
function add_cors_headers() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
    header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Authorization");
}
add_action('init', 'add_cors_headers');
```

## 5. ACF Alanlarını REST API'ye Eklemek

WordPress'in `functions.php` dosyasına aşağıdaki kodu ekleyin:

```php
// ACF alanlarını REST API'ye ekle
function acf_to_rest_api($response, $post, $request) {
    if (!function_exists('get_fields')) return $response;
    
    if (isset($post)) {
        $acf = get_fields($post->ID);
        $response->data['acf'] = $acf;
    }
    return $response;
}

add_filter('rest_prepare_services', 'acf_to_rest_api', 10, 3);
add_filter('rest_prepare_projects', 'acf_to_rest_api', 10, 3);
```

## 6. Görüntü Optimizasyonu

Yüksek performans için görüntüleri optimize edin:

1. `WP Smush` veya `Imagify` eklentisini kurun
2. Otomatik görüntü optimizasyonunu etkinleştirin
3. WebP formatını destekleyin

## 7. API Endpoint'leri

Kurulumdan sonra aşağıdaki API endpoint'leri kullanılabilir olacaktır:

- `https://your-wordpress-site.com/wp-json/wp/v2/posts` - Blog yazıları
- `https://your-wordpress-site.com/wp-json/wp/v2/pages` - Sayfalar
- `https://your-wordpress-site.com/wp-json/wp/v2/services` - Hizmetler
- `https://your-wordpress-site.com/wp-json/wp/v2/projects` - Projeler
- `https://your-wordpress-site.com/wp-json/menus/v1/menus/main-menu` - Ana Menü

## 8. Geliştirme Ortamında Kullanım

1. WordPress sitenizi localhost veya bir sunucuda çalıştırın
2. `.env.local` dosyasına API URL'nizi ekleyin:
   ```
   NEXT_PUBLIC_WORDPRESS_API_URL=https://your-wordpress-site.com/wp-json/wp/v2
   ```
3. Uygulamanız şimdi WordPress'ten veri çekmeye hazır! 