import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gymx_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally — redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gymx_token');
      localStorage.removeItem('gymx_admin');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),

  getMe: () => api.get('/auth/me'),
};

// ─── Members ─────────────────────────────────────────────────────────────────
export const membersAPI = {
  getAll: (params?: { search?: string; status?: string; sortBy?: string; order?: string; page?: number; limit?: number }) =>
    api.get('/members', { params }),

  getById: (id: string) => api.get(`/members/${id}`),

  create: (data: object) => api.post('/members', data),

  update: (id: string, data: object) => api.put(`/members/${id}`, data),

  delete: (id: string) => api.delete(`/members/${id}`),

  getStats: () => api.get('/members/stats'),

  getAnalytics: () => api.get('/members/analytics'),
};

export default api;
