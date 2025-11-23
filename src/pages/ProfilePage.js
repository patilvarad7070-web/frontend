import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { User, Save } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const ProfilePage = () => {
  const { user, updateProfile} = useAuth();
  const [skinTone, setSkinTone] = useState(user?.skin_tone || '');
  const [hairColor, setHairColor] = useState(user?.hair_color || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.skin_tone) {
      setSkinTone(user.skin_tone);
    }
    if (user?.hair_color) {
      setHairColor(user.hair_color);
    }
  }, [user]);

  const skinToneOptions = [
    { value: 'fair', label: 'Fair', description: 'Light complexion with pink or neutral undertones' },
    { value: 'light', label: 'Light', description: 'Light to medium with warm or cool undertones' },
    { value: 'medium', label: 'Medium', description: 'Medium complexion with golden or olive undertones' },
    { value: 'tan', label: 'Tan', description: 'Tan complexion with warm golden undertones' },
    { value: 'deep', label: 'Deep', description: 'Deep complexion with rich warm or cool undertones' },
    { value: 'dark', label: 'Dark', description: 'Dark complexion with deep warm or cool undertones' },
  ];

  const hairColorOptions = [
    { value: 'black', label: 'Black', description: 'Deep black hair' },
    { value: 'dark_brown', label: 'Dark Brown', description: 'Rich dark brown' },
    { value: 'medium_brown', label: 'Medium Brown', description: 'Natural medium brown' },
    { value: 'light_brown', label: 'Light Brown', description: 'Light brown with warm tones' },
    { value: 'blonde', label: 'Blonde', description: 'Light blonde shades' },
    { value: 'red', label: 'Red', description: 'Auburn or red tones' },
    { value: 'gray', label: 'Gray/Silver', description: 'Gray or silver hair' },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ skin_tone: skinTone, hair_color: hairColor });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in" data-testid="profile-page">
      <div className="max-w-2xl mx-auto">
        <div className="glass-card rounded-3xl p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Profile Settings</h2>
            <p className="text-gray-600">Personalize your Aura experience</p>
          </div>

          <div className="space-y-6">
            {/* User Info */}
            <div className="bg-white/60 rounded-2xl p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                  <User className="w-8 h-8 text-rose-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800">{user?.full_name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Skin Tone Selection */}
            <div className="bg-white/60 rounded-2xl p-6 space-y-4">
              <div>
                <Label htmlFor="skin-tone" className="text-gray-700 mb-2 block font-semibold">
                  Skin Tone
                </Label>
                <p className="text-sm text-gray-600 mb-4">
                  Help our AI recommend shades that complement your complexion
                </p>
                <Select value={skinTone} onValueChange={setSkinTone}>
                  <SelectTrigger id="skin-tone" data-testid="skin-tone-select" className="bg-white/60">
                    <SelectValue placeholder="Select your skin tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {skinToneOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} data-testid={`skin-tone-${option.value}`}>
                        <div>
                          <p className="font-medium">{option.label}</p>
                          <p className="text-xs text-gray-500">{option.description}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {skinTone && (
                <div className="p-4 bg-pink-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Selected: </span>
                    {skinToneOptions.find((opt) => opt.value === skinTone)?.label}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {skinToneOptions.find((opt) => opt.value === skinTone)?.description}
                  </p>
                </div>
              )}
            </div>

            {/* Hair Color Selection */}
            <div className="bg-white/60 rounded-2xl p-6 space-y-4">
              <div>
                <Label htmlFor="hair-color" className="text-gray-700 mb-2 block font-semibold">
                  Hair Color
                </Label>
                <p className="text-sm text-gray-600 mb-4">
                  Your hair color helps AI suggest shades that create a harmonious look
                </p>
                <Select value={hairColor} onValueChange={setHairColor}>
                  <SelectTrigger id="hair-color" data-testid="hair-color-select" className="bg-white/60">
                    <SelectValue placeholder="Select your hair color" />
                  </SelectTrigger>
                  <SelectContent>
                    {hairColorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} data-testid={`hair-color-${option.value}`}>
                        <div>
                          <p className="font-medium">{option.label}</p>
                          <p className="text-xs text-gray-500">{option.description}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {hairColor && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Selected: </span>
                    {hairColorOptions.find((opt) => opt.value === hairColor)?.label}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {hairColorOptions.find((opt) => opt.value === hairColor)?.description}
                  </p>
                </div>
              )}
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={saving}
              data-testid="save-profile-button"
              className="w-full bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white py-6 rounded-full flex items-center justify-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </Button>
          </div>

          {/* Info Section */}
          <div className="mt-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
            <h4 className="font-semibold text-gray-800 mb-2">Why These Details Matter</h4>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              <span className="font-medium">Skin Tone:</span> Helps our AI recommend lipstick shades that complement your natural complexion and undertones.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              <span className="font-medium">Hair Color:</span> Allows AI to suggest shades that create a harmonious, balanced look with your overall appearance.
            </p>
          </div>

          {/* View Tutorial Again */}
          <div className="mt-6">
            <Button
              onClick={() => {
                localStorage.removeItem('onboarding_completed');
                window.location.reload();
              }}
              variant="outline"
              className="w-full rounded-full"
            >
              View Tutorial Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;