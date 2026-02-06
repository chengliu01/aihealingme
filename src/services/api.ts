// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Set token to localStorage
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Remove token from localStorage
export const removeToken = (): void => {
  localStorage.removeItem('token');
};

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

// Auth API
export const authAPI = {
  register: async (userData: {
    username: string;
    email: string;
    password: string;
  }) => {
    return apiRequest<{
      success: boolean;
      data: { user: any; token: string };
      message: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials: { email: string; password: string }) => {
    return apiRequest<{
      success: boolean;
      data: { user: any; token: string };
      message: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  getCurrentUser: async () => {
    return apiRequest<{
      success: boolean;
      data: { user: any };
    }>('/auth/me');
  },

  updatePassword: async (passwords: {
    currentPassword: string;
    newPassword: string;
  }) => {
    return apiRequest<{
      success: boolean;
      message: string;
    }>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(passwords),
    });
  },
};

// User API
export const userAPI = {
  getUserProfile: async (userId: string) => {
    return apiRequest<{
      success: boolean;
      data: { user: any };
    }>(`/users/${userId}`);
  },

  updateProfile: async (profileData: {
    username?: string;
    bio?: string;
    avatar?: string;
  }) => {
    return apiRequest<{
      success: boolean;
      data: { user: any };
      message: string;
    }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  followUser: async (userId: string) => {
    return apiRequest<{
      success: boolean;
      message: string;
    }>(`/users/${userId}/follow`, {
      method: 'POST',
    });
  },

  unfollowUser: async (userId: string) => {
    return apiRequest<{
      success: boolean;
      message: string;
    }>(`/users/${userId}/follow`, {
      method: 'DELETE',
    });
  },

  getFollowers: async (userId: string) => {
    return apiRequest<{
      success: boolean;
      data: { followers: any[] };
    }>(`/users/${userId}/followers`);
  },

  getFollowing: async (userId: string) => {
    return apiRequest<{
      success: boolean;
      data: { following: any[] };
    }>(`/users/${userId}/following`);
  },
};

// Audio API
export const audioAPI = {
  createAudio: async (audioData: {
    title: string;
    description: string;
    audioUrl: string;
    coverImage?: string;
    duration: number;
    category: string;
    tags?: string[];
    isPublic?: boolean;
  }) => {
    return apiRequest<{
      success: boolean;
      data: { audio: any };
      message: string;
    }>('/audio', {
      method: 'POST',
      body: JSON.stringify(audioData),
    });
  },

  getAllAudios: async (params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    return apiRequest<{
      success: boolean;
      data: {
        audios: any[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      };
    }>(`/audio${queryString ? `?${queryString}` : ''}`);
  },

  getAudioById: async (audioId: string) => {
    return apiRequest<{
      success: boolean;
      data: { audio: any };
    }>(`/audio/${audioId}`);
  },

  updateAudio: async (
    audioId: string,
    audioData: {
      title?: string;
      description?: string;
      coverImage?: string;
      category?: string;
      tags?: string[];
      isPublic?: boolean;
    }
  ) => {
    return apiRequest<{
      success: boolean;
      data: { audio: any };
      message: string;
    }>(`/audio/${audioId}`, {
      method: 'PUT',
      body: JSON.stringify(audioData),
    });
  },

  deleteAudio: async (audioId: string) => {
    return apiRequest<{
      success: boolean;
      message: string;
    }>(`/audio/${audioId}`, {
      method: 'DELETE',
    });
  },

  toggleLike: async (audioId: string) => {
    return apiRequest<{
      success: boolean;
      data: { liked: boolean };
      message: string;
    }>(`/audio/${audioId}/like`, {
      method: 'POST',
    });
  },

  getRecommended: async (limit?: number) => {
    const queryString = limit ? `?limit=${limit}` : '';
    return apiRequest<{
      success: boolean;
      data: { audios: any[] };
    }>(`/audio/recommended${queryString}`);
  },
};
