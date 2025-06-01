"use client";

import Image from "next/image";
import { ReactNode, memo, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import styles from './PageHeader.module.scss';
import { convertToProxyUrl } from '@/lib/utils';

// Görsel bileşenini memoize et
const OptimizedImage = memo(({ src, alt }: { src: string, alt: string }) => (
  <Image
    src={src}
    alt={alt}
    fill
    priority
    className={styles.image}
    sizes="100vw"
    quality={85}
  />
));

OptimizedImage.displayName = 'OptimizedImage';

// Fallback bileşeni
const ImageFallback = () => (
  <div className="w-full h-full bg-gray-200 animate-pulse"></div>
);

// Motion bileşenlerini yüklemek için hafif fallback
const MotionDiv = motion.div;

type PageHeaderProps = {
  title: string;
  description?: string;
  imageUrl: string | null;
  imageAlt?: string;
  children?: ReactNode;
  titleContainerClassName?: string;
  variant?: 'home' | 'page';
  socialLinks?: React.ReactNode;
};

const PageHeader = memo(function PageHeader({
  title,
  description,
  imageUrl,
  imageAlt = "Header image",
  children,
  titleContainerClassName = "",
  variant = 'page',
  socialLinks,
}: PageHeaderProps) {
  // Görsel URL'sini optimize et
  const optimizedImageUrl = imageUrl 
    ? convertToProxyUrl(imageUrl) 
    : '/images/placeholder/hero.png';

  if (variant === 'home') {
    return (
      <div className={styles.homeHeader}>
        <div className={styles.homeImageContainer}>
          {imageUrl ? (
            <OptimizedImage src={optimizedImageUrl} alt={imageAlt} />
          ) : (
            <ImageFallback />
          )}
          <div className={styles.overlay}></div>
        </div>
        <div className={styles.homeContentWrapper}>
          {socialLinks && (
            <div className={styles.homeContentSocial}>
              {socialLinks}
            </div>
          )}
          <div>
            <div className={styles.titleContainer}>
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={titleContainerClassName ? titleContainerClassName : ''}
              >
                <h1 className={styles.title}>{title}</h1>
                {description && (
                  <p 
                    className={styles.description} 
                    dangerouslySetInnerHTML={{ __html: description }}
                  ></p>
                )}
              </MotionDiv>
            </div>
            {children && (
              <div className={styles.homeContentSlogan}>
                {children}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // page variant
  return (
    <div className={styles.pageHeader}>
      {/* Background image */}
      <div className={styles.pageImageContainer}>
        <Suspense fallback={<ImageFallback />}>
          {imageUrl ? (
            <OptimizedImage src={optimizedImageUrl} alt={imageAlt} />
          ) : (
            <ImageFallback />
          )}
        </Suspense>
        <div className={styles.overlay}></div>
      </div>
      {/* Content container */}
      <div className={`${styles.pageContentWrapper} pt-0`}>
        {/* Title Section with Container */}
        <div className="container mx-auto px-4 max-w-4xl mt-0">
          <div className={`${styles.titleContainer} mb-2`}>
            <div className={styles.titleSection}>
              <MotionDiv
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={titleContainerClassName ? titleContainerClassName : ''}
              >
                <h1 className={styles.title}>{title}</h1>
                {description && (
                  <div 
                    className={styles.description} 
                    dangerouslySetInnerHTML={{ __html: description }}
                  ></div>
                )}
              </MotionDiv>
            </div>
          </div>
        </div>
        
        {/* Page Content with Container */}
        <div className="w-full">
          <div className={`${styles.pageContent} py-2`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
});

export default PageHeader; 