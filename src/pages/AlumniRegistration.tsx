// @ts-nocheck
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { Users, ArrowRight, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const AlumniRegistration = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [password, setPassword] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    linkedinId: "",
    company: "",
    position: "",
    graduationYear: "",
    expertise: "",
    college: "",
    fullName: ""
  });

  const colleges = [
    "JECRC Foundation",
    "JECRC University",
    "IIT Bombay",
    "IIT Madras",
    "IIT Delhi",
    "IIT Kharagpur",
    "IIT Kanpur",
    "NIT Trichy",
    "BITS Pilani",
    "VIT Vellore"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to continue.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/alumni-portal`,
          data: {
            user_type: 'alumni',
            username: formData.username,
            full_name: formData.fullName,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update profile with additional data
        const { error: profileError } = await supabase
          .from('profiles' as any)
          .update({
            company: formData.company,
            position: formData.position,
            graduation_year: formData.graduationYear,
            linkedin_url: formData.linkedinId,
            location: formData.college,
            bio: formData.expertise,
            terms_accepted: true,
          })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;

        toast({
          title: "Registration Successful!",
          description: "Please check your email to verify your account.",
        });

        navigate('/alumni-login');
      }
    } catch (error: any) {
      // Only log error message, not full error object with sensitive data
      console.error('Registration failed:', error?.message || 'Unknown error');
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration.",
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
        <Card className="max-w-2xl mx-auto glass-effect p-12 border border-accent/20">
          <div className="text-center mb-8">
            <Users className="h-16 w-16 text-accent mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2 hero-text">Alumni Registration</h1>
            <p className="text-foreground/70">Share your expertise with the next generation</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password (min 8 characters)"
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedinId">LinkedIn ID (Optional)</Label>
              <Input
                id="linkedinId"
                value={formData.linkedinId}
                onChange={(e) => setFormData({...formData, linkedinId: e.target.value})}
                placeholder="Enter your LinkedIn profile URL"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Current Company *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                placeholder="Enter your current company"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Current Position *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                placeholder="Enter your current position"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="graduationYear">Graduation Year *</Label>
              <Input
                id="graduationYear"
                value={formData.graduationYear}
                onChange={(e) => setFormData({...formData, graduationYear: e.target.value})}
                placeholder="Enter your graduation year"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="college">College *</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between glass-effect"
                  >
                    {formData.college || "Select college..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 glass-effect border border-accent/20" align="start">
                  <Command>
                    <CommandInput placeholder="Search college..." />
                    <CommandList>
                      <CommandEmpty>No college found.</CommandEmpty>
                      <CommandGroup>
                        {colleges.map((college) => (
                          <CommandItem
                            key={college}
                            value={college}
                            onSelect={(value) => {
                              setFormData({...formData, college: value});
                              setOpen(false);
                            }}
                          >
                            {college}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expertise">Area of Expertise *</Label>
              <Input
                id="expertise"
                value={formData.expertise}
                onChange={(e) => setFormData({...formData, expertise: e.target.value})}
                placeholder="e.g., Software Engineering, Marketing, Finance"
                required
              />
            </div>

            <div className="flex items-start space-x-2 pt-4">
              <Checkbox 
                id="terms" 
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              />
              <label
                htmlFor="terms"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I accept the terms and conditions and privacy policy *
              </label>
            </div>

            <Button 
              type="submit" 
              variant="connection" 
              size="lg" 
              className="w-full text-lg py-4 h-auto group"
              disabled={loading || !termsAccepted}
            >
              {loading ? "Creating Account..." : "Create Alumni Profile"}
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AlumniRegistration;