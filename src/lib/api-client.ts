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

  constructor(baseURL?: string) {
    // Use environment variable or direct backend URL
    const resolvedBaseURL = baseURL || 
      import.meta.env.VITE_API_URL || 
      'http://localhost:3000/api';
    
    console.log('🔗 API Client initialized');
    console.log('  Base URL:', resolvedBaseURL);
    console.log('  VITE_API_URL:', import.meta.env.VITE_API_URL);
    
    this.client = axios.create({
      baseURL: resolvedBaseURL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load token from localStorage
    this.token = localStorage.getItem('accessToken');

    // Add request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      },
    );

    // Add response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log('📥 API Response:', response.status, response.config.url);
        return response;
      },
      (error: AxiosError) => {
        console.error('❌ Response Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data,
        });
        
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
    const response = await this.client.post<any>('/auth/register', {
      email,
      password,
      firstName,
      lastName,
      role,
    });
    if (response.data.accessToken) {
      this.setAuth(response.data.accessToken, response.data.refreshToken, response.data.user);
    }
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post<any>('/auth/login', { email, password });
    if (response.data.accessToken) {
      this.setAuth(response.data.accessToken, response.data.refreshToken, response.data.user);
    }
    return response.data;
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

  async bulkUploadAlumni(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post<ApiResponse>(
      '/profiles/bulk-upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data.data;
  }

  // Jobs endpoints
  async createJob(jobData: any) {
    const response = await this.client.post<ApiResponse>('/jobs', jobData);
    return response.data;
  }

  async getJobs(filters: any = {}) {
    const response = await this.client.get<ApiResponse>('/jobs', { params: filters });
    return response.data;
  }

  async getJobById(jobId: string) {
    const response = await this.client.get<ApiResponse>(`/jobs/${jobId}`);
    return response.data;
  }

  async updateJob(jobId: string, jobData: any) {
    const response = await this.client.put<ApiResponse>(`/jobs/${jobId}`, jobData);
    return response.data;
  }

  async deleteJob(jobId: string) {
    const response = await this.client.delete<ApiResponse>(`/jobs/${jobId}`);
    return response.data;
  }

  async getMyPostedJobs(page = 1, limit = 10) {
    const response = await this.client.get<ApiResponse>('/jobs/my-postings', {
      params: { page, limit },
    });
    return response.data;
  }

  async closeJob(jobId: string) {
    const response = await this.client.patch<ApiResponse>(`/jobs/${jobId}/close`);
    return response.data;
  }

  async applyToJob(jobId: string) {
    const response = await this.client.post<ApiResponse>(`/jobs/${jobId}/apply`);
    return response.data;
  }

  async getJobStatistics() {
    const response = await this.client.get<ApiResponse>('/jobs/statistics');
    return response.data;
  }

  // Startups endpoints
  async createStartup(startupData: any) {
    const response = await this.client.post<ApiResponse>('/startups', startupData);
    return response.data;
  }

  async getStartups(filters: any = {}) {
    const response = await this.client.get<ApiResponse>('/startups', { params: filters });
    return response.data;
  }

  async getStartupById(startupId: string) {
    const response = await this.client.get<ApiResponse>(`/startups/${startupId}`);
    return response.data;
  }

  async getMyStartup() {
    const response = await this.client.get<ApiResponse>('/startups/my-startup');
    return response.data;
  }

  async updateStartup(startupId: string, startupData: any) {
    const response = await this.client.put<ApiResponse>(`/startups/${startupId}`, startupData);
    return response.data;
  }

  async deleteStartup(startupId: string) {
    const response = await this.client.delete<ApiResponse>(`/startups/${startupId}`);
    return response.data;
  }

  async getPendingStartups(page = 1, limit = 10) {
    const response = await this.client.get<ApiResponse>('/startups/pending', {
      params: { page, limit },
    });
    return response.data;
  }

  async approveStartup(startupId: string) {
    const response = await this.client.patch<ApiResponse>(`/startups/${startupId}/approve`);
    return response.data;
  }

  async rejectStartup(startupId: string) {
    const response = await this.client.patch<ApiResponse>(`/startups/${startupId}/reject`);
    return response.data;
  }

  async getStartupStatistics() {
    const response = await this.client.get<ApiResponse>('/startups/statistics');
    return response.data;
  }

  // AI Career Advisor endpoints
  async getCareerAdvice(queryData: any) {
    const response = await this.client.post<ApiResponse>('/ai/career-advisor', queryData);
    return response.data;
  }

  async analyzeCareer() {
    const response = await this.client.get<ApiResponse>('/ai/career-advisor/analyze');
    return response.data;
  }

  async getAlumniMatch() {
    const response = await this.client.get<ApiResponse>('/ai/alumni-match');
    return response.data;
  }

  // Helper methods
  private setAuth(accessToken: string, refreshToken: string, user?: any) {
    this.token = accessToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  private clearAuth() {
    this.token = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
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
