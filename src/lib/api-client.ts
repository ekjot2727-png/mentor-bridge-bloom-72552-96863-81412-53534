import axios, { AxiosInstance, AxiosError } from 'axios';

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  timestamp?: string;
}

interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

export class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string = import.meta.env.VITE_API_URL || 'http://localhost:3000/api') {
    this.client = axios.create({
      baseURL,
      withCredentials: true,
    });

    // Load token from localStorage
    this.token = localStorage.getItem('accessToken');

    // Add request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Add response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearAuth();
          window.location.href = '/';
        }
        return Promise.reject(error);
      },
    );
  }

  // Auth endpoints
  async register(email: string, password: string, firstName: string, lastName: string, role: string) {
    const response = await this.client.post<ApiResponse>('/auth/register', {
      email,
      password,
      firstName,
      lastName,
      role,
    });
    if (response.data.data.accessToken) {
      this.setAuth(response.data.data.accessToken, response.data.data.refreshToken);
    }
    return response.data.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post<ApiResponse>('/auth/login', { email, password });
    if (response.data.data.accessToken) {
      this.setAuth(response.data.data.accessToken, response.data.data.refreshToken);
    }
    return response.data.data;
  }

  async logout() {
    try {
      await this.client.post('/auth/logout');
    } finally {
      this.clearAuth();
    }
  }

  // Profile endpoints
  async getProfile(userId: string) {
    const response = await this.client.get<ApiResponse>(`/profiles/${userId}`);
    return response.data.data;
  }

  async updateProfile(userId: string, profileData: any) {
    const response = await this.client.patch<ApiResponse>(`/profiles/${userId}`, profileData);
    return response.data.data;
  }

  async uploadProfilePhoto(userId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post<ApiResponse>(
      `/profiles/${userId}/photo`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data.data;
  }

  async searchAlumni(filters: any = {}, page = 1, limit = 20) {
    const response = await this.client.get<ApiResponse>('/profiles/alumni/search', {
      params: { ...filters, page, limit },
    });
    return response.data.data;
  }

  async getAlumniDirectory(page = 1, limit = 20) {
    const response = await this.client.get<ApiResponse>('/profiles/alumni/directory', {
      params: { page, limit },
    });
    return response.data.data;
  }

  // Messages endpoints
  async sendMessage(receiverId: string, content: string) {
    const response = await this.client.post<ApiResponse>('/messages', {
      receiverId,
      content,
    });
    return response.data.data;
  }

  async getConversation(userId: string, page = 1, limit = 50) {
    const response = await this.client.get<ApiResponse>(`/messages/${userId}`, {
      params: { page, limit },
    });
    return response.data.data;
  }

  async getConversations(page = 1, limit = 20) {
    const response = await this.client.get<ApiResponse>('/messages', {
      params: { page, limit },
    });
    return response.data.data;
  }

  // Connections endpoints
  async sendConnectionRequest(receiverId: string, message?: string) {
    const response = await this.client.post<ApiResponse>('/connections', {
      receiverId,
      message,
    });
    return response.data.data;
  }

  async respondToConnection(connectionId: string, accepted: boolean) {
    const response = await this.client.patch<ApiResponse>(`/connections/${connectionId}`, {
      accepted,
    });
    return response.data.data;
  }

  async getConnections(page = 1, limit = 20) {
    const response = await this.client.get<ApiResponse>('/connections', {
      params: { page, limit },
    });
    return response.data.data;
  }

  async getPendingRequests(page = 1, limit = 20) {
    const response = await this.client.get<ApiResponse>('/connections/pending', {
      params: { page, limit },
    });
    return response.data.data;
  }

  // Analytics endpoints (admin only)
  async getUserStatistics(startDate?: Date, endDate?: Date) {
    const response = await this.client.get<ApiResponse>('/analytics/users', {
      params: { startDate, endDate },
    });
    return response.data.data;
  }

  async getEngagementMetrics(startDate?: Date, endDate?: Date) {
    const response = await this.client.get<ApiResponse>('/analytics/engagement', {
      params: { startDate, endDate },
    });
    return response.data.data;
  }

  async getPlatformHealth() {
    const response = await this.client.get<ApiResponse>('/analytics/platform');
    return response.data.data;
  }

  async getDashboardSummary(startDate?: Date, endDate?: Date) {
    const response = await this.client.get<ApiResponse>('/analytics/dashboard', {
      params: { startDate, endDate },
    });
    return response.data.data;
  }

  async getAnalyticsReport(filters: any) {
    const response = await this.client.get<ApiResponse>('/analytics/report', {
      params: filters,
    });
    return response.data.data;
  }

  async exportAnalytics(format: 'csv' | 'pdf', filters?: any) {
    const response = await this.client.post(
      '/analytics/export',
      { format, filters },
      { responseType: 'blob' },
    );
    return response.data;
  }

  // Helper methods
  private setAuth(accessToken: string, refreshToken: string) {
    this.token = accessToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private clearAuth() {
    this.token = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  getAuthToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
