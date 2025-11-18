import { BleManager, Device, Characteristic } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';
import Config from 'react-native-config';
import { ScanResult } from '@/types';

class BluetoothScannerService {
  private bleManager: BleManager;
  private connectedDevice: Device | null = null;
  private scanCallback: ((result: ScanResult) => void) | null = null;

  // Known scanner UUIDs (Zebra, Honeywell, Socket, Linea)
  private readonly SCANNER_SERVICE_UUIDS = [
    '00001101-0000-1000-8000-00805F9B34FB', // Generic Serial
    '0000FFF0-0000-1000-8000-00805F9B34FB', // Zebra
    '6E400001-B5A3-F393-E0A9-E50E24DCCA9E', // Nordic UART
  ];

  private readonly SCANNER_CHARACTERISTIC_UUIDS = [
    '00002A3D-0000-1000-8000-00805F9B34FB',
    '0000FFF1-0000-1000-8000-00805F9B34FB',
    '6E400003-B5A3-F393-E0A9-E50E24DCCA9E', // Nordic UART RX
  ];

  constructor() {
    this.bleManager = new BleManager();
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 31) {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);
        return (
          granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    return true;
  }

  async scanForDevices(callback: (device: Device) => void): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Bluetooth permissions not granted');
    }

    this.bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Scan error:', error);
        return;
      }

      if (device && device.name) {
        // Filter for known scanner brands
        const supportedBrands = Config.SUPPORTED_SCANNERS?.split(',') || [
          'Zebra',
          'Honeywell',
          'Socket',
          'Linea',
        ];
        const isScanner = supportedBrands.some((brand) =>
          device.name?.toLowerCase().includes(brand.toLowerCase())
        );

        if (isScanner) {
          callback(device);
        }
      }
    });

    // Stop scan after 10 seconds
    setTimeout(() => {
      this.bleManager.stopDeviceScan();
    }, parseInt(Config.SCANNER_TIMEOUT_MS || '10000', 10));
  }

  async connect(deviceId: string): Promise<void> {
    try {
      const device = await this.bleManager.connectToDevice(deviceId);
      this.connectedDevice = await device.discoverAllServicesAndCharacteristics();

      // Monitor for scan data
      await this.startMonitoring();

      console.log(`Connected to scanner: ${device.name}`);
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connectedDevice) {
      await this.connectedDevice.cancelConnection();
      this.connectedDevice = null;
      this.scanCallback = null;
    }
  }

  async startMonitoring(): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error('No scanner connected');
    }

    // Monitor all scanner characteristics
    for (const serviceUuid of this.SCANNER_SERVICE_UUIDS) {
      for (const charUuid of this.SCANNER_CHARACTERISTIC_UUIDS) {
        try {
          this.connectedDevice.monitorCharacteristicForService(
            serviceUuid,
            charUuid,
            (error, characteristic) => {
              if (error) {
                // Silently ignore - characteristic might not exist
                return;
              }

              if (characteristic?.value) {
                this.handleScanData(characteristic);
              }
            }
          );
        } catch (error) {
          // Silently ignore - service/characteristic might not exist
        }
      }
    }
  }

  private handleScanData(characteristic: Characteristic): void {
    if (!characteristic.value) return;

    // Decode base64 data
    const decodedData = Buffer.from(characteristic.value, 'base64').toString('utf-8');

    // Determine scan type based on data format
    let scanType: 'barcode' | 'qr_code' | 'passport_mrz' = 'barcode';

    if (decodedData.includes('QR')) {
      scanType = 'qr_code';
    } else if (decodedData.match(/^[A-Z0-9<]+$/)) {
      scanType = 'passport_mrz';
    }

    const result: ScanResult = {
      data: decodedData.trim(),
      type: scanType,
      timestamp: Date.now(),
    };

    if (this.scanCallback) {
      this.scanCallback(result);
    }
  }

  setScanCallback(callback: (result: ScanResult) => void): void {
    this.scanCallback = callback;
  }

  isConnected(): boolean {
    return this.connectedDevice !== null;
  }

  async getConnectedDeviceName(): Promise<string | null> {
    return this.connectedDevice?.name || null;
  }

  async getBatteryLevel(): Promise<number | null> {
    if (!this.connectedDevice) return null;

    try {
      const batteryServiceUuid = '0000180F-0000-1000-8000-00805F9B34FB';
      const batteryLevelUuid = '00002A19-0000-1000-8000-00805F9B34FB';

      const characteristic = await this.connectedDevice.readCharacteristicForService(
        batteryServiceUuid,
        batteryLevelUuid
      );

      if (characteristic.value) {
        const batteryLevel = Buffer.from(characteristic.value, 'base64').readUInt8(0);
        return batteryLevel;
      }
    } catch (error) {
      console.log('Battery level not available');
    }

    return null;
  }
}

export default new BluetoothScannerService();
