import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@/App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout from './components/DashboardLayout';
import HomePage from './pages/HomePage';
import ColorCapturePage from './pages/ColorCapturePage';
import AIShadeFinder from './pages/AIShadeFinder';
import MyShadesPage from './pages/MyShadesPage';
import DeviceControlPage from './pages/DeviceControlPage';
import ProfilePage from './pages/ProfilePage';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import SplashScreen from './components/SplashScreen';
import OnboardingFlow from './components/OnboardingFlow';
import PermissionRequest from './components/PermissionRequest';
import { Toaster } from './components/ui/sonner';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { token } = useAuth();
  return !token ? children : <Navigate to="/" />;
};

function AppContent() {
  const { token } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);

  useEffect(() => {
    // Check if onboarding has been completed
    const onboardingCompleted = localStorage.getItem('onboarding_completed');
    if (!onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    // Check if permissions have been requested and user is logged in
    if (token && !showOnboarding) {
      const permissionsRequested = localStorage.getItem('permissions_requested');
      if (!permissionsRequested) {
        setShowPermissions(true);
      }
    }
  }, [token, showOnboarding]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handlePermissionsComplete = () => {
    setShowPermissions(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (showPermissions && token) {
    return <PermissionRequest onComplete={handlePermissionsComplete} />;
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<HomePage />} />
            <Route path="capture" element={<ColorCapturePage />} />
            <Route path="ai-finder" element={<AIShadeFinder />} />
            <Route path="my-shades" element={<MyShadesPage />} />
            <Route path="device" element={<DeviceControlPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <PWAInstallPrompt />
      <Toaster position="top-center" richColors />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;