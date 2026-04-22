import React from 'react';

interface LogoProps {
  className?: string;
  showDot?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className, showDot = true }) => {
  return (
    <div className={`logo ${className || ''}`}>
      <span style={{ fontFamily: 'var(--font-geist-mono)' }}>LYNCE</span>
      {showDot && <span className="logo-accent">✦</span>}
    </div>
  );
};
