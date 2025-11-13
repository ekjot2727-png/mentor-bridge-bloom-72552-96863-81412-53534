import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Users, CheckCircle, Clock, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Mentorship = () => {
  const navigate = useNavigate();

  const mentorshipData = {
    isRegistered: true,
    currentMentees: 12,
    maxMentees: 15,
    hoursThisMonth: 24,
    totalStudentsHelped: 45,
    mentees: [
      {
        name: "Rajesh Kumar",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
        year: "3rd Year",
        focus: "Full Stack Development",
        lastSession: "2 days ago",
        progress: 75
      },
      {
        name: "Ananya Das",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
        year: "4th Year",
        focus: "Machine Learning",
        lastSession: "1 week ago",
        progress: 60
      },
      {
        name: "Vikram Singh",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
        year: "2nd Year",
        focus: "Web Development",
        lastSession: "3 days ago",
        progress: 85
      }
    ],
    pendingRequests: [
      {
        name: "Sneha Reddy",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
        year: "3rd Year",
        interests: "Data Science, Python",
        reason: "Looking for guidance in transitioning to data science career"
      },
      {
        name: "Rahul Verma",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul2",
        year: "4th Year",
        interests: "AI/ML, Research",
        reason: "Need help with final year project and research papers"
      }
    ]
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/alumni-portal')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Portal
        </Button>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 hero-text">Mentorship Dashboard</h1>
            <p className="text-lg text-foreground/70">Guide the next generation of professionals</p>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="glass-effect p-6 border border-accent/20 text-center">
              <div className="text-4xl font-bold text-accent mb-2">{mentorshipData.currentMentees}</div>
              <p className="text-sm text-foreground/70">Current Mentees</p>
              <p className="text-xs text-foreground/60 mt-1">of {mentorshipData.maxMentees} max</p>
            </Card>
            <Card className="glass-effect p-6 border border-primary/20 text-center">
              <div className="text-4xl font-bold text-primary mb-2">{mentorshipData.hoursThisMonth}</div>
              <p className="text-sm text-foreground/70">Hours This Month</p>
            </Card>
            <Card className="glass-effect p-6 border border-border/30 text-center">
              <div className="text-4xl font-bold text-foreground mb-2">{mentorshipData.totalStudentsHelped}</div>
              <p className="text-sm text-foreground/70">Total Helped</p>
            </Card>
            <Card className="glass-effect p-6 border border-border/30 text-center">
              <Badge variant={mentorshipData.isRegistered ? "default" : "secondary"} className="text-lg px-4 py-2">
                {mentorshipData.isRegistered ? "Active" : "Inactive"}
              </Badge>
              <p className="text-sm text-foreground/70 mt-2">Status</p>
            </Card>
          </div>

          {/* Registration Card (if not registered) */}
          {!mentorshipData.isRegistered && (
            <Card className="glass-effect p-8 mb-8 border border-accent/20 text-center">
              <Users className="h-16 w-16 text-accent mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-3 text-foreground">Become a Mentor</h2>
              <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
                Share your knowledge and experience with students. Help shape the future of technology by guiding aspiring professionals.
              </p>
              <Button variant="hero" size="lg">
                <UserPlus className="h-5 w-5 mr-2" />
                Register as Mentor
              </Button>
            </Card>
          )}

          {/* Pending Requests */}
          {mentorshipData.pendingRequests.length > 0 && (
            <Card className="glass-effect p-6 mb-8 border border-border/30">
              <h2 className="text-2xl font-semibold mb-4 text-foreground flex items-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                Pending Mentorship Requests ({mentorshipData.pendingRequests.length})
              </h2>
              <div className="space-y-4">
                {mentorshipData.pendingRequests.map((request, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-background/50 border border-border/20">
                    <img 
                      src={request.avatar}
                      alt={request.name}
                      className="w-16 h-16 rounded-full ring-2 ring-primary/30"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">{request.name}</h3>
                          <p className="text-sm text-foreground/70">{request.year} • {request.interests}</p>
                        </div>
                      </div>
                      <p className="text-foreground/70 mb-3">{request.reason}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="hero">Accept</Button>
                        <Button size="sm" variant="outline">Decline</Button>
                        <Button size="sm" variant="ghost">View Profile</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Current Mentees */}
          <Card className="glass-effect p-6 border border-border/30">
            <h2 className="text-2xl font-semibold mb-4 text-foreground flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-accent" />
              Active Mentees
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentorshipData.mentees.map((mentee, index) => (
                <Card key={index} className="glass-effect p-4 border border-border/20 hover:border-accent/30 transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <img 
                      src={mentee.avatar}
                      alt={mentee.name}
                      className="w-12 h-12 rounded-full ring-2 ring-accent/20"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{mentee.name}</h3>
                      <p className="text-sm text-foreground/70">{mentee.year}</p>
                    </div>
                  </div>
                  <div className="mb-3">
                    <p className="text-sm text-foreground/70 mb-1">Focus Area:</p>
                    <Badge variant="secondary" className="text-xs">{mentee.focus}</Badge>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground/70">Progress</span>
                      <span className="text-accent font-semibold">{mentee.progress}%</span>
                    </div>
                    <div className="w-full bg-background/50 rounded-full h-2">
                      <div 
                        className="bg-accent rounded-full h-2 transition-all"
                        style={{ width: `${mentee.progress}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-foreground/60 mb-3">Last session: {mentee.lastSession}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">Message</Button>
                    <Button size="sm" variant="ghost" className="flex-1">Schedule</Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Mentorship;
