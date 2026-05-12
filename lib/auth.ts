import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { api } from './api';

async function setToken(token: string) {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem('special_token', token);
    } else {
      await SecureStore.setItemAsync('special_token', token);
    }
  } catch (e) {
    console.error('Failed to save token', e);
  }
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

async function removeToken() {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem('special_token');
    } else {
      await SecureStore.deleteItemAsync('special_token');
    }
  } catch (e) {
    console.error('Failed to remove token', e);
  }
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.apexbinary.site/api';

export const auth = {
  async login(email: string, password: string) {
    const response = await api.post('/users/login', { email, password });
    const token = response.token || response.data?.token;
    if (token) {
      await setToken(token);
      return { success: true, user: response.user || response.data?.user || response };
    }
    return { success: false, error: response.error || 'Login failed' };
  },

  async logout() {
    await api.post('/users/logout', {});
    await removeToken();
  },

  async getMe() {
    return await api.get('/users/profile');
  },

  async isAuthenticated() {
    const token = await getToken();
    return !!token;
  },
};
