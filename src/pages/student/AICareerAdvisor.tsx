// @ts-nocheck
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Users, Target, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AICareerAdvisor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [careerPaths, setCareerPaths] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [mutualConnections, setMutualConnections] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchStudentProfile();
    fetchMentors();
  }, []);

  const getCareerPathsForBranch = (branch: string, skills: string[] = []) => {
    const careerData: Record<string, any[]> = {
      'Computer Science': [
        { title: 'Software Engineer', description: 'Design and develop software applications', match: 95, growth: 'High', salary: '$80k-$150k', industryOutlook: 'Strong growth with increasing demand for software solutions' },
        { title: 'Data Scientist', description: 'Analyze complex data to drive business decisions', match: 85, growth: 'Very High', salary: '$90k-$160k', industryOutlook: 'Explosive growth in AI and analytics fields' },
        { title: 'Full Stack Developer', description: 'Build complete web applications', match: 90, growth: 'High', salary: '$75k-$140k', industryOutlook: 'Consistent demand across industries' },
      ],
      'Mechanical Engineering': [
        { title: 'Mechanical Design Engineer', description: 'Design mechanical systems and components', match: 92, growth: 'Moderate', salary: '$65k-$120k', industryOutlook: 'Steady growth in manufacturing sector' },
        { title: 'Automotive Engineer', description: 'Design and test automotive systems', match: 88, growth: 'Moderate', salary: '$70k-$130k', industryOutlook: 'Growing with EV revolution' },
        { title: 'Product Development Engineer', description: 'Create new products from concept to production', match: 85, growth: 'Moderate', salary: '$68k-$125k', industryOutlook: 'Stable with innovation focus' },
      ],
      'Electrical Engineering': [
        { title: 'Electronics Engineer', description: 'Design electronic circuits and systems', match: 90, growth: 'High', salary: '$72k-$135k', industryOutlook: 'Strong growth in tech sector' },
        { title: 'Power Systems Engineer', description: 'Work on electrical power generation and distribution', match: 87, growth: 'Moderate', salary: '$70k-$128k', industryOutlook: 'Growing with renewable energy' },
        { title: 'Embedded Systems Engineer', description: 'Develop software for hardware devices', match: 92, growth: 'High', salary: '$75k-$140k', industryOutlook: 'High demand in IoT sector' },
      ],
    };

    return careerData[branch] || [
      { title: 'Project Manager', description: 'Lead and coordinate projects', match: 80, growth: 'Moderate', salary: '$70k-$130k', industryOutlook: 'Steady demand across sectors' },
      { title: 'Technical Consultant', description: 'Provide technical expertise to clients', match: 75, growth: 'Moderate', salary: '$68k-$125k', industryOutlook: 'Growing consulting market' },
      { title: 'Research Engineer', description: 'Conduct research and development', match: 85, growth: 'Moderate', salary: '$65k-$120k', industryOutlook: 'Stable in R&D sectors' },
    ];
  };

  const fetchStudentProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // @ts-ignore
      const { data: profile } = await supabase
        .from('student_profiles')
        .select('*, profiles(*)')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setStudentProfile(profile);
        const paths = getCareerPathsForBranch(profile.branch || '', profile.skills || []);
        setCareerPaths(paths);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMentors = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // @ts-ignore
    const { data: alumniProfiles } = await supabase
      .from('alumni_profiles')
      .select(`
        *,
        profiles(*)
      `)
      .eq('availability_for_mentorship', true)
      .limit(3);

    setMentors(alumniProfiles || []);

    // Fetch mutual connections
    const connections: Record<string, number> = {};
    for (const mentor of alumniProfiles || []) {
      // @ts-ignore
      const { count } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .eq('alumni_id', mentor.user_id)
        .eq('status', 'accepted');
      
      connections[mentor.user_id] = count || 0;
    }
    setMutualConnections(connections);
  };

  const connectWithMentor = async (mentorId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // @ts-ignore
    const { error } = await supabase
      .from('connections')
      .insert({
        student_id: user.id,
        alumni_id: mentorId,
        status: 'pending'
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Connection request sent!",
      });
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

        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 glass-effect px-6 py-3 rounded-full mb-4 border border-primary/20">
              <Briefcase className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Profile-Based Career Guidance</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 hero-text">Career Path Advisor</h1>
            <p className="text-lg text-foreground/70">Personalized recommendations based on your profile</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="animate-pulse text-foreground/50">Loading your career recommendations...</div>
            </div>
          ) : (
            <>
              {/* Student Profile Summary */}
              {studentProfile && (
                <Card className="glass-effect p-6 mb-8 border border-accent/20 bg-accent/5">
                  <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                    <Target className="h-6 w-6 text-accent" />
                    <span className="hero-text">Your Profile</span>
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-foreground/60 mb-1">Branch</p>
                      <p className="text-foreground font-medium">{studentProfile.branch || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground/60 mb-1">Semester</p>
                      <p className="text-foreground font-medium">{studentProfile.semester || 'Not specified'}</p>
                    </div>
                    {studentProfile.skills && studentProfile.skills.length > 0 && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-foreground/60 mb-2">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {studentProfile.skills.map((skill: string, idx: number) => (
                            <Badge key={idx} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {studentProfile.career_goals && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-foreground/60 mb-1">Career Goals</p>
                        <p className="text-foreground">{studentProfile.career_goals}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Top Career Matches */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground flex items-center gap-2">
                  <Target className="h-6 w-6 text-primary" />
                  Recommended Career Paths
                </h2>
                <div className="grid gap-6">
                  {careerPaths.map((career: any, index: number) => (
                    <Card key={index} className="glass-effect p-6 border border-primary/20 hover:border-primary/40 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-foreground mb-2">{career.title}</h3>
                          <p className="text-foreground/70 mb-3">{career.description}</p>
                          {career.industryOutlook && (
                            <div className="mt-3 p-3 rounded-lg bg-background/50">
                              <p className="text-sm font-medium text-foreground mb-1">Industry Outlook</p>
                              <p className="text-sm text-foreground/60">{career.industryOutlook}</p>
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-3xl font-bold text-primary mb-1">{career.match}%</div>
                          <p className="text-xs text-foreground/60">Match Score</p>
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-accent" />
                          <span className="text-foreground/70">Growth: {career.growth}</span>
                        </div>
                        <div className="text-foreground/70">Salary: {career.salary}</div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Recommended Alumni Mentors */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground flex items-center gap-2">
                  <Users className="h-6 w-6 text-accent" />
                  Connect with Alumni Mentors
                </h2>
                {mentors.length > 0 ? (
                  <div className="grid md:grid-cols-3 gap-6">
                    {mentors.map((mentor, index) => (
                      <Card key={index} className="glass-effect p-6 border border-accent/20 hover:border-accent/40 transition-all text-center">
                        <img 
                          src={mentor.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.profiles?.full_name}`} 
                          alt={mentor.profiles?.full_name}
                          className="w-20 h-20 rounded-full mx-auto mb-4 ring-2 ring-accent/30"
                        />
                        <h3 className="font-semibold text-foreground mb-1">{mentor.profiles?.full_name}</h3>
                        <p className="text-sm text-foreground/70 mb-2">{mentor.position} at {mentor.company}</p>
                        <p className="text-xs text-foreground/60 mb-3">{mentor.expertise?.join(', ')}</p>
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <Users className="h-4 w-4 text-accent" />
                          <span className="text-sm text-foreground/60">{mutualConnections[mentor.user_id] || 0} connections</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => connectWithMentor(mentor.user_id)}
                        >
                          Connect
                        </Button>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="glass-effect p-8 text-center border border-border/30">
                    <p className="text-foreground/60">No mentors available at the moment. Check back later!</p>
                  </Card>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AICareerAdvisor;
