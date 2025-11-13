import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  TrendingUp,
  MessageSquare,
  UserPlus,
  Activity,
  Download,
  Filter,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface DashboardData {
  users: {
    totalUsers: number;
    byRole: { students: number; alumni: number; admins: number };
    byStatus: { active: number; inactive: number };
    retentionRate: string;
  };
  engagement: {
    totalMessages: number;
    totalConnections: number;
    pendingConnections: number;
    messagesByDay: Array<{ date: string; count: number }>;
    uniqueActiveUsers: number;
  };
  platform: {
    uptime: string;
    avgResponseTime: string;
    recentErrors: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  connections: {
    totalConnections: number;
    pendingRequests: number;
    rejectedConnections: number;
    acceptanceRate: string;
  };
}

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    loadAnalytics();
  }, [dateRange, filterBy]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      let startDate: Date | undefined;
      let endDate = new Date();

      switch (dateRange) {
        case '7days':
          startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90days':
          startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
      }

      const response = await apiClient.getDashboardSummary(startDate, endDate);
      setData(response);
    } catch (error) {
      toast({
        title: 'Error loading analytics',
        description: error instanceof Error ? error.message : 'Failed to load analytics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      const blob = await apiClient.exportAnalytics(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Failed to export analytics',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-destructive">Failed to load analytics</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 pt-24">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive insights into your platform performance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('csv')}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="students">Students Only</SelectItem>
              <SelectItem value="alumni">Alumni Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.users.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Retention: {data.users.retentionRate}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.users.byStatus.active}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.engagement.totalMessages}</div>
              <p className="text-xs text-muted-foreground">Total in period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Connections</CardTitle>
              <UserPlus className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.connections.totalConnections}</div>
              <p className="text-xs text-muted-foreground">
                Pending: {data.connections.pendingRequests}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Platform Status</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.platform.uptime}</div>
              <p className="text-xs text-muted-foreground">{data.platform.status}</p>
            </CardContent>
          </Card>
        </div>

        {/* User Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Users by Role</CardTitle>
              <CardDescription>Distribution of user types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Students</span>
                  <span className="font-bold">{data.users.byRole.students}</span>
                </div>
                <div className="flex justify-between">
                  <span>Alumni</span>
                  <span className="font-bold">{data.users.byRole.alumni}</span>
                </div>
                <div className="flex justify-between">
                  <span>Admins</span>
                  <span className="font-bold">{data.users.byRole.admins}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connection Statistics</CardTitle>
              <CardDescription>Connection request insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Accepted</span>
                  <span className="font-bold">{data.connections.totalConnections}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending</span>
                  <span className="font-bold">{data.connections.pendingRequests}</span>
                </div>
                <div className="flex justify-between">
                  <span>Acceptance Rate</span>
                  <span className="font-bold">{data.connections.acceptanceRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        {data.engagement.messagesByDay && data.engagement.messagesByDay.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Messages Over Time</CardTitle>
              <CardDescription>Daily message volume</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.engagement.messagesByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" name="Messages" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
