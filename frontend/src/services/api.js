import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Entries API
export const getEntries = async () => {
  const response = await api.get('/entries/');
  return response.data.results || response.data;
};

export const getEntry = async (id) => {
  const response = await api.get(`/entries/${id}/`);
  return response.data;
};

export const createEntry = async (entryData) => {
  const response = await api.post('/entries/', entryData);
  return response.data;
};

export const updateEntry = async (id, entryData) => {
  const response = await api.patch(`/entries/${id}/`, entryData);
  return response.data;
};

export const deleteEntry = async (id) => {
  const response = await api.delete(`/entries/${id}/`);
  return response.data;
};

export const getPublicEntries = async (filters = {}) => {
  const response = await api.get('/entries/public/', { params: filters });
  return response.data.results || response.data;
};

export const searchEntries = async (query) => {
  const response = await api.get('/entries/search/', { params: { q: query } });
  return response.data.results || response.data;
};

export const uploadDocument = async (entryId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post(`/entries/${entryId}/upload_document/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Insights API
export const getInsights = async () => {
  const response = await api.get('/insights/');
  return response.data.results || response.data;
};

export const getInsight = async (id) => {
  const response = await api.get(`/insights/${id}/`);
  return response.data;
};

export const updateInsight = async (id, insightData) => {
  const response = await api.patch(`/insights/${id}/`, insightData);
  return response.data;
};

export const getInsightsByCategory = async (categoryId) => {
  const response = await api.get('/insights/by_category/', { 
    params: { category_id: categoryId } 
  });
  return response.data;
};

export const getSentimentSummary = async () => {
  const response = await api.get('/insights/sentiment_summary/');
  return response.data;
};

export const getEntriesByCategory = async (categoryName, categoryType = null) => {
  const params = { category_name: categoryName };
  if (categoryType) {
    params.category_type = categoryType;
  }
  const response = await api.get('/insights/entries_by_category/', { params });
  return response.data;
};

export const searchInsights = async (query) => {
  const response = await api.get('/insights/search/', { params: { q: query } });
  return response.data;
};

// Categories API
export const getCategories = async () => {
  const response = await api.get('/categories/');
  return response.data.results || response.data;
};

export const getCategory = async (id) => {
  const response = await api.get(`/categories/${id}/`);
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await api.post('/categories/', categoryData);
  return response.data;
};

export const updateCategory = async (id, categoryData) => {
  const response = await api.patch(`/categories/${id}/`, categoryData);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}/`);
  return response.data;
};

export const getCategoriesByType = async (type) => {
  const response = await api.get('/categories/by_type/', { 
    params: { type } 
  });
  return response.data;
};

// Auth API
export const login = async (username, password) => {
  const response = await api.post('/auth/login/', { username, password });
  const token = response.data?.token;
  if (token) {
    localStorage.setItem('authToken', token);
  }
  return response.data;
};

export const logout = async () => {
  try {
    await api.post('/auth/logout/');
  } catch (e) {
    // ignore
  }
  localStorage.removeItem('authToken');
};

export default api;
