import React from 'react';
import Link from 'next/link';

export interface LogoProps {
  href?: string;
  className?: string;
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({
  href = '/',
  className = '',
  showWordmark = true,
  size = 'md',
}) => {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  };

  const content = (
    <span className={`inline-flex items-center gap-2 select-none ${className}`}>
      <svg
        className={`${iconSizes[size]} text-accent shrink-0`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M3 20H9V14H12V11H15V8H18V5H21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      </svg>
      {showWordmark && (
        <span
          className={`font-serif ${textSizes[size]} font-normal tracking-tight text-ink`}
        >
          Vestly
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
      >
        {content}
      </Link>
    );
  }

  return content;
};
