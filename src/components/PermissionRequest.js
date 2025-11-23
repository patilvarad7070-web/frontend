import React, { useState } from 'react';
import { Button } from './ui/button';
import { Camera, Bell, MapPin, CheckCircle2, X } from 'lucide-react';

const PermissionRequest = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [permissions, setPermissions] = useState({
    camera: false,
    notifications: false,
    location: false
  });

  const permissionSteps = [
    {
      icon: Camera,
      title: 'Camera Access',
      description: 'We need camera access to help you capture colors from your surroundings and outfits.',
      permission: 'camera',
      gradient: 'from-pink-200 to-rose-200'
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Get notified when new trending palettes are available and when your device is ready.',
      permission: 'notifications',
      gradient: 'from-purple-200 to-pink-200',
      optional: true
    },
    {
      icon: MapPin,
      title: 'Location (for Bluetooth)',
      description: 'Required by Android to scan for nearby Bluetooth devices like your LipstickDispenser.',
      permission: 'location',
      gradient: 'from-blue-200 to-indigo-200'
    }
  ];

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop the stream immediately after getting permission
      stream.getTracks().forEach(track => track.stop());
      setPermissions(prev => ({ ...prev, camera: true }));
      return true;
    } catch (error) {
      console.error('Camera permission denied:', error);
      return false;
    }
  };

  const requestNotificationPermission = async () => {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        const granted = permission === 'granted';
        setPermissions(prev => ({ ...prev, notifications: granted }));
        return granted;
      }
      return false;
    } catch (error) {
      console.error('Notification permission error:', error);
      return false;
    }
  };

  const requestLocationPermission = async () => {
    try {
      if ('geolocation' in navigator) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => {
              setPermissions(prev => ({ ...prev, location: true }));
              resolve(true);
            },
            () => {
              resolve(false);
            },
            { timeout: 5000 }
          );
        });
      }
      return false;
    } catch (error) {
      console.error('Location permission error:', error);
      return false;
    }
  };

  const handleAllow = async () => {
    const step = permissionSteps[currentStep];
    let granted = false;

    if (step.permission === 'camera') {
      granted = await requestCameraPermission();
    } else if (step.permission === 'notifications') {
      granted = await requestNotificationPermission();
    } else if (step.permission === 'location') {
      granted = await requestLocationPermission();
    }

    if (granted || step.optional) {
      moveToNext();
    }
  };

  const handleSkip = () => {
    moveToNext();
  };

  const moveToNext = () => {
    if (currentStep < permissionSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('permissions_requested', 'true');
    localStorage.setItem('permissions_granted', JSON.stringify(permissions));
    onComplete();
  };

  const step = permissionSteps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 gradient-elegant flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-3xl p-8 fade-in relative">
          {/* Skip Button */}
          <button
            onClick={handleComplete}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Progress */}
          <div className="flex justify-center space-x-2 mb-6">
            {permissionSteps.map((_, index) => (
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
            {/* Icon */}
            <div className={`inline-flex p-6 rounded-3xl bg-gradient-to-br ${step.gradient}`}>
              <Icon className="w-12 h-12 text-gray-700" />
            </div>

            {/* Title */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {step.title}
              </h2>
              {step.optional && (
                <span className="text-sm text-gray-500 italic">(Optional)</span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed">
              {step.description}
            </p>

            {/* Permission Status */}
            {permissions[step.permission] && (
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">Permission Granted</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 space-y-3">
            <Button
              onClick={handleAllow}
              className="w-full bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white rounded-full py-6"
            >
              {permissions[step.permission] ? 'Continue' : 'Allow'}
            </Button>

            {(step.optional || currentStep > 0) && (
              <Button
                onClick={handleSkip}
                variant="ghost"
                className="w-full"
              >
                {step.optional ? 'Skip for Now' : 'Maybe Later'}
              </Button>
            )}
          </div>

          {/* Footer Note */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Step {currentStep + 1} of {permissionSteps.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PermissionRequest;
