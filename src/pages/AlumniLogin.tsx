import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Users, ArrowRight, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AlumniLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error) throw error;

      // Verify user type is alumni
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', data.user.id)
        .single();

      if (!profile) {
        await supabase.auth.signOut();
        throw new Error('Profile not found');
      }

      if (profile.user_type !== 'alumni') {
        await supabase.auth.signOut();
        throw new Error('This account is not registered as an alumni');
      }

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      navigate('/alumni-portal');
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || 'Invalid credentials',
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
        <Card className="max-w-md mx-auto glass-effect p-12 border border-accent/20">
          <div className="text-center mb-8">
            <Users className="h-16 w-16 text-accent mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2 hero-text">Alumni Login</h1>
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
                placeholder="alumni@jecrc.edu"
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
              variant="connection" 
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

export default AlumniLogin;
