import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

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
      return 'Forbidden (403). Restart backend on port 5001 and use the app at http://localhost:5173 — do not call port 5000 directly.';
    }
    if (parsed) return parsed;
    if (status) return `${fallback} (HTTP ${status})`;
    if (error.code === 'ERR_NETWORK') {
      return 'Cannot reach API. Is the backend running? Run: cd backend && npm run dev';
    }
  }
  return fallback;
}
