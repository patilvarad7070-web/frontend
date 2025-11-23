import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Camera, Wand2, Palette, Bluetooth, Sparkles, BluetoothOff, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import bluetoothService from '../services/bluetoothService';
import AuraLogo from '../components/AuraLogo';

const BACKEND_URL = "https://backend-qz8e.onrender.com";
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const navigate = useNavigate();
  const [deviceStatus, setDeviceStatus] = useState({ connected: false, connecting: false });
  const token = localStorage.getItem('aura_token');

  useEffect(() => {
    checkDeviceStatus();
    // Check device status every 3 seconds
    const interval = setInterval(checkDeviceStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const checkDeviceStatus = () => {
    const status = bluetoothService.getConnectionStatus();
    setDeviceStatus({
      connected: status.isConnected,
      deviceName: status.deviceName || 'Dispenser',
      connecting: false
    });
  };

  const features = [
    {
      icon: Camera,
      title: 'Match Your Look',
      description: 'Capture any color from your outfit or surroundings',
      gradient: 'from-pink-400 to-rose-400',
      action: () => navigate('/capture'),
      testId: 'home-capture-button'
    },
    {
      icon: Wand2,
      title: 'AI Shade Finder',
      description: 'Discover perfect shades with AI recommendations',
      gradient: 'from-purple-400 to-pink-400',
      action: () => navigate('/ai-finder'),
      testId: 'home-ai-finder-button'
    },
    {
      icon: Palette,
      title: 'My Shades',
      description: 'Access your personalized shade collection',
      gradient: 'from-rose-400 to-pink-400',
      action: () => navigate('/my-shades'),
      testId: 'home-my-shades-button'
    },
    {
      icon: Bluetooth,
      title: 'Device Control',
      description: deviceStatus.connected ? 'Device connected - Ready to dispense' : 'Connect your Aura device',
      gradient: 'from-indigo-400 to-purple-400',
      action: () => navigate('/device'),
      testId: 'home-device-button'
    },
  ];

  return (
    <div className="fade-in" data-testid="home-page">
      {/* Hero Section */}
      <div className="glass-card rounded-3xl p-8 sm:p-12 mb-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100/50 to-purple-100/50 -z-10"></div>
        <div className="mb-6 flex justify-center">
          <AuraLogo size="xl" variant="rose-gold" />
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 mb-4">
          Your Perfect Lip Shade,<br />Every Time
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          Stop buying dozens of lipsticks. Start creating the one you need, right when you need it.
        </p>
        
        {/* Device Connection Status */}
        <div className="flex justify-center">
          {deviceStatus.connecting ? (
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full" data-testid="device-status-connecting">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Connecting to Device...</span>
            </div>
          ) : deviceStatus.connected ? (
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-full" data-testid="device-status-connected">
              <div className="w-2 h-2 bg-green-500 rounded-full pulse-dot"></div>
              <Bluetooth className="w-4 h-4" />
              <span className="text-sm font-medium">{deviceStatus.deviceName} Connected</span>
            </div>
          ) : (
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full" data-testid="device-status-disconnected">
              <BluetoothOff className="w-4 h-4" />
              <span className="text-sm font-medium">Device Disconnected</span>
            </div>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="glass-card rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={feature.action}
              data-testid={feature.testId}
            >
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="glass-card rounded-2xl p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">How Aura Works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-rose-500 mb-2">1</div>
            <p className="text-sm text-gray-600">Capture or discover your perfect shade</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-rose-500 mb-2">2</div>
            <p className="text-sm text-gray-600">Save it to your personal collection</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-rose-500 mb-2">3</div>
            <p className="text-sm text-gray-600">Dispense custom-blended lipstick instantly</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;