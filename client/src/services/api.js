import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (phone, password) => api.post('/auth/login', { phone, password }),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  checkIn: () => api.post('/auth/checkin'),
};

export const coachAPI = {
  getAll: (params) => api.get('/coaches', { params }),
  getById: (id) => api.get(`/coaches/${id}`),
  getSpecialties: () => api.get('/coaches/specialties'),
};

export const courseAPI = {
  getList: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  getWeekly: (params) => api.get('/courses/weekly', { params }),
  create: (data) => api.post('/courses', data),
  createBatch: (data) => api.post('/courses/batch', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
};

export const bookingAPI = {
  getMyBookings: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  getStats: () => api.get('/bookings/stats'),
  create: (courseSlotId) => api.post('/bookings', { courseSlotId }),
  cancel: (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }),
  checkIn: (id) => api.put(`/bookings/${id}/checkin`),
};

export const reviewAPI = {
  getMyReviews: (params) => api.get('/reviews/mine', { params }),
  getCoachReviews: (coachId, params) => api.get(`/reviews/coach/${coachId}`, { params }),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  approve: (id) => api.put(`/reviews/${id}/approve`),
  reject: (id, reason) => api.put(`/reviews/${id}/reject`, { reason }),
};

export default api;
