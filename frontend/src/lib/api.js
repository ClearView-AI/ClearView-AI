import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject({ ...error, message });
  }
);

// API methods
export const api = {
  // Auritas Viz endpoints
  previewCSV: (data) => apiClient.post('/api/auritas/viz/preview', data),
  previewFile: (formData) => apiClient.post('/api/auritas/viz/preview-file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  renderCSV: (data) => apiClient.post('/api/auritas/viz/render', data),
  exportCSV: () => apiClient.get('/api/auritas/viz/export', {
    responseType: 'blob',
  }),
  
  // Gemini endpoints
  extractSoftware: (data) => apiClient.post('/api/gemini/extract-software', data),
  
  // Main app endpoints (to be implemented by backend)
  ingest: (formData) => apiClient.post('/api/ingest', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  normalize: () => apiClient.post('/api/normalize'),
  computeEOS: () => apiClient.post('/api/eos'),
  getSummary: () => apiClient.get('/api/summary'),
  getRecords: (params) => apiClient.get('/api/records', { params }),
  exportData: () => apiClient.get('/api/export', {
    responseType: 'blob',
  }),
};

export default apiClient;

