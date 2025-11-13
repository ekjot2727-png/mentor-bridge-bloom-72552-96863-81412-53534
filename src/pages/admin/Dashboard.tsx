import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, Calendar, TrendingUp, Upload, MessageSquare, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [institute, setInstitute] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/admin/login");
        return;
      }

      // Get user's admin role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("*, institutes(*)")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (!roles) {
        toast({
          title: "Access denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setInstitute(roles.institutes);
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const quickActions = [
    {
      title: "Bulk Data Onboarding",
      description: "Upload alumni data and student IDs",
      icon: Upload,
      href: "/admin/onboarding",
      color: "text-blue-600",
    },
    {
      title: "Analytics Dashboard",
      description: "View comprehensive institute analytics",
      icon: TrendingUp,
      href: "/admin/analytics",
      color: "text-green-600",
    },
    {
      title: "User Management",
      description: "Manage students and alumni",
      icon: Users,
      href: "/admin/users",
      color: "text-purple-600",
    },
    {
      title: "Content Moderation",
      description: "Review pending approvals",
      icon: Shield,
      href: "/admin/moderation",
      color: "text-orange-600",
    },
    {
      title: "Communications",
      description: "Send targeted announcements",
      icon: MessageSquare,
      href: "/admin/communications",
      color: "text-pink-600",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Portal</h1>
            <p className="text-sm text-muted-foreground">{institute?.name}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome to the Command Center</h2>
          <p className="text-muted-foreground">
            Manage your institution's alumni network and student engagement
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Alumni</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,847</div>
              <p className="text-xs text-muted-foreground">+12% from last year</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Mentors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342</div>
              <p className="text-xs text-muted-foreground">89% engagement rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Job Postings</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">23 posted this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Next: Alumni Mixer</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action) => (
              <Card
                key={action.title}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(action.href)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-primary/10`}>
                      <action.icon className={`h-6 w-6 ${action.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {action.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
