import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MapPin, Briefcase, GraduationCap, Mail, Phone, MessageSquare, Loader2, Edit2, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import MessagePreview from "@/components/MessagePreview";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profile?: {
    id?: string;
    headline?: string;
    bio?: string;
    location?: string;
    skills?: string[];
    college?: string;
    graduationYear?: number;
    degree?: string;
    phone?: string;
    avatarUrl?: string;
    achievements?: string[];
    projects?: { name: string; tech: string }[];
  };
}

const MyProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editData, setEditData] = useState<any>({});

  // Load user data on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // Get user from localStorage (stored during login)
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        toast({
          title: "Not logged in",
          description: "Please login to view your profile.",
          variant: "destructive",
        });
        navigate('/student-login');
        return;
      }

      const user = JSON.parse(userStr);
      
      // Fetch full profile from API
      try {
        const profileData = await apiClient.getProfile(user.id);
        setProfile({
          ...user,
          profile: profileData || user.profile,
        });
        setEditData(profileData || {});
      } catch (profileError) {
        // If profile fetch fails, use stored user data
        console.log('Using cached user data:', user);
        setProfile(user);
        setEditData(user.profile || {});
      }
    } catch (error: any) {
      console.error('Failed to load profile:', error?.message);
      toast({
        title: "Error",
        description: "Failed to load profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      await apiClient.updateProfile(profile.id, editData);
      
      // Update local storage
      const updatedProfile = { ...profile, profile: editData };
      localStorage.setItem('user', JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      setEditing(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error: any) {
      console.error('Failed to save profile:', error?.message);
      toast({
        title: "Save Failed",
        description: error?.message || "Failed to save profile changes.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Get display values
  const getDisplayName = () => {
    if (!profile) return 'User';
    return `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'User';
  };

  const getInitials = () => {
    if (!profile) return 'U';
    return `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const getAvatarUrl = () => {
    if (profile?.profile?.avatarUrl) return profile.profile.avatarUrl;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${getDisplayName()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-foreground/70">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="container mx-auto px-6">
          <Card className="max-w-md mx-auto p-8 text-center">
            <p className="text-foreground/70 mb-4">Unable to load profile</p>
            <Button onClick={() => navigate('/student-login')}>Go to Login</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/student-portal')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Portal
        </Button>

        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="glass-effect p-8 mb-6 border border-primary/20">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <Avatar className="h-32 w-32 ring-4 ring-primary/20">
                <AvatarImage src={getAvatarUrl()} alt={getDisplayName()} className="object-cover" />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2 hero-text">{getDisplayName()}</h1>
                <p className="text-lg text-foreground/70 mb-2">
                  {profile.profile?.degree || profile.profile?.headline || 'Student'}
                </p>
                <p className="text-foreground/60 mb-4">
                  {profile.profile?.graduationYear ? `Class of ${profile.profile.graduationYear}` : profile.role}
                </p>
                
                <div className="flex flex-wrap gap-4 text-sm text-foreground/60">
                  {profile.profile?.college && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      {profile.profile.college}
                    </div>
                  )}
                  {profile.profile?.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {profile.profile.location}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {profile.email}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {editing ? (
                  <>
                    <Button variant="hero" onClick={handleSave} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => { setEditing(false); setEditData(profile.profile || {}); }}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="hero" onClick={() => setEditing(true)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/student/messages')}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Messages
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Bio */}
          <Card className="glass-effect p-6 mb-6 border border-border/30">
            <h2 className="text-xl font-semibold mb-3 text-foreground">About</h2>
            {editing ? (
              <Textarea
                value={editData.bio || ''}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                placeholder="Write something about yourself..."
                className="min-h-[100px]"
              />
            ) : (
              <p className="text-foreground/70 leading-relaxed">
                {profile.profile?.bio || 'No bio added yet. Click Edit Profile to add one.'}
              </p>
            )}
          </Card>

          {/* Skills */}
          <Card className="glass-effect p-6 mb-6 border border-border/30">
            <h2 className="text-xl font-semibold mb-3 text-foreground">Skills</h2>
            {editing ? (
              <div className="space-y-2">
                <Input
                  value={editData.skills?.join(', ') || ''}
                  onChange={(e) => setEditData({ 
                    ...editData, 
                    skills: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)
                  })}
                  placeholder="Enter skills separated by commas (e.g., Python, JavaScript, React)"
                />
                <p className="text-xs text-foreground/50">Separate skills with commas</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.profile?.skills && profile.profile.skills.length > 0 ? (
                  profile.profile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-foreground/50">No skills added yet</p>
                )}
              </div>
            )}
          </Card>

          {/* Education/College Info */}
          {editing && (
            <Card className="glass-effect p-6 mb-6 border border-border/30">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Education Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>College</Label>
                  <Input
                    value={editData.college || ''}
                    onChange={(e) => setEditData({ ...editData, college: e.target.value })}
                    placeholder="Your college name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Degree</Label>
                  <Input
                    value={editData.degree || ''}
                    onChange={(e) => setEditData({ ...editData, degree: e.target.value })}
                    placeholder="e.g., B.Tech Computer Science"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={editData.location || ''}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                    placeholder="City, State"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Graduation Year</Label>
                  <Input
                    type="number"
                    value={editData.graduationYear || ''}
                    onChange={(e) => setEditData({ ...editData, graduationYear: parseInt(e.target.value) || '' })}
                    placeholder="2025"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Messages Preview */}
          <MessagePreview userType="student" />
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
