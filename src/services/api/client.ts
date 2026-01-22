/**
 * Axios HTTP client configuration
 * Centralized API client with interceptors for error handling
 */

import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';
import config from '@/config/env';
import type { APIError } from './types';

/**
 * Create and configure the Axios instance
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: config.apiFullUrl,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor
 * Add any common request modifications here (e.g., auth tokens)
 */
apiClient.interceptors.request.use(
  async (requestConfig: InternalAxiosRequestConfig) => {
    try {
      // Get the current session using AWS Amplify
      const session = await fetchAuthSession();
      // Use accessToken as backend expects 'access' token_use by default
      const token = session.tokens?.accessToken?.toString();

      if (token) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // If unable to fetch session (e.g., user not logged in), proceed without token
      // The backend will handle 401s if auth is required
    }

    return requestConfig;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Handle common error scenarios and transform responses
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<APIError>) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const detail = error.response.data?.detail || 'An error occurred';

      // Return a standardized error object
      return Promise.reject({
        status,
        detail,
        originalError: error,
      });
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject({
        status: 0,
        detail: 'Network error: Unable to reach the server. Please check your connection.',
        originalError: error,
      });
    } else {
      // Something else happened
      return Promise.reject({
        status: 0,
        detail: error.message || 'An unexpected error occurred',
        originalError: error,
      });
    }
  }
);

export default apiClient;

