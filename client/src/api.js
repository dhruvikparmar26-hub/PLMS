import axios from 'axios';

export const getApiBaseUrl = () => {
  const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const trimmedBaseUrl = rawBaseUrl.replace(/\/+$/, '');

  if (trimmedBaseUrl.endsWith('/api')) {
    return trimmedBaseUrl;
  }

  return `${trimmedBaseUrl}/api`;
};

/**
 * Pre-configured Axios instance for API calls.
 * - baseURL points to the Express backend
 * - withCredentials ensures httpOnly cookies are sent cross-origin
 * - Response interceptor redirects to /login on 401 (session expired)
 */
const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor — auto-redirect on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
