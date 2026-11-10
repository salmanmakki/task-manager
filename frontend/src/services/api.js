import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('The request timed out. Please try again.'));
    }

    if (!error.response) {
      return Promise.reject(
        new Error('Unable to reach the server. Check your connection and try again.')
      );
    }

    return Promise.reject(error);
  }
);

export const getApiError = (error, fallback = 'Something went wrong. Please try again.') =>
  error?.response?.data?.message || error?.message || fallback;

export default api;
