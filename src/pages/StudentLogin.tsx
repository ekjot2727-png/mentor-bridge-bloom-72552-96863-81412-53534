import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { GraduationCap, ArrowRight, ArrowLeft } from "lucide-react";
import { ApiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

const StudentLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const apiClient = new ApiClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('🔐 Attempting login with:', formData.email);
      const response = await apiClient.login(formData.email.trim(), formData.password);
      
      console.log('✅ Login response:', response);
      
      if (!response.accessToken) {
        throw new Error('No access token received');
      }

      // Verify user is a student
      if (response.user && response.user.role !== 'student') {
        throw new Error('This account is not registered as a student');
      }

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      navigate('/student-portal');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      let errorMessage = 'Invalid credentials';
      
      // Detailed error handling
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error - Cannot reach server. Make sure backend is running on http://localhost:3000';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Bad request';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('Error details:', {
        message: errorMessage,
        status: error.response?.status,
        code: error.code,
        data: error.response?.data,
      });
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="container mx-auto px-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/portal-selection')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card className="max-w-md mx-auto glass-effect p-12 border border-primary/20">
          <div className="text-center mb-8">
            <GraduationCap className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2 hero-text">Student Login</h1>
            <p className="text-foreground/70">Welcome back!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="student@jecrc.edu"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            <Button 
              type="submit" 
              variant="hero" 
              size="lg" 
              className="w-full text-lg py-4 h-auto group"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Login"}
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default StudentLogin;
