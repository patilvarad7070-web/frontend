import React, { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import AuraLogo from './AuraLogo';

const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 gradient-elegant flex items-center justify-center z-50 fade-in">
      <div className="text-center space-y-6 animate-fade-in-up">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <AuraLogo size="3xl" variant="rose-gold" className="animate-pulse-slow" />
        </div>
        
        {/* Brand Name */}
        <div className="space-y-2">
          <h1 className="text-5xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
            Aura
          </h1>
          <p className="text-lg text-gray-600 italic tracking-wide">
            own your shine
          </p>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center items-center space-x-2 mt-8">
          <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;