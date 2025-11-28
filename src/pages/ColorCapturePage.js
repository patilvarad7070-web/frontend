import React, { useState, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Camera, Upload, Save } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ColorCapturePage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [shadeName, setShadeName] = useState('');
  const [saving, setSaving] = useState(false);
  const [showCameraOptions, setShowCameraOptions] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const token = localStorage.getItem('aura_token');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      setShowCameraOptions(false);
    }
  };

  const handleCaptureClick = () => {
    setShowCameraOptions(!showCameraOptions);
  };

  const analyzeColor = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setAnalyzing(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${API}/analyze/color`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setResult(response.data);
      setShadeName(response.data.suggested_name);
      toast.success('Color analyzed successfully!');
    } catch (error) {
      toast.error('Failed to analyze color');
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const saveShade = async () => {
    if (!result || !shadeName.trim()) {
      toast.error('Please provide a name for your shade');
      return;
    }

    setSaving(true);
    try {
      await axios.post(
        `${API}/shades`,
        {
          name: shadeName,
          rgb: result.dominant_color,
          lab: result.lab_values,
          hex_color: result.hex_color,
          source: 'camera'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('Shade saved to your collection!');
      // Reset
      setSelectedFile(null);
      setResult(null);
      setShadeName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      toast.error('Failed to save shade');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in" data-testid="color-capture-page">
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Match Your Look</h2>
          <p className="text-gray-600">Capture any color and transform it into your perfect lipstick shade</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="border-2 border-dashed border-pink-300 rounded-2xl p-8 text-center bg-white/40 hover:bg-white/60 transition-colors">
              {!showCameraOptions ? (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    data-testid="file-input"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 mb-4">
                      {selectedFile ? <Camera className="w-8 h-8 text-rose-600" /> : <Upload className="w-8 h-8 text-rose-600" />}
                    </div>
                    <p className="text-gray-700 font-medium mb-2">
                      {selectedFile ? selectedFile.name : 'Click to upload an image'}
                    </p>
                    <p className="text-sm text-gray-500 mb-3">Capture your outfit, fabric, or any inspiration</p>
                  </label>
                  
                  <Button
                    onClick={handleCaptureClick}
                    variant="outline"
                    className="mt-4 rounded-full"
                    data-testid="show-camera-options"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Or Capture with Camera
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-700 font-medium mb-4">Choose capture method:</p>
                  
                  {/* Camera Capture */}
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="camera-capture"
                    data-testid="camera-input"
                  />
                  <label htmlFor="camera-capture" className="cursor-pointer">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-colors">
                      <Camera className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700">Take Photo</p>
                      <p className="text-xs text-gray-500">Use camera to capture</p>
                    </div>
                  </label>

                  {/* File Upload */}
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl hover:from-pink-100 hover:to-purple-100 transition-colors">
                      <Upload className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700">Choose from Gallery</p>
                      <p className="text-xs text-gray-500">Pick existing photo</p>
                    </div>
                  </label>

                  <Button
                    onClick={() => setShowCameraOptions(false)}
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {selectedFile && (
              <div className="space-y-4">
                <div className="rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Selected"
                    className="w-full h-64 object-cover"
                    data-testid="preview-image"
                  />
                </div>
                <Button
                  onClick={analyzeColor}
                  disabled={analyzing}
                  data-testid="analyze-button"
                  className="w-full bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white py-6 rounded-full"
                >
                  {analyzing ? 'Analyzing...' : 'Analyze Color'}
                </Button>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {result ? (
              <>
                <div className="bg-white/60 rounded-2xl p-6 space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">Extracted Color</h3>
                  <div
                    className="color-swatch"
                    style={{ backgroundColor: result.hex_color }}
                    data-testid="color-preview"
                  ></div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 font-medium">Hex</p>
                      <p className="text-gray-800 font-mono" data-testid="hex-value">{result?.hex_color}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">RGB</p>
                      <p className="text-gray-800 font-mono" data-testid="rgb-value">
                        {result?.dominant_color?.r}, {result?.dominant_color?.g}, {result?.dominant_color?.b}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="shade-name" className="text-gray-700 mb-2 block">Shade Name</Label>
                    <Input
                      id="shade-name"
                      value={shadeName}
                      onChange={(e) => setShadeName(e.target.value)}
                      placeholder="Enter a name for your shade"
                      data-testid="shade-name-input"
                      className="bg-white/60 border-pink-200 focus:border-rose-400"
                    />
                  </div>
                  <Button
                    onClick={saveShade}
                    disabled={saving}
                    data-testid="save-shade-button"
                    className="w-full bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white py-6 rounded-full flex items-center justify-center space-x-2"
                  >
                    <Save className="w-5 h-5" />
                    <span>{saving ? 'Saving...' : 'Save to My Shades'}</span>
                  </Button>
                </div>
              </>
            ) : (
              <div className="bg-white/40 rounded-2xl p-8 text-center h-full flex items-center justify-center">
                <div>
                  <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Upload and analyze an image to see results</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorCapturePage;