import axios, { AxiosInstance } from 'axios';
import Config from 'react-native-config';
import { store } from '@/store';
import { logout } from '@/store/slices/authSlice';

class APIService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: Config.DCS_SERVICE_URL || 'http://localhost:3010/api/v1',
      timeout: parseInt(Config.API_TIMEOUT || '30000', 10),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const { token } = store.getState().auth;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          store.dispatch(logout());
        }
        return Promise.reject(error);
      }
    );
  }

  // Check-in APIs
  async startCheckIn(data: any) {
    return this.client.post('/check-in/start', data);
  }

  async checkInPassenger(transactionId: string, data: any) {
    return this.client.post(`/check-in/${transactionId}/passenger`, data);
  }

  async assignSeat(passengerCheckInId: string, data: any) {
    return this.client.post(`/check-in/passenger/${passengerCheckInId}/seat`, data);
  }

  async completeCheckIn(transactionId: string) {
    return this.client.post(`/check-in/${transactionId}/complete`);
  }

  async searchPassengers(params: any) {
    return this.client.get('/check-in/search', { params });
  }

  // Baggage APIs
  async issueBaggageTag(data: any) {
    return this.client.post('/baggage/tag', data);
  }

  async generateBagTagPDF(tagNumber: string) {
    return this.client.get(`/baggage/tag/${tagNumber}/pdf`, { responseType: 'blob' });
  }

  async updateBaggageStatus(tagNumber: string, data: any) {
    return this.client.put(`/baggage/tag/${tagNumber}/status`, data);
  }

  // APIS APIs
  async collectAPISData(data: any) {
    return this.client.post('/apis/collect', data);
  }

  async submitAPIS(apisDataId: string) {
    return this.client.post(`/apis/${apisDataId}/submit`);
  }

  async processOCRData(passengerCheckInId: string, ocrData: any) {
    return this.client.post(`/apis/passenger/${passengerCheckInId}/ocr`, { ocrData });
  }

  // Ancillary APIs
  async getAncillaryProducts(flightId: string) {
    return this.client.get(`/ancillary/products`, { params: { flightId } });
  }

  async purchaseAncillary(data: any) {
    return this.client.post('/ancillary/purchase', data);
  }

  // Payment APIs
  async createPaymentIntent(data: any) {
    return this.client.post('/payment/intent', data);
  }

  async capturePayment(paymentIntentId: string) {
    return this.client.post(`/payment/${paymentIntentId}/capture`);
  }

  // Queue APIs
  async getQueue(stationCode: string) {
    return this.client.get('/queue', { params: { stationCode } });
  }

  async addToQueue(data: any) {
    return this.client.post('/queue', data);
  }

  // Standby APIs
  async getStandbyList(flightId: string) {
    return this.client.get(`/standby/${flightId}`);
  }

  async clearStandby(passengerId: string, seatNumber: string) {
    return this.client.post(`/standby/${passengerId}/clear`, { seatNumber });
  }
}

export default new APIService();
