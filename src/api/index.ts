import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const naApi = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
naApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('na_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Unwrap response
naApi.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }
    return Promise.reject(error);
  }
);

// --- NA Auth ---
export const naLogin = async (credentials: { username: string; password: string }) => {
  const { data } = await naApi.post('/na/auth/login', credentials);
  return data;
};

export const fetchNAMe = async () => {
  const { data } = await naApi.get('/na/auth/me');
  return data;
};

export const changeNAPassword = async (passwords: { currentPassword: string; newPassword: string }) => {
  const { data } = await naApi.put('/na/auth/change-password', passwords);
  return data;
};

// --- NA Duty ---
export const startNADuty = async (bookingId: string) => {
  const { data } = await naApi.post('/na/duty/start', { bookingId });
  return data;
};

export const finishNADuty = async (dutyLogId: string) => {
  const { data } = await naApi.post('/na/duty/finish', { dutyLogId });
  return data;
};

export const getNADutyStatus = async () => {
  const { data } = await naApi.get('/na/duty/status');
  return data;
};

// --- NA Reports ---
export const createNAReport = async (reportData: any) => {
  const { data } = await naApi.post('/na/reports', reportData);
  return data;
};

export const getNAReports = async (params?: { date?: string }) => {
  const { data } = await naApi.get('/na/reports', { params });
  return data;
};

export const getNAReportById = async (id: string) => {
  const { data } = await naApi.get(`/na/reports/${id}`);
  return data;
};

export const updateNAReport = async (id: string, reportData: any) => {
  const { data } = await naApi.put(`/na/reports/${id}`, reportData);
  return data;
};

export const deleteNAReport = async (id: string) => {
  const { data } = await naApi.delete(`/na/reports/${id}`);
  return data;
};

// --- Bookings (for duty start) ---
export const fetchBookings = async (status?: string) => {
  const params: any = status ? { status } : {};
  params.excludeStatuses = 'Completed,Cancelled';
  const { data } = await naApi.get('/bookings', { params });
  return data;
};

export default naApi;
