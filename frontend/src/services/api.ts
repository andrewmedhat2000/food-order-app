import axios from 'axios';

function normalizeApiUrl(raw: string): string {
  const trimmed = raw.replace(/\/+$/, '');
  if (trimmed.startsWith('http') && !trimmed.endsWith('/api')) {
    return `${trimmed}/api`;
  }
  return trimmed || '/api';
}

const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL ?? '/api');

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface ValidationErrorItem {
  msg?: string;
  message?: string;
}

interface ApiErrorBody {
  message?: string;
  errors?: ValidationErrorItem[];
}

function parseApiErrorBody(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;

  const body = data as ApiErrorBody;

  if (Array.isArray(body.errors) && body.errors.length > 0) {
    const messages = body.errors
      .map((item) => item.msg ?? item.message)
      .filter((msg): msg is string => Boolean(msg));

    if (messages.length > 0) {
      return messages.join('. ');
    }
  }

  if (body.message) {
    return body.message;
  }

  return null;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const parsed = parseApiErrorBody(error.response?.data);

    if (status === 403) {
      return 'Access denied. Check API URL and CORS settings on the backend.';
    }
    if (parsed) return parsed;
    if (status) return `${fallback} (HTTP ${status})`;
    if (error.code === 'ERR_NETWORK') {
      return 'Cannot reach API. Check VITE_API_URL and that the backend is running.';
    }
  }
  return fallback;
}
