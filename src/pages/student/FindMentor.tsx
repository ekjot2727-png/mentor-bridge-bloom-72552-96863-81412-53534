import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Star, MapPin, Briefcase, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const FindMentor = () => {
  const navigate = useNavigate();

  // Mock mentors with match scores
  const mentors = [
    {
      name: "Dr. Priya Sharma",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
      role: "Senior ML Engineer",
      company: "Google",
      location: "Bangalore, India",
      expertise: ["Machine Learning", "Deep Learning", "Python", "TensorFlow"],
      matchScore: 95,
      college: "IIT Bombay",
      graduationYear: "2015",
      mentees: 12,
      bio: "10+ years experience in AI/ML. Passionate about mentoring aspiring ML engineers."
    },
    {
      name: "Amit Patel",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit",
      role: "Tech Lead",
      company: "Microsoft",
      location: "Hyderabad, India",
      expertise: ["React", "Node.js", "System Design", "Cloud Architecture"],
      matchScore: 90,
      college: "JECRC Foundation",
      graduationYear: "2016",
      mentees: 15,
      bio: "Full-stack expert helping students build production-ready applications."
    },
    {
      name: "Neha Gupta",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha",
      role: "Data Science Manager",
      company: "Amazon",
      location: "Mumbai, India",
      expertise: ["Data Science", "Analytics", "Python", "SQL", "Tableau"],
      matchScore: 87,
      college: "IIT Madras",
      graduationYear: "2014",
      mentees: 18,
      bio: "Leading data science teams and mentoring future data scientists."
    },
    {
      name: "Rahul Verma",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
      role: "Senior Software Engineer",
      company: "Flipkart",
      location: "Bangalore, India",
      expertise: ["Java", "Spring Boot", "Microservices", "AWS"],
      matchScore: 82,
      college: "JECRC University",
      graduationYear: "2017",
      mentees: 10,
      bio: "Backend specialist with focus on scalable system architecture."
    }
  ];

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

          <div className="grid md:grid-cols-2 gap-6">
            {mentors.map((mentor, index) => (
              <Card key={index} className="glass-effect p-6 border border-primary/20 hover:border-primary/40 transition-all">
                <div className="flex gap-4 mb-4">
                  <img 
                    src={mentor.avatar} 
                    alt={mentor.name}
                    className="w-20 h-20 rounded-full ring-2 ring-primary/30"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">{mentor.name}</h3>
                        <p className="text-sm text-foreground/70">{mentor.role} at {mentor.company}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-primary mb-1">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="font-bold">{mentor.matchScore}%</span>
                        </div>
                        <p className="text-xs text-foreground/60">Match</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-foreground/60 mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {mentor.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" />
                        {mentor.college}, {mentor.graduationYear}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-foreground/70 mb-4">{mentor.bio}</p>

                <div className="mb-4">
                  <p className="text-sm font-medium text-foreground/80 mb-2">Expertise:</p>
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/30">
                  <div className="text-sm text-foreground/70">
                    <span className="font-semibold text-foreground">{mentor.mentees}</span> current mentees
                  </div>
                  <Button size="sm" variant="hero">Request Mentorship</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindMentor;
