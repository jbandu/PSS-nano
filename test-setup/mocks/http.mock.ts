/**
 * HTTP Client Mocking Utilities
 *
 * Mock HTTP requests for external API testing.
 */

import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Create a mock Axios response
 */
export function createMockAxiosResponse<T>(
  data: T,
  status = 200,
  statusText = 'OK'
): AxiosResponse<T> {
  return {
    data,
    status,
    statusText,
    headers: {},
    config: {} as AxiosRequestConfig,
  };
}

/**
 * Create a mock Axios error
 */
export function createMockAxiosError(
  message: string,
  status = 500,
  data?: any
): any {
  const error: any = new Error(message);
  error.isAxiosError = true;
  error.response = {
    data,
    status,
    statusText: 'Error',
    headers: {},
    config: {} as AxiosRequestConfig,
  };
  return error;
}

/**
 * Mock fetch API
 */
export const mockFetch = {
  /**
   * Mock a successful fetch response
   */
  success: <T>(data: T, status = 200) => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      statusText: 'OK',
      headers: new Headers(),
      json: async () => data,
      text: async () => JSON.stringify(data),
      blob: async () => new Blob([JSON.stringify(data)]),
    });
  },

  /**
   * Mock a failed fetch response
   */
  error: (status = 500, message = 'Internal Server Error') => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status,
      statusText: message,
      headers: new Headers(),
      json: async () => ({ error: message }),
      text: async () => message,
    });
  },

  /**
   * Mock a network error
   */
  networkError: (message = 'Network error') => {
    global.fetch = jest.fn().mockRejectedValue(new Error(message));
  },

  /**
   * Reset fetch mock
   */
  reset: () => {
    if (global.fetch && 'mockReset' in global.fetch) {
      (global.fetch as jest.Mock).mockReset();
    }
  },
};

/**
 * Mock Axios instance
 */
export const mockAxios = {
  /**
   * Mock a successful request
   */
  success: <T>(data: T, status = 200) => {
    jest.spyOn(axios, 'request').mockResolvedValue(
      createMockAxiosResponse(data, status)
    );
    jest.spyOn(axios, 'get').mockResolvedValue(
      createMockAxiosResponse(data, status)
    );
    jest.spyOn(axios, 'post').mockResolvedValue(
      createMockAxiosResponse(data, status)
    );
    jest.spyOn(axios, 'put').mockResolvedValue(
      createMockAxiosResponse(data, status)
    );
    jest.spyOn(axios, 'patch').mockResolvedValue(
      createMockAxiosResponse(data, status)
    );
    jest.spyOn(axios, 'delete').mockResolvedValue(
      createMockAxiosResponse(data, status)
    );
  },

  /**
   * Mock a failed request
   */
  error: (message = 'Request failed', status = 500, data?: any) => {
    const error = createMockAxiosError(message, status, data);
    jest.spyOn(axios, 'request').mockRejectedValue(error);
    jest.spyOn(axios, 'get').mockRejectedValue(error);
    jest.spyOn(axios, 'post').mockRejectedValue(error);
    jest.spyOn(axios, 'put').mockRejectedValue(error);
    jest.spyOn(axios, 'patch').mockRejectedValue(error);
    jest.spyOn(axios, 'delete').mockRejectedValue(error);
  },

  /**
   * Reset Axios mocks
   */
  reset: () => {
    jest.restoreAllMocks();
  },
};

// Reset mocks after each test
afterEach(() => {
  mockFetch.reset();
  mockAxios.reset();
});
