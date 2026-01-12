'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

const sizes = {
  sm: { container: 'w-8 h-8', px: 32 },
  md: { container: 'w-10 h-10', px: 40 },
  lg: { container: 'w-12 h-12', px: 48 },
  xl: { container: 'w-16 h-16', px: 64 },
};

export function Logo({ size = 'md', className, showText = true }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('relative rounded-full overflow-hidden', sizes[size].container)}>
        <Image 
          src="/logo.svg" 
          alt="MediaAI Logo"
          width={sizes[size].px}
          height={sizes[size].px}
          className="object-cover"
        />
      </div>
      {showText && (
        <div>
          <h1 className="text-lg font-bold text-white">MediaAI</h1>
          <p className="text-xs text-gray-500">Agência Inteligente</p>
        </div>
      )}
    </div>
  );
}

export function LogoIcon({ size = 'md', className }: Omit<LogoProps, 'showText'>) {
  return (
    <div className={cn('relative rounded-full overflow-hidden', sizes[size].container, className)}>
      <Image 
        src="/logo.svg" 
        alt="MediaAI Logo"
        width={sizes[size].px}
        height={sizes[size].px}
        className="object-cover"
      />
    </div>
  );
}
