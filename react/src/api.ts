import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_HOST,
});

// Request interceptor to add auth token
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

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear the token
      localStorage.removeItem('token');
      // Redirect to login page
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Collection API methods
export const collectionApi = {
  // Get collection data
  getCollection: (folderId?: string) => {
    const endpoint = folderId ? `api/collections?folderId=${folderId}` : 'api/collections';
    return api.get(endpoint);
  },

  // Get collection statistics
  getStatistics: (folderId?: string) => {
    const endpoint = folderId ? `api/collections/stats?folderId=${folderId}` : 'api/collections/stats';
    return api.get(endpoint);
  },

  // Get all folders
  getAllFolders: () => {
    return api.get('api/collections/folders');
  },

  // Create new miniature
  createMiniature: (data: {
    name: string;
    count: number;
    status: string;
    folderId?: string;
  }) => {
    return api.post('api/collections/miniatures', data);
  },

  // Update miniature
  updateMiniature: (miniatureId: string, data: Partial<{
    name: string;
    count: number;
    status: string;
  }>) => {
    return api.patch(`api/collections/miniatures/${miniatureId}`, data);
  },

  // Upload images for miniature
  uploadImages: (miniatureId: string, formData: FormData) => {
    return api.post(`api/collections/miniatures/${miniatureId}/pictures`, formData);
  },

  // Delete picture
  deletePicture: (pictureId: string) => {
    return api.delete(`api/collections/pictures/${pictureId}`);
  },

  // Delete miniature
  deleteMiniature: (miniatureId: string) => {
    return api.delete(`api/collections/miniatures/${miniatureId}`);
  },

  // Create new folder
  createFolder: (data: {
    name: string;
    folderId?: string;
  }) => {
    return api.post('api/collections/folders', data);
  },

  // Delete folder
  deleteFolder: (folderId: string) => {
    return api.delete(`api/collections/folders/${folderId}`);
  },

  // Update folder
  updateFolder: (folderId: string, data: Partial<{
    name: string;
  }>) => {
    return api.patch(`api/collections/folders/${folderId}`, data);
  },

  // Move miniatures/folders
  moveItems: (data: {
    miniatureIds: string[];
    folderIds: string[];
    targetFolderId: string;
  }) => {
    return api.patch('api/collections/miniatures', data);
  },
};

// Auth API methods
export const authApi = {
  // Login
  login: (data: { username: string; password: string }) => {
    return api.post('api/login_check', data);
  },

  // Register
  register: (data: { username: string; password: string }) => {
    return api.post('api/register', data);
  },
};

// Admin API methods
export const adminApi = {
  // Get all users with statistics
  getUsers: () => {
    return api.get('api/admin/users');
  },
};

export default api; 