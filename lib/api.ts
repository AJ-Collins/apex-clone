import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.apexbinary.site/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

async function getToken() {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem('special_token');
    }
    return await SecureStore.getItemAsync('special_token');
  } catch (e) {
    return null;
  }
}

async function getAuthHeader() {
  const token = await getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  ms = 15000,
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

async function parseJsonSafe(response: Response): Promise<any> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export const api = {
  async get<T = any>(path: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetchWithTimeout(`${API_URL}${path}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeader()),
        },
      });
      const json = await parseJsonSafe(response);
      if (!response.ok && json.success === undefined) {
        return { success: false, error: json.error || `Request failed (${response.status})` };
      }
      return json;
    } catch (error: any) {
      const msg = error?.name === 'AbortError' ? 'Request timed out' : 'Network error';
      console.error(`API GET ${path} error:`, error);
      return { success: false, error: msg };
    }
  },

  async post<T = any>(path: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetchWithTimeout(`${API_URL}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeader()),
        },
        body: JSON.stringify(body),
      });
      const json = await parseJsonSafe(response);
      if (!response.ok && json.success === undefined) {
        return { success: false, error: json.error || `Request failed (${response.status})` };
      }
      return json;
    } catch (error: any) {
      const msg = error?.name === 'AbortError' ? 'Request timed out' : 'Network error';
      console.error(`API POST ${path} error:`, error);
      return { success: false, error: msg };
    }
  },

  async patch<T = any>(path: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_URL}${path}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeader()),
        },
        body: JSON.stringify(body),
      });
      return await response.json();
    } catch (error) {
      console.error(`API PATCH ${path} error:`, error);
      return { success: false, error: 'Network error' };
    }
  },
};
