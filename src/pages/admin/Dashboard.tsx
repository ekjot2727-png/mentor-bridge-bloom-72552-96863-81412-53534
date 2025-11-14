import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users, TrendingUp, MessageSquare, Network, Download, Upload,
  CheckCircle, AlertCircle
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalAlumni: number;
  totalStudents: number;
  totalConnections: number;
  totalMessages: number;
  activeUsers: number;
}

interface EngagementData {
  date: string;
  messages: number;
  connections: number;
  logins: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [bulkUploadFile, setBulkUploadFile] = useState<File | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
      navigate('/');
      return;
    }
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);

      const [userStats, engagement] = await Promise.all([
        apiClient.getUserStatistics(startDate, endDate),
        apiClient.getEngagementMetrics(startDate, endDate),
      ]);

      setStats(userStats);

      // Format engagement data for charts
      if (engagement && Array.isArray(engagement)) {
        setEngagementData(engagement);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkUploadFile) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setLoading(true);
      await apiClient.bulkUploadAlumni(bulkUploadFile);

      setSuccess('Alumni data uploaded successfully!');
      setBulkUploadFile(null);
      setTimeout(() => setSuccess(''), 3000);
      loadDashboardData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const handleExportAnalytics = async (format: 'csv' | 'pdf') => {
    try {
      setLoading(true);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);

      const blob = await apiClient.exportAnalytics(format, {
        startDate,
        endDate,
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-report.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to export analytics');
    } finally {
      setLoading(false);
    }
  };

  const userDistribution = stats ? [
    { name: 'Students', value: stats.totalStudents, color: '#3b82f6' },
    { name: 'Alumni', value: stats.totalAlumni, color: '#10b981' },
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Platform analytics and administration</p>
        </div>

        {/* Date Range Selector */}
        <Card className="mb-6">
          <CardContent className="p-4 flex gap-4 items-end flex-wrap">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <Button
              onClick={() => loadDashboardData()}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Update
            </Button>
          </CardContent>
        </Card>

        {/* Key Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Users</p>
                    <p className="text-3xl font-bold">{stats.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Connections</p>
                    <p className="text-3xl font-bold">{stats.totalConnections}</p>
                  </div>
                  <Network className="h-8 w-8 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Messages</p>
                    <p className="text-3xl font-bold">{stats.totalMessages}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-purple-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Active Users</p>
                    <p className="text-3xl font-bold">{stats.activeUsers}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts and Data */}
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="users">User Distribution</TabsTrigger>
            <TabsTrigger value="upload">Bulk Upload</TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Engagement Metrics</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportAnalytics('csv')}
                      disabled={loading}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      CSV
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportAnalytics('pdf')}
                      disabled={loading}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {engagementData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="messages" stroke="#3b82f6" />
                      <Line type="monotone" dataKey="connections" stroke="#10b981" />
                      <Line type="monotone" dataKey="logins" stroke="#f59e0b" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No data available for selected period</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Distribution Tab */}
          <TabsContent value="users">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {userDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={userDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {userDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No user data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats && (
                    <>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                        <span className="font-medium">Students</span>
                        <Badge>{stats.totalStudents}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                        <span className="font-medium">Alumni</span>
                        <Badge variant="secondary">{stats.totalAlumni}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
                        <span className="font-medium">Total Users</span>
                        <Badge variant="outline">{stats.totalUsers}</Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bulk Upload Tab */}
          <TabsContent value="upload">
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Bulk Alumni Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleBulkUpload} className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={(e) => setBulkUploadFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-gray-400" />
                        <p className="font-medium">
                          {bulkUploadFile ? bulkUploadFile.name : 'Click to upload CSV or Excel file'}
                        </p>
                        <p className="text-sm text-gray-500">
                          CSV/XLSX format with columns: firstName, lastName, email, company, position, location, skills
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="bg-blue-50 p-4 rounded border border-blue-200">
                    <p className="text-sm text-blue-900">
                      <strong>File Format:</strong> Your CSV/Excel file should contain the following columns:
                    </p>
                    <ul className="text-sm text-blue-900 mt-2 ml-4 list-disc">
                      <li>firstName (required)</li>
                      <li>lastName (required)</li>
                      <li>email (required)</li>
                      <li>company</li>
                      <li>position</li>
                      <li>location</li>
                      <li>skills</li>
                      <li>graduationYear</li>
                      <li>industry</li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={loading || !bulkUploadFile}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? 'Uploading...' : 'Upload Alumni Data'}
                    </Button>
                    {bulkUploadFile && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setBulkUploadFile(null)}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
