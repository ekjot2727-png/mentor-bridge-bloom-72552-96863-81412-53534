import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Star, MapPin, Briefcase, GraduationCap, Search, Loader2, UserPlus, Check, Clock, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Mentor {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  role?: string;
  profile?: {
    id: string;
    headline?: string;
    bio?: string;
    location?: string;
    skills?: string[];
    college?: string;
    graduationYear?: number;
    company?: string;
    jobTitle?: string;
    avatarUrl?: string;
  };
  connectionStatus?: 'none' | 'pending' | 'accepted' | 'rejected';
  connectionId?: string;
}

const FindMentor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [myConnections, setMyConnections] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  // Fetch alumni and connections data
  useEffect(() => {
    fetchMentors();
    fetchMyConnections();
  }, []);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (searchQuery) filters.search = searchQuery;
      if (skillFilter) filters.skills = skillFilter;
      if (locationFilter) filters.location = locationFilter;

      const response = await apiClient.searchAlumni(filters);
      
      // Handle both array and paginated response
      const alumniList = Array.isArray(response) ? response : (response?.data || response?.items || []);
      setMentors(alumniList);
    } catch (error: any) {
      console.error('Failed to fetch mentors:', error?.message);
      // If API fails, show empty state
      setMentors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyConnections = async () => {
    try {
      const [connections, pending] = await Promise.all([
        apiClient.getConnections().catch(() => []),
        apiClient.getPendingRequests().catch(() => [])
      ]);
      
      const connectionsList = Array.isArray(connections) ? connections : (connections?.data || connections?.items || []);
      const pendingList = Array.isArray(pending) ? pending : (pending?.data || pending?.items || []);
      
      setMyConnections(connectionsList);
      setPendingRequests(pendingList);
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    }
  };

  // Get connection status for a mentor
  const getConnectionStatus = (mentorId: string): { status: 'none' | 'pending' | 'accepted' | 'rejected', connectionId?: string } => {
    // Check accepted connections
    const acceptedConnection = myConnections.find(
      (conn: any) => conn.requesterId === mentorId || conn.receiverId === mentorId
    );
    if (acceptedConnection) {
      return { status: 'accepted', connectionId: acceptedConnection.id };
    }

    // Check pending requests
    const pendingConnection = pendingRequests.find(
      (conn: any) => conn.receiverId === mentorId
    );
    if (pendingConnection) {
      return { status: 'pending', connectionId: pendingConnection.id };
    }

    return { status: 'none' };
  };

  const handleSearch = () => {
    fetchMentors();
  };

  const handleConnect = async (mentorId: string) => {
    setConnectingId(mentorId);
    try {
      await apiClient.sendConnectionRequest(mentorId, "I would like to connect with you as a mentor.");
      
      toast({
        title: "Request Sent!",
        description: "Your mentorship request has been sent successfully.",
      });
      
      // Refresh connections to update status
      await fetchMyConnections();
    } catch (error: any) {
      console.error('Failed to send connection request:', error?.message);
      toast({
        title: "Request Failed",
        description: error?.response?.data?.message || error?.message || "Failed to send connection request.",
        variant: "destructive",
      });
    } finally {
      setConnectingId(null);
    }
  };

  // Generate avatar URL
  const getAvatarUrl = (mentor: Mentor) => {
    if (mentor.profile?.avatarUrl) return mentor.profile.avatarUrl;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.firstName}${mentor.lastName}`;
  };

  // Get display name
  const getDisplayName = (mentor: Mentor) => {
    return `${mentor.firstName || ''} ${mentor.lastName || ''}`.trim() || 'Unknown User';
  };

  // Render connection button based on status
  const renderConnectionButton = (mentor: Mentor) => {
    const { status } = getConnectionStatus(mentor.id);
    const isConnecting = connectingId === mentor.id;

    if (isConnecting) {
      return (
        <Button size="sm" disabled>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Sending...
        </Button>
      );
    }

    switch (status) {
      case 'accepted':
        return (
          <Button size="sm" variant="outline" className="text-green-600 border-green-600" disabled>
            <Check className="h-4 w-4 mr-2" />
            Connected
          </Button>
        );
      case 'pending':
        return (
          <Button size="sm" variant="outline" className="text-yellow-600 border-yellow-600" disabled>
            <Clock className="h-4 w-4 mr-2" />
            Pending
          </Button>
        );
      default:
        return (
          <Button size="sm" variant="hero" onClick={() => handleConnect(mentor.id)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Request Mentorship
          </Button>
        );
    }
  };

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

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 hero-text">Find Your Perfect Mentor</h1>
            <p className="text-lg text-foreground/70">Connect with alumni who match your career interests and skills</p>
          </div>

          {/* Search and Filters */}
          <Card className="glass-effect p-6 mb-8 border border-primary/20">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
                <Input
                  placeholder="Search by name, company, or skills..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Input
                placeholder="Skills (e.g., Python, React)"
                className="w-full md:w-[180px]"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
              />
              <Input
                placeholder="Location"
                className="w-full md:w-[150px]"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </Card>

          {/* Results */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-foreground/70">Finding mentors...</p>
            </div>
          ) : mentors.length === 0 ? (
            <Card className="glass-effect p-12 text-center border border-primary/20">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-foreground/40" />
              <h3 className="text-xl font-semibold mb-2">No Mentors Found</h3>
              <p className="text-foreground/60 mb-4">
                {searchQuery || skillFilter || locationFilter
                  ? "Try adjusting your search filters to find more mentors."
                  : "No alumni mentors are currently available. Please check back later."}
              </p>
              {(searchQuery || skillFilter || locationFilter) && (
                <Button variant="outline" onClick={() => {
                  setSearchQuery("");
                  setSkillFilter("");
                  setLocationFilter("");
                  fetchMentors();
                }}>
                  Clear Filters
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {mentors.map((mentor) => (
                <Card key={mentor.id} className="glass-effect p-6 border border-primary/20 hover:border-primary/40 transition-all">
                  <div className="flex gap-4 mb-4">
                    <img 
                      src={getAvatarUrl(mentor)} 
                      alt={getDisplayName(mentor)}
                      className="w-20 h-20 rounded-full ring-2 ring-primary/30 object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-foreground">{getDisplayName(mentor)}</h3>
                          <p className="text-sm text-foreground/70">
                            {mentor.profile?.jobTitle || mentor.profile?.headline || 'Alumni'}
                            {mentor.profile?.company && ` at ${mentor.profile.company}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-foreground/60 mb-2">
                        {mentor.profile?.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {mentor.profile.location}
                          </div>
                        )}
                        {mentor.profile?.college && (
                          <div className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            {mentor.profile.college}
                            {mentor.profile.graduationYear && `, ${mentor.profile.graduationYear}`}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {mentor.profile?.bio && (
                    <p className="text-sm text-foreground/70 mb-4 line-clamp-2">{mentor.profile.bio}</p>
                  )}

                  {mentor.profile?.skills && mentor.profile.skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-foreground/80 mb-2">Expertise:</p>
                      <div className="flex flex-wrap gap-2">
                        {mentor.profile.skills.slice(0, 5).map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {mentor.profile.skills.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{mentor.profile.skills.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end pt-4 border-t border-border/30">
                    {renderConnectionButton(mentor)}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindMentor;
