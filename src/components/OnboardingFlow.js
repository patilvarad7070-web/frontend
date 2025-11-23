import React, { useState } from 'react';
import { Button } from './ui/button';
import { ChevronRight, ChevronLeft, Sparkles, Camera, Wand2, Palette, Bluetooth } from 'lucide-react';
import AuraLogo from './AuraLogo';

const OnboardingFlow = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Sparkles,
      title: 'Welcome to Aura',
      subtitle: 'Bespoke Beauty',
      description: 'Your perfect lip shade, every time. Stop buying dozens of lipsticks and start creating the one you need, right when you need it.',
      gradient: 'from-pink-200 to-purple-200',
      useLogo: true
    },
    {
      icon: Camera,
      title: 'Match Any Color',
      description: 'Capture colors from your outfit, accessories, or inspiration. Our AI analyzes and extracts the perfect shade using advanced color science.',
      features: [
        'Upload photos to capture colors',
        'AI-powered color extraction',
        'RGB to LAB color conversion',
        'Save shades to your collection'
      ],
      gradient: 'from-rose-200 to-pink-200'
    },
    {
      icon: Wand2,
      title: 'AI Shade Recommendations',
      description: 'Get personalized shade recommendations based on your skin tone, hair color, and outfit.',
      features: [
        'Reference Look: Extract celebrity lipstick colors',
        'Event Look: Get outfit-based recommendations',
        'Trending palettes for seasonal inspiration',
        'Personalized to your unique features'
      ],
      gradient: 'from-purple-200 to-indigo-200'
    },
    {
      icon: Bluetooth,
      title: 'Dispense Custom Shades',
      description: 'Connect to your LipstickDispenser hardware and create fresh, custom-blended lipstick instantly.',
      features: [
        'Bluetooth connection to your device',
        'Real-time RGB data transmission',
        'Emergency stop for safety',
        'Mix CMYK pigments on demand'
      ],
      gradient: 'from-blue-200 to-cyan-200'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    onComplete();
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 gradient-elegant flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl">
        <div className="glass-card rounded-3xl p-8 sm:p-12 fade-in">
          {/* Progress Indicators */}
          <div className="flex justify-center space-x-2 mb-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-gradient-to-r from-rose-400 to-pink-400'
                    : index < currentStep
                    ? 'w-2 bg-rose-300'
                    : 'w-2 bg-gray-300'
                }`}
              ></div>
            ))}
          </div>

          {/* Content */}
          <div className="text-center space-y-6">
            {/* Icon/Image */}
            {step.useLogo ? (
              <div className="flex justify-center mb-6">
                <AuraLogo size="2xl" variant="rose-gold" />
              </div>
            ) : step.image ? (
              <div className="flex justify-center mb-6">
                <img
                  src={step.image}
                  alt="Aura Logo"
                  className="w-40 h-40 object-contain"
                />
              </div>
            ) : (
              <div className={`inline-flex p-6 rounded-3xl bg-gradient-to-br ${step.gradient} mb-4`}>
                <Icon className="w-12 h-12 text-gray-700" />
              </div>
            )}

            {/* Title */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
                {step.title}
              </h2>
              {step.subtitle && (
                <p className="text-lg text-gray-600 italic">{step.subtitle}</p>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed max-w-xl mx-auto">
              {step.description}
            </p>

            {/* Features List */}
            {step.features && (
              <div className="bg-white/60 rounded-2xl p-6 text-left max-w-md mx-auto">
                <ul className="space-y-3">
                  {step.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              onClick={handlePrevious}
              variant="ghost"
              disabled={currentStep === 0}
              className="flex items-center space-x-2 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>

            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip
            </button>

            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white rounded-full flex items-center space-x-2 px-6"
            >
              <span>{currentStep === steps.length - 1 ? "Get Started" : "Next"}</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;