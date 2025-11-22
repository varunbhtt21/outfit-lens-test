import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// MOCKING THE BACKEND FOR DEMO PURPOSES
// In a real scenario, this would be: const BASE_URL = 'http://localhost:8000';
// But since there is no backend running, we will simulate successful responses
// after a short delay to make the UI functional for the user to explore.
const DEMO_MODE = true;

export const api = axios.create({
  baseURL: 'http://localhost:8000', // Placeholder
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for 401 handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!DEMO_MODE && error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// Mock Helpers
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// --- API Methods ---

export const authApi = {
  login: async (email: string, password: string) => {
    if (DEMO_MODE) {
      await delay(1000);
      if (email === 'fail@test.com') throw new Error('Invalid credentials');
      return {
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        token_type: 'bearer',
        user: {
          id: '1',
          email,
          full_name: 'Demo User',
          created_at: new Date().toISOString(),
        },
      };
    }
    const res = await api.post('/api/v1/auth/login', { email, password });
    return res.data;
  },
  register: async (data: any) => {
    if (DEMO_MODE) {
      await delay(1000);
      return {
        access_token: 'mock_at',
        refresh_token: 'mock_rt',
        token_type: 'bearer',
        user: {
          id: '1',
          email: data.email,
          full_name: data.full_name,
          created_at: new Date().toISOString(),
        },
      };
    }
    const res = await api.post('/api/v1/auth/register', data);
    return res.data;
  },
};

export const userApi = {
  getMe: async () => {
    if (DEMO_MODE) {
      await delay(500);
      return {
        id: '1',
        email: 'demo@example.com',
        full_name: 'Demo User',
        created_at: new Date().toISOString(),
      };
    }
    const res = await api.get('/api/v1/users/me');
    return res.data;
  },
};

export const imageApi = {
  upload: async (file: File, type: string) => {
    if (DEMO_MODE) {
      await delay(1500);
      return {
        id: Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(file),
        image_type: type,
        file_size: file.size,
        width: 800,
        height: 800,
        created_at: new Date().toISOString(),
      };
    }
    const formData = new FormData();
    formData.append('file', file);
    const endpoint = type === 'user_photo' ? '/api/v1/images/upload/user-photo' : '/api/v1/images/upload/clothing-photo';
    const res = await api.post(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  getAll: async (type?: string) => {
    if (DEMO_MODE) {
        await delay(800);
        const images = Array.from({ length: 6 }).map((_, i) => ({
            id: `img_${i}`,
            url: `https://picsum.photos/id/${100 + i}/400/600`,
            image_type: type || 'user_photo',
            file_size: 1024 * 500,
            width: 400,
            height: 600,
            created_at: new Date().toISOString(),
        }));
        return { items: images, total: 6 };
    }
    const res = await api.get('/api/v1/images', { params: { image_type: type } });
    return res.data;
  }
};

export const generationApi = {
  create: async (userPhotoId: string, clothingPhotoId: string) => {
    if (DEMO_MODE) {
      await delay(1000);
      return {
        id: 'gen_' + Math.random().toString(36).substr(2, 9),
        status: 'processing',
        created_at: new Date().toISOString(),
      };
    }
    const res = await api.post('/api/v1/generations', { user_photo_id: userPhotoId, clothing_photo_id: clothingPhotoId });
    return res.data;
  },
  getStatus: async (id: string) => {
    if (DEMO_MODE) {
      // Randomly finish or fail
      await delay(500);
      // Simulate completing after a few polls (handled by frontend logic usually, here we just return random progress state if mocked)
      // For demo, let's just say it completes immediately next call
      return {
        id,
        status: 'completed', 
        result_image: {
            id: 'res_1',
            url: 'https://picsum.photos/id/331/800/1000', // Fashion image
            image_type: 'generated_result',
            created_at: new Date().toISOString()
        }
      };
    }
    const res = await api.get(`/api/v1/generations/${id}/status`);
    return res.data;
  },
  getHistory: async (page = 1) => {
      if (DEMO_MODE) {
          await delay(800);
          const items = Array.from({ length: 5 }).map((_, i) => ({
              id: `hist_${i}`,
              status: i === 0 ? 'processing' : 'completed',
              created_at: new Date(Date.now() - i * 86400000).toISOString(),
              user_photo: { url: `https://picsum.photos/id/${200+i}/300/400` },
              clothing_photo: { url: `https://picsum.photos/id/${300+i}/300/400` },
              result_image: { url: `https://picsum.photos/id/${400+i}/300/400` }
          }));
          return { items, total: 20, page, page_size: 5, has_more: true };
      }
      const res = await api.get('/api/v1/generations', { params: { page } });
      return res.data;
  }
};
