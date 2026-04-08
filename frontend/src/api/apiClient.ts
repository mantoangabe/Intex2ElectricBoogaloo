import axios from 'axios';

const envBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
const normalizedBaseUrl = envBaseUrl?.trim().replace(/\/$/, '');

const apiClient = axios.create({
  // In production, use configured API host; otherwise fall back to same-origin /api.
  baseURL: normalizedBaseUrl || '/api',
  withCredentials: true,
});

export default apiClient;
