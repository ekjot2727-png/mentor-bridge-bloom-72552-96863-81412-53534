import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, GraduationCap, Heart, Target, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";

const About = () => {
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
          Back to Home
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 hero-text">
              About AlNet
            </h1>
            <p className="text-xl text-foreground/80 leading-relaxed">
              Building bridges between generations of learners
            </p>
          </div>

          <div className="glass-effect p-8 rounded-3xl border border-primary/20 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">Our Mission</h2>
            <p className="text-foreground/80 leading-relaxed mb-6">
              AlNet is a comprehensive platform designed to create meaningful connections between students and alumni. 
              We believe that the knowledge, experience, and networks of alumni can significantly accelerate the growth 
              and success of current students, while alumni can give back to their community and build lasting professional relationships.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="glass-effect p-6 rounded-2xl border border-primary/20">
              <Target className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3">Our Vision</h3>
              <p className="text-foreground/70 leading-relaxed">
                To become the leading platform that empowers educational institutions to foster lifelong connections 
                between their students and alumni community, creating a thriving ecosystem of mentorship and growth.
              </p>
            </div>

            <div className="glass-effect p-6 rounded-2xl border border-accent/20">
              <Lightbulb className="h-12 w-12 text-accent mb-4" />
              <h3 className="text-xl font-bold mb-3">What We Offer</h3>
              <p className="text-foreground/70 leading-relaxed">
                Our platform provides mentorship programs, career guidance, networking opportunities, skill development 
                resources, and a vibrant community where students and alumni can collaborate and grow together.
              </p>
            </div>
          </div>

          <div className="glass-effect p-8 rounded-3xl border border-secondary/20">
            <h2 className="text-2xl font-bold mb-6 text-secondary">Key Features</h2>
            <div className="grid gap-4">
              <div className="flex items-start gap-4">
                <GraduationCap className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Student Portal</h4>
                  <p className="text-foreground/70 text-sm">
                    Access to AI career advisor, mentor matching, credentials management, and startup incubator programs
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Users className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Alumni Portal</h4>
                  <p className="text-foreground/70 text-sm">
                    Mentorship opportunities, alumni directory, event management, and giving back programs
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Heart className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Community Engagement</h4>
                  <p className="text-foreground/70 text-sm">
                    JenHub for collaboration, leaderboards for gamification, and analytics to track your impact
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => navigate('/portal-selection')}
              className="text-lg px-8 py-4 h-auto"
            >
              Join Our Community
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
