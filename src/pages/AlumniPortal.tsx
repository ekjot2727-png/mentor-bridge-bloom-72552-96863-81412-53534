import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  User, 
  Users, 
  Lightbulb, 
  BookOpen, 
  Trophy, 
  BarChart3, 
  Calendar, 
  Heart,
  UserPlus,
  ArrowLeft,
  MessageSquare
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const modules = [
  {
    icon: User,
    title: "Update Profile",
    description: "Keep your professional information current",
    color: "text-primary",
    path: "/alumni/profile"
  },
  {
    icon: Users,
    title: "Mentorship",
    description: "Guide and mentor the next generation",
    color: "text-accent",
    path: "/alumni/mentorship"
  },
  {
    icon: Lightbulb,
    title: "Jen Hub",
    description: "Post jobs and internship opportunities",
    color: "text-secondary",
    path: "/alumni/jen-hub"
  },
  {
    icon: BookOpen,
    title: "Alumni Directory",
    description: "Connect with fellow alumni worldwide",
    color: "text-primary",
    path: "/alumni/directory"
  },
  {
    icon: Trophy,
    title: "Leaderboard",
    description: "See top contributors in the community",
    color: "text-accent",
    path: "/alumni/leaderboard"
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "View alumni demographics and insights",
    color: "text-secondary",
    path: "/alumni/analytics"
  },
  {
    icon: Calendar,
    title: "Events",
    description: "Participate in networking events",
    color: "text-primary",
    path: "/alumni/events"
  },
  {
    icon: Heart,
    title: "Give Back",
    description: "Support students and university initiatives",
    color: "text-accent",
    path: "/alumni/give-back"
  },
  {
    icon: MessageSquare,
    title: "Messages",
    description: "Chat with students and fellow alumni",
    color: "text-primary",
    path: "/alumni/messages"
  }
];

const AlumniPortal = () => {
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
            Alumni Portal
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Make a lasting impact by sharing your expertise and giving back to the community that shaped your success.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((module, index) => (
            <Card 
              key={module.title}
              className="glass-effect p-8 border border-border/30 hover:border-accent/30 transition-all duration-300 group hover:scale-105 cursor-pointer"
              onClick={() => navigate(module.path)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col items-center text-center">
                <module.icon className={`h-12 w-12 ${module.color} mb-4 group-hover:scale-110 transition-transform`} />
                <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-accent transition-colors">
                  {module.title}
                </h3>
                <p className="text-foreground/70 leading-relaxed">
                  {module.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlumniPortal;