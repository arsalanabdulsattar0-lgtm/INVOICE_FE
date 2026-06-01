import React from 'react';

export interface ScrollAreaProps {
  children: React.ReactNode;
  maxHeight?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ children, maxHeight = "auto", className = "", style }, ref) => (
    <div
      ref={ref}
      className={`custom-scrollbar ${className}`}
      style={{
        maxHeight,
        overflowY: className.includes('overflow-y-visible') ? 'visible' : 'auto',
        ...style
      }}
    >
      {children}
    </div>
  )
);
ScrollArea.displayName = 'ScrollArea';
