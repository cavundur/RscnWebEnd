import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

type LogoProps = {
  className?: string;
  width?: number;
  height?: number;
};

export default function Logo({ className = '', width = 120, height = 40 }: LogoProps) {
  return (
    <Image
      src="/assets/logos/rscn-logo.svg"
      alt="RSCN Logo"
      width={width}
      height={height}
      priority
      className={`transition-transform hover:scale-105 ${className}`}
    />
  );
} 