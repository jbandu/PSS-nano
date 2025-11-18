import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_DCS_SERVICE_URL || 'http://localhost:3010';
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10);

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('agent_token');
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
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('agent_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Check-in API
export const checkInAPI = {
  startCheckIn: (data: any) => api.post('/check-in/start', data),
  checkInPassenger: (transactionId: string, data: any) =>
    api.post(`/check-in/${transactionId}/passenger`, data),
  assignSeat: (passengerCheckInId: string, data: any) =>
    api.post(`/check-in/passenger/${passengerCheckInId}/seat`, data),
  completeCheckIn: (transactionId: string) => api.post(`/check-in/${transactionId}/complete`),
  searchPassengers: (params: any) => api.get('/check-in/search', { params }),
};

// Baggage API
export const baggageAPI = {
  issueBaggageTag: (data: any) => api.post('/baggage/tag', data),
  generateBagTagPDF: (tagNumber: string) =>
    api.get(`/baggage/tag/${tagNumber}/pdf`, { responseType: 'blob' }),
  updateBaggageStatus: (tagNumber: string, data: any) =>
    api.put(`/baggage/tag/${tagNumber}/status`, data),
};

// APIS API
export const apisAPI = {
  collectAPISData: (data: any) => api.post('/apis/collect', data),
  submitAPIS: (apisDataId: string) => api.post(`/apis/${apisDataId}/submit`),
  processOCRData: (passengerCheckInId: string, data: any) =>
    api.post(`/apis/passenger/${passengerCheckInId}/ocr`, data),
};
