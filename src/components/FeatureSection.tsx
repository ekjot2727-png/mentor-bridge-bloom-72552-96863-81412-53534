import { Button } from "./ui/button";
import { 
  Users, 
  GraduationCap, 
  MessageCircle, 
  Calendar, 
  Trophy, 
  Heart,
  ArrowRight,
  Sparkles 
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Meaningful Connections",
    description: "Connect with alumni who share your interests, career goals, and passions. Build lasting professional relationships.",
    color: "text-primary"
  },
  {
    icon: GraduationCap,
    title: "Mentorship Programs",
    description: "Get paired with experienced alumni mentors who can guide your career journey and personal growth.",
    color: "text-accent"
  },
  {
    icon: MessageCircle,
    title: "Community Discussions",
    description: "Join vibrant discussions, share insights, and learn from both students and alumni experiences.",
    color: "text-secondary"
  },
  {
    icon: Calendar,
    title: "Networking Events",
    description: "Attend exclusive events, workshops, and seminars designed to foster meaningful connections.",
    color: "text-primary"
  },
  {
    icon: Trophy,
    title: "Career Opportunities",
    description: "Discover job openings, internships, and career opportunities shared by our alumni network.",
    color: "text-accent"
  },
  {
    icon: Heart,
    title: "Alumni Giving Back",
    description: "Alumni share knowledge, resources, and opportunities to help the next generation succeed.",
    color: "text-secondary"
  }
];

const FeatureSection = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16 fade-in-up">
          <div className="inline-flex items-center gap-2 glass-effect px-6 py-3 rounded-full mb-6 border border-accent/20">
            <Sparkles className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium text-foreground/90">
              Platform Benefits
            </span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6 hero-text">
            Why Choose AlumniConnect?
          </h2>
          
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Our platform creates a unique ecosystem where students and alumni benefit equally, 
            fostering growth, mentorship, and lifelong connections.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="glass-effect p-8 rounded-2xl border border-border/30 hover:border-primary/30 transition-all duration-300 group hover:scale-105"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <feature.icon className={`h-8 w-8 ${feature.color} group-hover:scale-110 transition-transform`} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-foreground/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="glass-effect p-12 rounded-3xl border border-primary/20 max-w-4xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Ready to Start Building Connections?
            </h3>
            <p className="text-xl text-foreground/70 mb-8 max-w-2xl mx-auto">
              Join thousands of students and alumni who are already making meaningful connections 
              and advancing their careers together.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="lg" className="text-lg px-8 py-4 h-auto group">
                Join as Student
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="connection" size="lg" className="text-lg px-8 py-4 h-auto">
                Join as Alumni
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;