import React from 'react';

const AuraLogo = ({ size = 'md', variant = 'rose-gold', className = '' }) => {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
    '2xl': 'w-32 h-32',
    '3xl': 'w-48 h-48'
  };

  // Enhanced color variants with filters
  const getVariantStyle = (variant) => {
    switch(variant) {
      case 'rose-gold':
      default:
        return {
          filter: 'brightness(1.1) saturate(1.2) drop-shadow(0 2px 8px rgba(197, 156, 148, 0.4))',
          opacity: 1
        };
      case 'gold':
        return {
          filter: 'brightness(1.2) saturate(1.4) hue-rotate(10deg) drop-shadow(0 2px 8px rgba(255, 215, 0, 0.5))',
          opacity: 1
        };
      case 'silver':
        return {
          filter: 'grayscale(0.8) brightness(1.3) contrast(1.2) drop-shadow(0 2px 8px rgba(192, 192, 192, 0.5))',
          opacity: 1
        };
      case 'white':
        return {
          filter: 'brightness(1.8) contrast(1.1) drop-shadow(0 2px 8px rgba(255, 255, 255, 0.6))',
          opacity: 0.95
        };
      case 'gradient':
        return {
          filter: 'brightness(1.15) saturate(1.3) drop-shadow(0 3px 12px rgba(255, 105, 180, 0.4))',
          opacity: 1
        };
    }
  };

  const variantStyle = getVariantStyle(variant);

  return (
    <div className={`${sizes[size]} ${className} relative flex items-center justify-center`}>
      {/* Circular container with black background */}
      <div 
        className="w-full h-full rounded-full overflow-hidden flex items-center justify-center relative"
        style={{
          background: '#000000',
          boxShadow: '0 4px 16px rgba(197, 156, 148, 0.3), inset 0 2px 4px rgba(0, 0, 0, 0.3)',
          border: '2px solid rgba(197, 156, 148, 0.4)'
        }}
      >
        {/* Rose-gold flame logo on black background */}
        <img
          src="https://customer-assets.emergentagent.com/job_bespoke-beauty/artifacts/g6s10qyg_Screenshot_20251119-121316.ChatGPT~2%5B1%5D.png"
          alt="Aura Logo"
          className="w-[70%] h-[70%] object-contain"
          style={variantStyle}
        />
      </div>
    </div>
  );
};

export default AuraLogo;
