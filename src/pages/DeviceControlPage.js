import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Bluetooth, BluetoothOff, Droplet, CheckCircle2, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import bluetoothService from '../services/bluetoothService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DeviceControlPage = () => {
  const [deviceStatus, setDeviceStatus] = useState({ connected: false, deviceName: null });
  const [shades, setShades] = useState([]);
  const [selectedShade, setSelectedShade] = useState(null);
  const [dispensing, setDispensing] = useState(false);
  const [lastDispensed, setLastDispensed] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const token = localStorage.getItem('aura_token');

  useEffect(() => {
    checkDeviceStatus();
    fetchShades();
    
    // Check for quick dispense shade
    const quickDispenseShade = localStorage.getItem('quick_dispense_shade');
    if (quickDispenseShade) {
      try {
        const shade = JSON.parse(quickDispenseShade);
        setSelectedShade(shade);
        localStorage.removeItem('quick_dispense_shade');
        toast.info(`Ready to dispense: ${shade.name}`);
      } catch (error) {
        console.error('Error parsing quick dispense shade:', error);
      }
    }
  }, []);

  const checkDeviceStatus = () => {
    // Check real Bluetooth connection status
    const status = bluetoothService.getConnectionStatus();
    setDeviceStatus({
      connected: status.isConnected,
      deviceName: status.deviceName || 'Dispenser',
      device_id: status.deviceId || 'LipstickDispenser'
    });
  };

  const fetchShades = async () => {
    try {
      const response = await axios.get(`${API}/shades`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShades(response.data);
    } catch (error) {
      console.error('Failed to fetch shades:', error);
    }
  };

  const connectDevice = async () => {
    setConnecting(true);
    try {
      // Check if Bluetooth is supported
      if (!bluetoothService.isBluetoothSupported()) {
        toast.error('Bluetooth not supported. Use Chrome on Android or Desktop.');
        setConnecting(false);
        return;
      }

      // Connect to real hardware
      const result = await bluetoothService.connect();
      
      toast.success(`Connected to ${result.deviceName}!`);
      checkDeviceStatus();
    } catch (error) {
      toast.error(error.message || 'Failed to connect to device');
      console.error('Connection error:', error);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectDevice = async () => {
    try {
      await bluetoothService.disconnect();
      toast.success('Device disconnected');
      checkDeviceStatus();
    } catch (error) {
      toast.error('Failed to disconnect device');
      console.error(error);
    }
  };

  const handleDispenseClick = () => {
    if (!selectedShade) {
      toast.error('Please select a shade first');
      return;
    }

    if (!deviceStatus.connected) {
      toast.error('Device not connected');
      return;
    }

    setConfirmDialogOpen(true);
  };

  const confirmDispense = async () => {
    setConfirmDialogOpen(false);
    setDispensing(true);
    
    try {
      // Check connection
      if (!bluetoothService.isConnected) {
        toast.error('Device not connected. Please connect first.');
        setDispensing(false);
        return;
      }

      // Send RGB data and trigger dispensing
      toast.info('Sending color data to device...');
      
      const result = await bluetoothService.dispenseShade(selectedShade.rgb);
      
      toast.success('Shade dispensed successfully!');
      
      // Calculate mix formula for display
      const mixFormula = {
        cyan: Math.round(255 - selectedShade.rgb.r),
        magenta: Math.round(255 - selectedShade.rgb.g),
        yellow: Math.round(255 - selectedShade.rgb.b),
        black: Math.round((255 - Math.max(selectedShade.rgb.r, selectedShade.rgb.g, selectedShade.rgb.b)) * 0.3)
      };

      setLastDispensed({
        message: 'Shade dispensed successfully',
        shade: selectedShade,
        mix_formula: mixFormula
      });

    } catch (error) {
      toast.error(error.message || 'Failed to dispense shade');
      console.error('Dispense error:', error);
    } finally {
      setDispensing(false);
    }
  };

  const handleEmergencyStop = async () => {
    try {
      await bluetoothService.emergencyStop();
      toast.success('Pumps stopped!');
      setDispensing(false);
    } catch (error) {
      toast.error('Failed to stop pumps');
      console.error(error);
    }
  };

  return (
    <div className="fade-in" data-testid="device-control-page">
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Device Control</h2>
          <p className="text-gray-600">Connect and control your Aura lipstick dispenser</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Device Status */}
          <div className="space-y-6">
            <div className="bg-white/60 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Device Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl">
                  <div className="flex items-center space-x-3">
                    {deviceStatus.connected ? (
                      <div className="p-2 bg-green-100 rounded-full">
                        <Bluetooth className="w-6 h-6 text-green-600" />
                      </div>
                    ) : (
                      <div className="p-2 bg-gray-100 rounded-full">
                        <BluetoothOff className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-800">
                        {deviceStatus.connected ? 'Connected' : 'Disconnected'}
                      </p>
                      {deviceStatus.connected && (
                        <p className="text-sm text-gray-500">{deviceStatus.deviceName}</p>
                      )}
                    </div>
                  </div>
                  {deviceStatus.connected && (
                    <div className="w-3 h-3 bg-green-500 rounded-full pulse-dot"></div>
                  )}
                </div>

                {!bluetoothService.isBluetoothSupported() && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      Bluetooth not supported. Use Chrome on Android or Desktop.
                    </p>
                  </div>
                )}

                {deviceStatus.connected ? (
                  <Button
                    onClick={disconnectDevice}
                    data-testid="disconnect-button"
                    variant="outline"
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Disconnect Device
                  </Button>
                ) : (
                  <Button
                    onClick={connectDevice}
                    disabled={connecting}
                    data-testid="connect-button"
                    className="w-full bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 text-white py-6 rounded-full"
                  >
                    {connecting ? 'Connecting...' : 'Connect to Dispenser'}
                  </Button>
                )}
              </div>
            </div>

            {/* Shade Selection */}
            <div className="bg-white/60 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Select Shade</h3>
              {shades.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No shades available. Create some first!</p>
              ) : (
                <div className="space-y-4">
                  <Select
                    onValueChange={(value) => {
                      const shade = shades.find((s) => s.id === value);
                      setSelectedShade(shade);
                    }}
                  >
                    <SelectTrigger data-testid="shade-select" className="bg-white/60">
                      <SelectValue placeholder="Choose a shade to dispense" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(shades) && shades.map((shade) => (
                        <SelectItem key={shade.id} value={shade.id} data-testid={`shade-option-${shade.id}`}>
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-6 h-6 rounded-full border-2 border-white shadow"
                              style={{ backgroundColor: shade.hex_color }}
                            ></div>
                            <span>{shade.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedShade && (
                    <div className="p-4 bg-white/60 rounded-xl">
                      <div
                        className="h-24 rounded-lg mb-3"
                        style={{ backgroundColor: selectedShade.hex_color }}
                        data-testid="selected-shade-preview"
                      ></div>
                      <p className="font-medium text-gray-800">{selectedShade.name}</p>
                      <p className="text-sm text-gray-500 font-mono">{selectedShade.hex_color}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Dispense Control */}
          <div className="space-y-6">
            <div className="bg-white/60 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Dispense Control</h3>
              <div className="space-y-3">
                <Button
                  onClick={handleDispenseClick}
                  disabled={!deviceStatus.connected || !selectedShade || dispensing}
                  data-testid="dispense-button"
                  className="w-full bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white py-8 rounded-full text-lg flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Droplet className="w-6 h-6" />
                  <span>{dispensing ? 'Dispensing...' : 'Dispense Shade'}</span>
                </Button>

                {dispensing && (
                  <Button
                    onClick={handleEmergencyStop}
                    data-testid="emergency-stop-button"
                    variant="destructive"
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-full flex items-center justify-center space-x-2"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    <span>EMERGENCY STOP</span>
                  </Button>
                )}

                {!deviceStatus.connected && (
                  <p className="text-sm text-gray-500 text-center mt-4">Connect device to dispense</p>
                )}
                {!selectedShade && deviceStatus.connected && (
                  <p className="text-sm text-gray-500 text-center mt-4">Select a shade to dispense</p>
                )}
              </div>
            </div>

            {/* Last Dispensed */}
            {lastDispensed && (
              <div className="bg-white/60 rounded-2xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <h3 className="text-xl font-semibold text-gray-800">Last Dispensed</h3>
                </div>
                <div className="space-y-3">
                  <div
                    className="h-20 rounded-lg"
                    style={{ backgroundColor: lastDispensed.shade.hex_color }}
                  ></div>
                  <p className="font-medium text-gray-800">{lastDispensed.shade.name}</p>
                  <div className="bg-gray-50 rounded-lg p-3 text-xs font-mono space-y-1">
                    <p className="text-gray-600">Mix Formula:</p>
                    <p>Cyan: {lastDispensed.mix_formula.cyan}</p>
                    <p>Magenta: {lastDispensed.mix_formula.magenta}</p>
                    <p>Yellow: {lastDispensed.mix_formula.yellow}</p>
                    <p>Black: {lastDispensed.mix_formula.black}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Info */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6">
              <h4 className="font-semibold text-gray-800 mb-2">How It Works</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-rose-500 font-bold">1.</span>
                  <span>Turn on your LipstickDispenser hardware</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-rose-500 font-bold">2.</span>
                  <span>Click "Connect to Dispenser" and select "Dispenser" from the list</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-rose-500 font-bold">3.</span>
                  <span>Select a shade from your collection</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-rose-500 font-bold">4.</span>
                  <span>Confirm and dispense - RGB data is sent, then START command triggers pumps</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-rose-500 font-bold">5.</span>
                  <span>Use EMERGENCY STOP if needed to halt pumps immediately</span>
                </li>
              </ul>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800 font-medium mb-1">📱 Browser Requirements:</p>
                <p className="text-xs text-blue-700">Chrome browser on Android or Desktop is required for Bluetooth connectivity.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Shade Dispensing</AlertDialogTitle>
            <AlertDialogDescription>
              You're about to dispense the following shade to your LipstickDispenser device:
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedShade && (
            <div className="my-4">
              <div className="bg-white rounded-xl p-4 space-y-3">
                <div
                  className="h-24 rounded-lg"
                  style={{ backgroundColor: selectedShade.hex_color }}
                  data-testid="confirm-shade-preview"
                ></div>
                <div>
                  <p className="font-semibold text-gray-800 text-lg">{selectedShade.name}</p>
                  <p className="text-sm text-gray-500 font-mono">{selectedShade.hex_color}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    RGB: {selectedShade.rgb.r}, {selectedShade.rgb.g}, {selectedShade.rgb.b}
                  </p>
                </div>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-dispense-button">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDispense}
              data-testid="confirm-dispense-button"
              className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500"
            >
              Confirm & Dispense
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeviceControlPage;