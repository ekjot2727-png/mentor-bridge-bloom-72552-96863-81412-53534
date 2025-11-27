import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Briefcase, GraduationCap, Mail, Phone, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import profileImage from "@/assets/ekjot-profile.jpg";
import MessagePreview from "@/components/MessagePreview";

const MyProfile = () => {
  const navigate = useNavigate();

  // Ekjot Singh's profile data
  const profile = {
    name: "Ekjot Singh",
    avatar: profileImage,
    email: "ekjot.singh@jecrc.edu",
    phone: "+91 98765 43210",
    college: "JECRC Foundation",
    degree: "B.Tech Computer Science Engineering",
    year: "Current Student",
    location: "Jaipur, Rajasthan",
    skills: ["Programming", "Web Development", "Data Structures", "Problem Solving", "Team Collaboration"],
    interests: ["Technology", "Innovation", "Software Development"],
    bio: "Computer Science Engineering student at JECRC Foundation, passionate about technology and innovation. Eager to connect with alumni and industry professionals for mentorship and career guidance.",
    achievements: [
      "Active participant in college technical events",
      "Strong academic performance",
      "Team player and quick learner"
    ],
    projects: [
      { name: "Alumni Connect Platform", tech: "React, TypeScript, NestJS" },
      { name: "Academic Management System", tech: "Node.js, MongoDB" }
    ]
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

        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="glass-effect p-8 mb-6 border border-primary/20">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <Avatar className="h-32 w-32 ring-4 ring-primary/20">
                <AvatarImage src={profile.avatar} alt={profile.name} className="object-cover" />
                <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2 hero-text">{profile.name}</h1>
                <p className="text-lg text-foreground/70 mb-2">{profile.degree}</p>
                <p className="text-foreground/60 mb-4">{profile.year}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-foreground/60">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    {profile.college}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {profile.email}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="hero">Edit Profile</Button>
                <Button variant="outline" onClick={() => navigate('/student/messages')}>
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

          {/* Skills */}
          <Card className="glass-effect p-6 mb-6 border border-border/30">
            <h2 className="text-xl font-semibold mb-3 text-foreground">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {skill}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Projects */}
          <Card className="glass-effect p-6 mb-6 border border-border/30">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Projects</h2>
            <div className="space-y-3">
              {profile.projects.map((project, index) => (
                <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                  <div>
                    <p className="font-medium text-foreground">{project.name}</p>
                    <p className="text-sm text-foreground/60">{project.tech}</p>
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
                  <span className="text-primary mt-1">•</span>
                  {achievement}
                </li>
              ))}
            </ul>
          </Card>

          {/* Messages Preview */}
          <MessagePreview userType="student" />
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
