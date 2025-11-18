import { Camera } from 'react-native-vision-camera';
import TextRecognition from 'react-native-text-recognition';
import { Platform, PermissionsAndroid } from 'react-native';
import Config from 'react-native-config';

interface OCRResult {
  text: string;
  confidence: number;
  blocks: TextBlock[];
}

interface TextBlock {
  text: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface PassportMRZ {
  documentType: string;
  documentNumber: string;
  issuingCountry: string;
  nationality: string;
  dateOfBirth: string;
  gender: string;
  expiryDate: string;
  surname: string;
  givenNames: string;
}

class CameraOCRService {
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const cameraPermission = await Camera.requestCameraPermission();
      return cameraPermission === 'granted';
    }
  }

  async scanPassport(imagePath: string): Promise<PassportMRZ | null> {
    try {
      const result = await this.performOCR(imagePath);

      if (!result) {
        return null;
      }

      // Extract MRZ (Machine Readable Zone) from text
      const mrzData = this.extractMRZ(result.text);

      if (!mrzData) {
        return null;
      }

      return this.parseMRZ(mrzData);
    } catch (error) {
      console.error('Passport scan error:', error);
      throw error;
    }
  }

  async performOCR(imagePath: string): Promise<OCRResult | null> {
    try {
      const result = await TextRecognition.recognize(imagePath);

      if (!result || result.length === 0) {
        return null;
      }

      // Combine all recognized text
      const fullText = result.map((block: any) => block.text).join('\n');

      // Calculate average confidence
      const avgConfidence =
        result.reduce((sum: number, block: any) => sum + (block.confidence || 0), 0) /
        result.length;

      const ocrResult: OCRResult = {
        text: fullText,
        confidence: avgConfidence,
        blocks: result.map((block: any) => ({
          text: block.text,
          confidence: block.confidence || 0,
          boundingBox: block.boundingBox || { x: 0, y: 0, width: 0, height: 0 },
        })),
      };

      return ocrResult;
    } catch (error) {
      console.error('OCR error:', error);
      return null;
    }
  }

  private extractMRZ(text: string): string[] | null {
    // MRZ is typically the last 2-3 lines of passport text
    // Format: Lines starting with P< or other document type codes
    const lines = text.split('\n').filter((line) => line.trim().length > 0);

    // Find MRZ lines (they contain only uppercase letters, digits, and <)
    const mrzLines = lines.filter((line) => /^[A-Z0-9<]+$/.test(line.trim()));

    // Passport MRZ is typically 2 lines of 44 characters each
    if (mrzLines.length >= 2) {
      const lastTwo = mrzLines.slice(-2);
      if (lastTwo.every((line) => line.length >= 40 && line.length <= 45)) {
        return lastTwo;
      }
    }

    return null;
  }

  private parseMRZ(mrzLines: string[]): PassportMRZ | null {
    try {
      // TD-3 format (passports) - 2 lines of 44 characters
      if (mrzLines.length !== 2) {
        return null;
      }

      const line1 = mrzLines[0].padEnd(44, '<');
      const line2 = mrzLines[1].padEnd(44, '<');

      // Line 1: P<ISSUING_COUNTRY<<SURNAME<<GIVEN_NAMES
      const documentType = line1.substring(0, 1); // P
      const issuingCountry = line1.substring(2, 5).replace(/</g, '');
      const nameSection = line1.substring(5).split('<<');
      const surname = nameSection[0].replace(/</g, ' ').trim();
      const givenNames = nameSection[1] ? nameSection[1].replace(/</g, ' ').trim() : '';

      // Line 2: DOCUMENT_NUMBER<CHECK_DIGIT<NATIONALITY<DOB<CHECK<GENDER<EXPIRY<CHECK<<<<<<<<CHECK
      const documentNumber = line2.substring(0, 9).replace(/</g, '');
      const nationality = line2.substring(10, 13).replace(/</g, '');
      const dob = line2.substring(13, 19); // YYMMDD
      const gender = line2.substring(20, 21); // M/F/<
      const expiry = line2.substring(21, 27); // YYMMDD

      // Convert dates from YYMMDD to YYYY-MM-DD
      const dateOfBirth = this.formatMRZDate(dob);
      const expiryDate = this.formatMRZDate(expiry);

      const passportData: PassportMRZ = {
        documentType,
        documentNumber,
        issuingCountry,
        nationality,
        dateOfBirth,
        gender: gender === 'M' ? 'M' : gender === 'F' ? 'F' : 'X',
        expiryDate,
        surname,
        givenNames,
      };

      return passportData;
    } catch (error) {
      console.error('MRZ parsing error:', error);
      return null;
    }
  }

  private formatMRZDate(mrzDate: string): string {
    // Convert YYMMDD to YYYY-MM-DD
    if (mrzDate.length !== 6) return '';

    const yy = parseInt(mrzDate.substring(0, 2), 10);
    const mm = mrzDate.substring(2, 4);
    const dd = mrzDate.substring(4, 6);

    // Assume years < 30 are 2000s, >= 30 are 1900s
    const yyyy = yy < 30 ? 2000 + yy : 1900 + yy;

    return `${yyyy}-${mm}-${dd}`;
  }

  async scanQRCode(imagePath: string): Promise<string | null> {
    try {
      const result = await this.performOCR(imagePath);

      if (!result) {
        return null;
      }

      // QR codes typically contain URLs or structured data
      // Try to find QR code pattern in text
      const qrPattern = /^[A-Z0-9]{6}$/; // PNR pattern
      const match = result.text.match(qrPattern);

      return match ? match[0] : result.text.trim();
    } catch (error) {
      console.error('QR scan error:', error);
      return null;
    }
  }

  validateConfidence(confidence: number): boolean {
    const threshold = parseFloat(Config.OCR_CONFIDENCE_THRESHOLD || '0.85');
    return confidence >= threshold;
  }
}

export default new CameraOCRService();
