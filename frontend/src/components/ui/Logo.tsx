import React from 'react';

interface LogoProps {
  className?: string;
  showDot?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className, showDot = true }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
        fontSize: 'inherit',
        letterSpacing: '0.2em',
        color: '#FFFFFF',
        textTransform: 'uppercase'
      }}>
        LYNCE
      </span>
      {showDot && (
        <span style={{ color: '#00F5FF', fontSize: '1.2em', lineHeight: 1 }}>✦</span>
      )}
    </div>
  );
};
