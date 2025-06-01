import React from 'react';

// İkon isimleri için tip kontrolü (IntelliSense için)
export type IconName =
  'x-icon'
  | 'bina'
  | 'ara'
  | 'egitim'
  | 'ev'
  | 'fuze'
  | 'grup'
  | 'harita'
  | 'harita2'
  | 'kalp'
  | 'konusma'
  | 'menu'
  | 'mouse'
  | 'x'
  | 'angle-down'
  | 'angle-left'
  | 'angle-right'
  | 'angle-up'
  | 'arrow'
  | 'facebook-f'
  | 'instagram'
  | 'linkedin-in'
  | 'linkedin'
  | 'twitter'
  | 'youtube'

type IconProps = {
  name: IconName;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  onClick?: () => void;
};

// Boyut sınıfları
const sizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
};

/**
 * rscn-font ikonlarını görüntülemek için Icon bileşeni
 * 
 * Kullanım:
 * <Icon name="ara" size="lg" className="text-primary" />
 */
export default function Icon({ name, className = '', size = 'md', onClick }: IconProps) {
  // Bazı ikonlar .path1, .path2, vb. gerektiriyor
  const multiPathIcons = ['bina', 'egitim', 'fuze', 'grup', 'harita', 'konusma'];
  const isMultiPath = multiPathIcons.includes(name);

  if (isMultiPath) {
    // Çoklu path'e sahip ikonlar için span içinde iç span'ler oluştur
    return (
      <span 
        className={`rs-${name} ${sizeClasses[size]} ${className}`}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        <span className="path1"></span>
        <span className="path2"></span>
        <span className="path3"></span>
        <span className="path4"></span>
        <span className="path5"></span>
        <span className="path6"></span>
      </span>
    );
  }

  // Standart ikonlar için
  return (
    <span 
      className={`rs-${name} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    ></span>
  );
} 