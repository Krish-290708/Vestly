'use client';

import React, { useState, useRef } from 'react';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  align?: 'top' | 'bottom';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  align = 'top',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipId = React.useId();

  const posClasses =
    align === 'top'
      ? 'bottom-full mb-1.5 left-1/2 -translate-x-1/2'
      : 'top-full mt-1.5 left-1/2 -translate-x-1/2';

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      <div aria-describedby={isVisible ? tooltipId : undefined} className="inline-flex">
        {children}
      </div>

      {isVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          className={`absolute z-50 pointer-events-none whitespace-normal w-max max-w-xs ${posClasses} bg-ink text-paper text-[11px] px-2 py-1 rounded-sm shadow-popover leading-tight ${className}`}
        >
          {content}
        </div>
      )}
    </div>
  );
};
