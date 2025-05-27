"use client";

import Image from "next/image";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import styles from './PageHeader.module.scss';

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

export default function PageHeader({
  title,
  description,
  imageUrl,
  imageAlt = "Header image",
  children,
  titleContainerClassName = "",
  variant = 'page',
  socialLinks,
}: PageHeaderProps) {
  if (variant === 'home') {
    return (
      <div className={styles.homeHeader}>
        <div className={styles.homeImageContainer}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              priority
              className={styles.image}
            />
          ) : (
            <div className="w-full h-full bg-gray-200"></div>
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={titleContainerClassName ? titleContainerClassName : ''}
              >
                <h1 className={styles.title}>{title}</h1>
                {description && (
                  <p 
                    className={styles.description} 
                    dangerouslySetInnerHTML={{ __html: description }}
                  ></p>
                )}
              </motion.div>
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
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            priority
            className={styles.image}
          />
        ) : (
          <div className="w-full h-full bg-gray-200"></div>
        )}
        <div className={styles.overlay}></div>
      </div>
      {/* Content container */}
      <div className={`${styles.pageContentWrapper} pt-0`}>
        {/* Title Section with Container */}
        <div className="container mx-auto px-4 max-w-4xl mt-0">
          <div className={`${styles.titleContainer} mb-2`}>
            <div className={styles.titleSection}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={titleContainerClassName ? titleContainerClassName : ''}
              >
                <h1 className={styles.title}>{title}</h1>
                {description && (
                  <div 
                    className={styles.description} 
                    dangerouslySetInnerHTML={{ __html: description }}
                  ></div>
                )}
              </motion.div>
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
} 