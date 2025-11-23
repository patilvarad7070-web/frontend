// Bluetooth Service for LipstickDispenser Hardware
class BluetoothService {
  constructor() {
    this.device = null;
    this.server = null;
    this.service = null;
    this.characteristic = null;
    this.isConnected = false;
    
    // Device specifications
    this.DEVICE_NAME = 'Dispenser';
    this.SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
    this.CHARACTERISTIC_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
  }

  // Check if Web Bluetooth is supported
  isBluetoothSupported() {
    if (!navigator.bluetooth) {
      console.error('Web Bluetooth API is not available in this browser');
      return false;
    }
    return true;
  }

  // Connect to the LipstickDispenser device
  async connect() {
    try {
      if (!this.isBluetoothSupported()) {
        throw new Error('Bluetooth not supported in this browser. Please use Chrome on Android or Desktop.');
      }

      console.log('Requesting Bluetooth Device...');
      
      // Request device with specific name and service
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { name: this.DEVICE_NAME },
          { services: [this.SERVICE_UUID] }
        ],
        optionalServices: [this.SERVICE_UUID]
      });

      console.log('Device found:', this.device.name);

      // Listen for disconnection
      this.device.addEventListener('gattserverdisconnected', this.onDisconnected.bind(this));

      // Connect to GATT Server
      console.log('Connecting to GATT Server...');
      this.server = await this.device.gatt.connect();

      // Get the service
      console.log('Getting Service...');
      this.service = await this.server.getPrimaryService(this.SERVICE_UUID);

      // Get the characteristic
      console.log('Getting Characteristic...');
      this.characteristic = await this.service.getCharacteristic(this.CHARACTERISTIC_UUID);

      this.isConnected = true;
      console.log('✅ Connected to LipstickDispenser successfully!');

      return {
        success: true,
        deviceName: this.device.name,
        deviceId: this.device.id
      };

    } catch (error) {
      console.error('Connection error:', error);
      this.isConnected = false;
      throw new Error(`Failed to connect: ${error.message}`);
    }
  }

  // Handle disconnection
  onDisconnected() {
    console.log('Device disconnected');
    this.isConnected = false;
    this.device = null;
    this.server = null;
    this.service = null;
    this.characteristic = null;
  }

  // Disconnect from device
  async disconnect() {
    try {
      if (this.device && this.device.gatt.connected) {
        await this.device.gatt.disconnect();
        console.log('Disconnected from device');
      }
      this.isConnected = false;
      return { success: true };
    } catch (error) {
      console.error('Disconnect error:', error);
      throw new Error(`Failed to disconnect: ${error.message}`);
    }
  }

  // Send data to device
  async sendData(data) {
    try {
      if (!this.isConnected || !this.characteristic) {
        throw new Error('Device not connected');
      }

      // Convert string to Uint8Array
      const encoder = new TextEncoder();
      const dataArray = encoder.encode(data);

      console.log('Sending data:', data);
      await this.characteristic.writeValue(dataArray);
      
      return { success: true };
    } catch (error) {
      console.error('Send data error:', error);
      throw new Error(`Failed to send data: ${error.message}`);
    }
  }

  // Send RGB values to device
  async sendRGB(r, g, b) {
    try {
      // Format: "R,G,B" (e.g., "120,60,100")
      const rgbString = `${r},${g},${b}`;
      console.log('Sending RGB:', rgbString);
      
      await this.sendData(rgbString);
      
      // Small delay to ensure device processes the RGB data
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return { success: true };
    } catch (error) {
      console.error('Send RGB error:', error);
      throw error;
    }
  }

  // Trigger dispensing
  async startDispensing() {
    try {
      console.log('Starting dispense...');
      await this.sendData('START');
      return { success: true };
    } catch (error) {
      console.error('Start dispensing error:', error);
      throw error;
    }
  }

  // Stop dispensing immediately
  async stopDispensing() {
    try {
      console.log('Stopping dispense...');
      await this.sendData('STOP');
      return { success: true };
    } catch (error) {
      console.error('Stop dispensing error:', error);
      throw error;
    }
  }

  // Complete dispense sequence
  async dispenseShade(rgb) {
    try {
      if (!this.isConnected) {
        throw new Error('Device not connected');
      }

      console.log('Starting dispense sequence for RGB:', rgb);

      // Step 1: Send RGB values
      await this.sendRGB(rgb.r, rgb.g, rgb.b);

      // Step 2: Trigger dispensing
      await this.startDispensing();

      console.log('✅ Dispense sequence completed successfully');
      
      return { 
        success: true, 
        message: 'Shade dispensed successfully',
        rgb: rgb
      };

    } catch (error) {
      console.error('Dispense sequence error:', error);
      throw new Error(`Dispense failed: ${error.message}`);
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      deviceName: this.device?.name || null,
      deviceId: this.device?.id || null
    };
  }

  // Emergency stop
  async emergencyStop() {
    try {
      await this.stopDispensing();
      console.log('Emergency stop executed');
      return { success: true };
    } catch (error) {
      console.error('Emergency stop error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const bluetoothService = new BluetoothService();

export default bluetoothService;
