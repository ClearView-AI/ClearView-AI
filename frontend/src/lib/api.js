import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

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
  getSummary: (csvFileId) => apiClient.get('/api/auritas/viz/summary', { params: { csvFileId } }),
  
  // Gemini endpoints
  extractSoftware: (data) => apiClient.post('/api/gemini/extract-software', data),
  
  // Main app endpoints using existing backend
  ingest: (formData) => apiClient.post('/api/auritas/viz/preview-file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export default apiClient;

