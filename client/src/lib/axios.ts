import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('lms_token') : null;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Something went wrong';

    if (status === 401) {
      localStorage.removeItem('lms_token');
      document.cookie = 'lms_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    if (status === 403) {
      toast.error('Access denied: You don\'t have permission');
    }

    return Promise.reject(error);
  }
);

export default api;
