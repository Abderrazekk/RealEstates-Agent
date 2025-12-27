// src/utils/api.js - Enhanced version
import axios from 'axios';

// Create axios instance with base URL from environment variables
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout for file uploads
});

// Store for debugging
let requestCount = 0;

// Enhanced Request interceptor
api.interceptors.request.use(
  (config) => {
    requestCount++;
    const requestId = requestCount;
    
    const token = localStorage.getItem('token');
    const hasToken = !!token;
    
    console.group(`[API Request #${requestId}] ${config.method?.toUpperCase()} ${config.url}`);
    console.log('Has Token:', hasToken);
    console.log('Token Length:', token?.length);
    console.log('Full Token:', token ? `${token.substring(0, 20)}...` : 'None');
    console.groupEnd();
    
    if (token) {
      // Validate token format (basic check)
      if (token.split('.').length !== 3) {
        console.error('Invalid token format:', token);
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(new Error('Invalid token format'));
      }
      
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // For file uploads, use different content type
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    
    return config;
  },
  (error) => {
    console.error('[API Request Setup Error]', error);
    return Promise.reject(error);
  }
);

// Enhanced Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const { response } = error;
    const status = response?.status;
    
    console.group('[API Error]');
    console.log('URL:', error.config?.url);
    console.log('Method:', error.config?.method);
    console.log('Status:', status);
    console.log('Response:', response?.data);
    console.log('Has Token in Request:', error.config?.headers?.Authorization ? 'Yes' : 'No');
    console.groupEnd();
    
    // Handle specific status codes
    if (status === 401) {
      console.warn('Authentication failed - Token might be invalid or expired');
      
      // Only remove token if it exists
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        console.log('Token removed from localStorage');
      }
      
      // Show more specific message
      if (response?.data?.message?.includes('token')) {
        error.userMessage = 'Your session has expired. Please login again.';
      } else {
        error.userMessage = 'Authentication required. Please login to continue.';
      }
      
      // Only redirect if not already on auth pages
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath.includes('/login') || 
                         currentPath.includes('/register') || 
                         currentPath.includes('/auth');
      
      if (!isAuthPage) {
        setTimeout(() => {
          window.location.href = '/login?redirect=' + encodeURIComponent(currentPath);
        }, 1000);
      }
    } else if (status === 403) {
      error.userMessage = 'Access denied. You do not have permission to perform this action.';
    } else if (status === 404) {
      error.userMessage = response?.data?.message || 'Resource not found.';
    } else if (status === 422) {
      // Validation errors
      const errors = response?.data?.errors || [];
      const errorMessages = errors.map(err => err.msg || err.message).join(', ');
      error.userMessage = errorMessages || 'Please check your input.';
    } else if (status === 429) {
      error.userMessage = 'Too many requests. Please try again later.';
    } else if (status >= 500) {
      error.userMessage = 'Server error. Please try again later.';
    } else if (!response) {
      // Network error
      error.userMessage = 'Network error. Please check your internet connection.';
    } else {
      error.userMessage = response?.data?.message || 'An unexpected error occurred.';
    }
    
    return Promise.reject(error);
  }
);

// Helper function to check authentication status
export const checkAuthStatus = () => {
  const token = localStorage.getItem('token');
  if (!token) return { isAuthenticated: false, reason: 'No token' };
  
  try {
    // Simple check for JWT format (3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
      localStorage.removeItem('token');
      return { isAuthenticated: false, reason: 'Invalid token format' };
    }
    
    // Try to decode the payload (base64)
    const payload = JSON.parse(atob(parts[1]));
    const isExpired = payload.exp && payload.exp * 1000 < Date.now();
    
    if (isExpired) {
      localStorage.removeItem('token');
      return { isAuthenticated: false, reason: 'Token expired' };
    }
    
    return { 
      isAuthenticated: true, 
      user: payload,
      token: token 
    };
  } catch (error) {
    console.error('Error checking auth status:', error);
    localStorage.removeItem('token');
    return { isAuthenticated: false, reason: 'Invalid token' };
  }
};

// Helper to set token manually (if needed)
export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Helper to clear token
export const clearAuthToken = () => {
  localStorage.removeItem('token');
  delete api.defaults.headers.common['Authorization'];
};

export default api;