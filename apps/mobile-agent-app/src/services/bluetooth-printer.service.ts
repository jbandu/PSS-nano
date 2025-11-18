import { BleManager, Device } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';
import Config from 'react-native-config';
import { PrintJob, PrintType } from '@/types';

class BluetoothPrinterService {
  private bleManager: BleManager;
  private connectedDevice: Device | null = null;

  // Printer service UUIDs (common thermal printers)
  private readonly PRINTER_SERVICE_UUIDS = [
    '00001101-0000-1000-8000-00805F9B34FB', // Serial
    '49535343-FE7D-4AE5-8FA9-9FAFD205E455', // Microchip
  ];

  private readonly PRINTER_WRITE_CHARACTERISTIC_UUIDS = [
    '00002A3F-0000-1000-8000-00805F9B34FB',
    '49535343-8841-43F4-A8D4-ECBE34729BB3',
  ];

  constructor() {
    this.bleManager = new BleManager();
  }

  async scanForPrinters(callback: (device: Device) => void): Promise<void> {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        throw new Error('Bluetooth permission not granted');
      }
    }

    this.bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Printer scan error:', error);
        return;
      }

      if (device && device.name) {
        const supportedPrinters = Config.SUPPORTED_PRINTERS?.split(',') || [
          'Zebra',
          'APG',
          'Star',
          'Boca',
        ];
        const isPrinter = supportedPrinters.some((brand) =>
          device.name?.toLowerCase().includes(brand.toLowerCase())
        );

        if (isPrinter) {
          callback(device);
        }
      }
    });

    setTimeout(() => {
      this.bleManager.stopDeviceScan();
    }, parseInt(Config.PRINTER_TIMEOUT_MS || '15000', 10));
  }

  async connect(deviceId: string): Promise<void> {
    try {
      const device = await this.bleManager.connectToDevice(deviceId);
      this.connectedDevice = await device.discoverAllServicesAndCharacteristics();
      console.log(`Connected to printer: ${device.name}`);
    } catch (error) {
      console.error('Printer connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connectedDevice) {
      await this.connectedDevice.cancelConnection();
      this.connectedDevice = null;
    }
  }

  async print(job: PrintJob): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error('No printer connected');
    }

    let printData: string;

    switch (job.type) {
      case 'bag_tag':
        printData = await this.generateBagTagZPL(job.data);
        break;
      case 'boarding_pass':
        printData = await this.generateBoardingPassZPL(job.data);
        break;
      case 'receipt':
        printData = await this.generateReceiptESCPOS(job.data);
        break;
      default:
        throw new Error('Unknown print type');
    }

    await this.sendToPrinter(printData);
  }

  private async sendToPrinter(data: string): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error('No printer connected');
    }

    // Convert string to bytes
    const encoder = new TextEncoder();
    const bytes = encoder.encode(data);

    // Split into chunks (BLE MTU is typically 20-512 bytes)
    const chunkSize = 512;
    const chunks: Uint8Array[] = [];

    for (let i = 0; i < bytes.length; i += chunkSize) {
      chunks.push(bytes.slice(i, i + chunkSize));
    }

    // Send chunks
    for (const serviceUuid of this.PRINTER_SERVICE_UUIDS) {
      for (const charUuid of this.PRINTER_WRITE_CHARACTERISTIC_UUIDS) {
        try {
          for (const chunk of chunks) {
            const base64Data = Buffer.from(chunk).toString('base64');
            await this.connectedDevice.writeCharacteristicWithResponseForService(
              serviceUuid,
              charUuid,
              base64Data
            );
            // Small delay between chunks
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
          return; // Success
        } catch (error) {
          // Try next characteristic
          continue;
        }
      }
    }

    throw new Error('Failed to send data to printer');
  }

  private async generateBagTagZPL(data: any): Promise<string> {
    // ZPL (Zebra Programming Language) for bag tag
    // 4x6 inch label, 203 DPI
    return `
^XA
^CF0,60
^FO50,50^FD${data.tagNumber}^FS
^CF0,30
^FO50,120^FD${data.passengerName}^FS
^FO50,160^FDFlight: ${data.flightNumber}^FS
^FO50,200^FDPNR: ${data.pnrLocator}^FS
^FO50,240^FDSeat: ${data.seatNumber || 'N/A'}^FS
^FO50,280^FD${data.origin} > ${data.destination}^FS
^FO50,320^FDWeight: ${data.weight} ${data.weightUnit}^FS
^FO50,360^FDBag ${data.sequenceNumber}^FS
^BY3,3,100
^FO50,420^BC^FD${data.tagNumber}^FS
^XZ
    `.trim();
  }

  private async generateBoardingPassZPL(data: any): Promise<string> {
    // ZPL for boarding pass with IATA BCBP barcode (PDF417)
    return `
^XA
^CF0,40
^FO50,50^FD${data.passengerName}^FS
^CF0,30
^FO50,100^FDFlight: ${data.flightNumber}^FS
^FO50,140^FDDate: ${data.date}^FS
^FO50,180^FDFrom: ${data.origin}  To: ${data.destination}^FS
^FO50,220^FDSeat: ${data.seatNumber}  Gate: ${data.gate}^FS
^FO50,260^FDBoarding: ${data.boardingTime}^FS
^FO50,300^FDGroup: ${data.boardingGroup}^FS
^BY2,3,50
^FO50,360^BQ^FD${data.bcbpData}^FS
^XZ
    `.trim();
  }

  private async generateReceiptESCPOS(data: any): Promise<string> {
    // ESC/POS commands for receipt
    const ESC = '\x1B';
    const GS = '\x1D';

    let receipt = '';

    // Initialize
    receipt += ESC + '@';

    // Center align
    receipt += ESC + 'a' + '1';

    // Bold
    receipt += ESC + 'E' + '1';
    receipt += 'RECEIPT\n';
    receipt += ESC + 'E' + '0';

    // Left align
    receipt += ESC + 'a' + '0';

    receipt += '\n';
    receipt += `Transaction ID: ${data.transactionId}\n`;
    receipt += `Date: ${data.date}\n`;
    receipt += `Agent: ${data.agentName}\n`;
    receipt += '\n';
    receipt += '--------------------------------\n';

    // Line items
    data.items.forEach((item: any) => {
      receipt += `${item.description.padEnd(20)} ${item.amount.toFixed(2).padStart(10)}\n`;
    });

    receipt += '--------------------------------\n';
    receipt += `TOTAL: ${data.currency} ${data.total.toFixed(2)}\n`;
    receipt += '\n';

    // Cut paper
    receipt += GS + 'V' + '\x00';

    return receipt;
  }

  isConnected(): boolean {
    return this.connectedDevice !== null;
  }

  async getConnectedDeviceName(): Promise<string | null> {
    return this.connectedDevice?.name || null;
  }
}

export default new BluetoothPrinterService();
