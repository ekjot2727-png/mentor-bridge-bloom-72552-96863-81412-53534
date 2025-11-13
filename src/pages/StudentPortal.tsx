import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  Briefcase, 
  Users, 
  Lightbulb, 
  Award, 
  Rocket, 
  Trophy, 
  GraduationCap,
  BookOpen,
  ArrowLeft,
  MapPin,
  Building,
  MessageSquare
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const modules = [
  {
    icon: User,
    title: "My Profile",
    description: "Manage your personal information and preferences",
    color: "text-primary",
    path: "/student/profile"
  },
  {
    icon: Briefcase,
    title: "AI Career Advisor",
    description: "Get personalized career guidance and recommendations",
    color: "text-accent",
    path: "/student/career-advisor"
  },
  {
    icon: Users,
    title: "Find a Mentor",
    description: "Connect with experienced alumni mentors",
    color: "text-secondary",
    path: "/student/mentors"
  },
  {
    icon: Lightbulb,
    title: "Jen Hub",
    description: "Collaborate and innovate with fellow students",
    color: "text-secondary",
    path: "/student/jen-hub"
  },
  {
    icon: Award,
    title: "My Credentials",
    description: "Track your achievements and certifications",
    color: "text-accent",
    path: "/student/credentials"
  },
  {
    icon: Rocket,
    title: "Startup Incubator",
    description: "Launch your entrepreneurial ideas",
    color: "text-secondary",
    path: "/student/incubator"
  },
  {
    icon: Trophy,
    title: "Leaderboard",
    description: "See top performers and track your progress",
    color: "text-primary",
    path: "/student/leaderboard"
  },
  {
    icon: GraduationCap,
    title: "Find Alumni",
    description: "Discover and connect with alumni network",
    color: "text-accent",
    path: "/student/alumni"
  },
  {
    icon: BookOpen,
    title: "My Academics",
    description: "Manage your academic records and progress",
    color: "text-secondary",
    path: "/student/academics"
  },
  {
    icon: MessageSquare,
    title: "Messages",
    description: "Chat with alumni and mentors",
    color: "text-primary",
    path: "/student/messages"
  }
];

const featuredAlumni = [
  {
    name: "Sarah Johnson",
    initials: "SJ",
    position: "Senior Software Engineer",
    company: "Google",
    location: "San Francisco, CA",
    graduationYear: "2018",
    expertise: ["Software Development", "Cloud Computing", "AI/ML"],
    color: "bg-primary"
  },
  {
    name: "Michael Chen",
    initials: "MC",
    position: "Product Manager",
    company: "Microsoft",
    location: "Seattle, WA",
    graduationYear: "2017",
    expertise: ["Product Strategy", "Agile", "UX Design"],
    color: "bg-accent"
  },
  {
    name: "Priya Patel",
    initials: "PP",
    position: "Data Scientist",
    company: "Amazon",
    location: "Austin, TX",
    graduationYear: "2019",
    expertise: ["Machine Learning", "Data Analytics", "Python"],
    color: "bg-secondary"
  },
  {
    name: "David Martinez",
    initials: "DM",
    position: "Startup Founder",
    company: "TechVenture Inc.",
    location: "New York, NY",
    graduationYear: "2016",
    expertise: ["Entrepreneurship", "Business Strategy", "Fundraising"],
    color: "bg-primary"
  },
  {
    name: "Emily Thompson",
    initials: "ET",
    position: "Marketing Director",
    company: "Adobe",
    location: "San Jose, CA",
    graduationYear: "2018",
    expertise: ["Digital Marketing", "Brand Strategy", "Content Creation"],
    color: "bg-accent"
  },
  {
    name: "Raj Sharma",
    initials: "RS",
    position: "Financial Analyst",
    company: "Goldman Sachs",
    location: "New York, NY",
    graduationYear: "2017",
    expertise: ["Investment Banking", "Financial Modeling", "Market Analysis"],
    color: "bg-secondary"
  }
];

const StudentPortal = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-6 py-12">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 hero-text">
            Student Portal
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Access all the tools and resources you need to succeed in your academic and professional journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((module, index) => (
            <Card 
              key={module.title}
              className="glass-effect p-8 border border-border/30 hover:border-primary/30 transition-all duration-300 group hover:scale-105 cursor-pointer"
              onClick={() => navigate(module.path)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col items-center text-center">
                <module.icon className={`h-12 w-12 ${module.color} mb-4 group-hover:scale-110 transition-transform`} />
                <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {module.title}
                </h3>
                <p className="text-foreground/70 leading-relaxed">
                  {module.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Featured Alumni Section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 hero-text">
              Featured Alumni
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Connect with successful alumni who are ready to mentor and guide you
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredAlumni.map((alumni, index) => (
              <Card 
                key={alumni.name}
                className="glass-effect p-6 border border-border/30 hover:border-accent/30 transition-all duration-300 group hover:scale-105"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className={`${alumni.color} text-white text-lg font-bold`}>
                      {alumni.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
                      {alumni.name}
                    </h3>
                    <p className="text-sm text-foreground/70 mb-2">
                      Class of {alumni.graduationYear}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <span>{alumni.position}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <Building className="h-4 w-4 text-accent" />
                    <span>{alumni.company}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <MapPin className="h-4 w-4 text-secondary" />
                    <span>{alumni.location}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-foreground/60 mb-2">Expertise:</p>
                  <div className="flex flex-wrap gap-2">
                    {alumni.expertise.map((skill) => (
                      <span 
                        key={skill}
                        className="text-xs px-2 py-1 rounded-full glass-effect border border-primary/20 text-foreground/80"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <Button 
                  variant="glass" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate('/student/mentors')}
                >
                  Connect
                </Button>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => navigate('/student/mentors')}
            >
              View All Alumni
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPortal;