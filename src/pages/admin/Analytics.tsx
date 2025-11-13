import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Briefcase, DollarSign, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function AdminAnalytics() {
  const navigate = useNavigate();

  // Mock data
  const industryData = [
    { name: "Technology", value: 450, percentage: 35 },
    { name: "Finance", value: 320, percentage: 25 },
    { name: "Healthcare", value: 200, percentage: 15 },
    { name: "Education", value: 150, percentage: 12 },
    { name: "Other", value: 167, percentage: 13 },
  ];

  const monthlyActiveUsers = [
    { month: "Jan", users: 1200, registrations: 45 },
    { month: "Feb", users: 1350, registrations: 62 },
    { month: "Mar", users: 1500, registrations: 78 },
    { month: "Apr", users: 1680, registrations: 89 },
    { month: "May", users: 1850, registrations: 94 },
    { month: "Jun", users: 2100, registrations: 120 },
  ];

  const engagementData = [
    { name: "Mentorship", value: 340 },
    { name: "Job Applications", value: 520 },
    { name: "Event RSVPs", value: 680 },
    { name: "Donations", value: 180 },
  ];

  const topCompanies = [
    { name: "Google", count: 89 },
    { name: "Microsoft", count: 76 },
    { name: "Amazon", count: 65 },
    { name: "Apple", count: 54 },
    { name: "Meta", count: 43 },
  ];

  const locations = [
    { city: "San Francisco", count: 450 },
    { city: "New York", count: 380 },
    { city: "Boston", count: 290 },
    { city: "Seattle", count: 245 },
    { city: "Austin", count: 210 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/admin/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Comprehensive Analytics</h1>
          <p className="text-muted-foreground">
            360-degree view of your alumni network
          </p>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Alumni</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">2,847</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600">+12%</span> from last year
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Mentors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">342</div>
              <p className="text-xs text-muted-foreground mt-1">
                89% engagement rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Jobs Posted</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">156</div>
              <p className="text-xs text-muted-foreground mt-1">
                23 posted this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Funds Raised</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$487K</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600">+28%</span> YoY growth
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Alumni by Industry */}
          <Card>
            <CardHeader>
              <CardTitle>Alumni by Industry</CardTitle>
              <CardDescription>Distribution across top industries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {industryData.map((industry, index) => (
                  <div key={industry.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{industry.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {industry.value} ({industry.percentage}%)
                      </span>
                    </div>
                    <Progress value={industry.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Active Users */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Engagement</CardTitle>
              <CardDescription>Monthly active users and registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyActiveUsers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#8884d8" name="Active Users" />
                  <Line type="monotone" dataKey="registrations" stroke="#82ca9d" name="New Registrations" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activity Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Breakdown</CardTitle>
              <CardDescription>Types of platform interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={engagementData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {engagementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Companies */}
          <Card>
            <CardHeader>
              <CardTitle>Top Employers</CardTitle>
              <CardDescription>Companies with most alumni</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCompanies}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Alumni by Location */}
        <Card>
          <CardHeader>
            <CardTitle>Alumni by Location</CardTitle>
            <CardDescription>Top cities where alumni are located</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {locations.map((location, index) => (
                <div key={location.city}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{location.city}</span>
                    <span className="text-sm text-muted-foreground">{location.count} alumni</span>
                  </div>
                  <Progress value={(location.count / 450) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
