import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Briefcase, GraduationCap, Mail, Phone, Users, Link as LinkIcon, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MessagePreview from "@/components/MessagePreview";

const UpdateProfile = () => {
  const navigate = useNavigate();

  // Mock alumni profile data with connections
  const profile = {
    name: "Dr. Priya Sharma",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaAlumni",
    email: "priya.sharma@google.com",
    phone: "+91 98765 12345",
    college: "JECRC Foundation",
    degree: "B.Tech Computer Science",
    graduationYear: "2015",
    currentRole: "Senior ML Engineer",
    company: "Google",
    location: "Bangalore, India",
    connections: 487,
    skills: ["Machine Learning", "Deep Learning", "Python", "TensorFlow", "AI Research"],
    expertise: ["Artificial Intelligence", "Computer Vision", "Natural Language Processing"],
    bio: "Passionate about AI/ML with 10+ years of experience. Love mentoring students and helping them navigate their career paths. Open to collaboration on innovative AI projects.",
    achievements: [
      "Led development of Google's new ML feature",
      "Published 15+ research papers",
      "Speaker at major tech conferences",
      "Mentor to 50+ students"
    ],
    experience: [
      { company: "Google", role: "Senior ML Engineer", duration: "2020 - Present" },
      { company: "Microsoft", role: "ML Engineer", duration: "2017 - 2020" },
      { company: "Amazon", role: "Software Engineer", duration: "2015 - 2017" }
    ],
    mentoring: {
      available: true,
      areas: ["Career Guidance", "Technical Skills", "Interview Prep"],
      mentees: 12
    }
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

        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="glass-effect p-8 mb-6 border border-accent/20">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <Avatar className="h-32 w-32 ring-4 ring-accent/20">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2 hero-text">{profile.name}</h1>
                <p className="text-lg text-foreground/70 mb-2">{profile.currentRole} at {profile.company}</p>
                <p className="text-foreground/60 mb-4">{profile.degree} • Class of {profile.graduationYear}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-foreground/60">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {profile.connections} connections
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {profile.email}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="hero">Edit Profile</Button>
                <Button variant="outline" onClick={() => navigate('/alumni/messages')}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </Button>
              </div>
            </div>
          </Card>

          {/* Bio */}
          <Card className="glass-effect p-6 mb-6 border border-border/30">
            <h2 className="text-xl font-semibold mb-3 text-foreground">About</h2>
            <p className="text-foreground/70 leading-relaxed">{profile.bio}</p>
          </Card>

          {/* Mentoring Status */}
          <Card className="glass-effect p-6 mb-6 border border-accent/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Mentoring Status</h2>
              <Badge variant={profile.mentoring.available ? "default" : "secondary"}>
                {profile.mentoring.available ? "Available for Mentoring" : "Not Available"}
              </Badge>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-foreground/70 mb-2">Mentoring Areas:</p>
                <div className="flex flex-wrap gap-2">
                  {profile.mentoring.areas.map((area, index) => (
                    <Badge key={index} variant="outline">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-foreground/70 mb-2">Current Mentees:</p>
                <p className="text-2xl font-bold text-accent">{profile.mentoring.mentees}</p>
              </div>
            </div>
          </Card>

          {/* Skills & Expertise */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card className="glass-effect p-6 border border-border/30">
              <h2 className="text-xl font-semibold mb-3 text-foreground">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>

            <Card className="glass-effect p-6 border border-border/30">
              <h2 className="text-xl font-semibold mb-3 text-foreground">Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {profile.expertise.map((exp, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {exp}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>

          {/* Experience */}
          <Card className="glass-effect p-6 mb-6 border border-border/30">
            <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Experience
            </h2>
            <div className="space-y-4">
              {profile.experience.map((exp, index) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-lg bg-background/50">
                  <Briefcase className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold text-foreground">{exp.role}</p>
                    <p className="text-foreground/70">{exp.company}</p>
                    <p className="text-sm text-foreground/60">{exp.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Achievements */}
          <Card className="glass-effect p-6 mb-6 border border-border/30">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Achievements</h2>
            <ul className="space-y-2">
              {profile.achievements.map((achievement, index) => (
                <li key={index} className="flex items-start gap-2 text-foreground/70">
                  <span className="text-accent mt-1">•</span>
                  {achievement}
                </li>
              ))}
            </ul>
          </Card>

          {/* Messages Preview */}
          <MessagePreview userType="alumni" />
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
