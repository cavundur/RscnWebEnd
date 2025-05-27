"use client";

import { ReactNode } from "react";

/**
 * Section bileşeni - Animasyon kaldırıldı, sadece padding ve container yapısı kaldı.
 */
type SectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  maxWidth?: string; // Maksimum genişlik için özel sınıf
  isFirst?: boolean; // İlk section olup olmadığını belirten prop
  noPadding?: boolean; // Padding olmamasını istediğimiz durumlar için
};

export default function Section({
  children,
  className = "",
  id,
  maxWidth = "max-w-4xl",
  isFirst = false,
  noPadding = false,
}: SectionProps) {
  // Padding sınıfını belirle
  let paddingClass = "py-0";
  if (!noPadding) {
    paddingClass = isFirst ? "pt-0 pb-10" : "py-10";
  }

  return (
    <section id={id} className={`${paddingClass} overflow-hidden ${className}`}>
      <div className={`container mx-auto px-4 ${maxWidth}`}>
        {children}
      </div>
    </section>
  );
} 