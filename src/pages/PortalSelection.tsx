import { Button } from "@/components/ui/button";
import { GraduationCap, Users, ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PortalSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="container mx-auto px-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 hero-text">
            Choose Your Portal
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Select the portal that best describes you to get started with meaningful connections.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {/* Student Portal */}
          <div className="glass-effect p-12 rounded-3xl border border-primary/20 text-center group hover:scale-105 transition-all duration-300">
            <div className="mb-8">
              <GraduationCap className="h-24 w-24 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4 text-foreground">
                Student Portal
              </h2>
              <p className="text-foreground/70 mb-8 leading-relaxed">
                Connect with alumni mentors, explore career opportunities, and access resources to accelerate your academic and professional journey.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <Button 
                variant="hero" 
                size="lg" 
                className="text-lg px-8 py-4 h-auto w-full group"
                onClick={() => navigate('/student-registration')}
              >
                Sign Up
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="glass" 
                size="lg" 
                className="text-lg px-8 py-4 h-auto w-full"
                onClick={() => navigate('/student-login')}
              >
                Login
              </Button>
            </div>
          </div>

          {/* Alumni Portal */}
          <div className="glass-effect p-12 rounded-3xl border border-accent/20 text-center group hover:scale-105 transition-all duration-300">
            <div className="mb-8">
              <Users className="h-24 w-24 text-accent mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4 text-foreground">
                Alumni Portal
              </h2>
              <p className="text-foreground/70 mb-8 leading-relaxed">
                Give back to your community by mentoring students, sharing opportunities, and building lasting professional relationships.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <Button 
                variant="connection" 
                size="lg" 
                className="text-lg px-8 py-4 h-auto w-full group"
                onClick={() => navigate('/alumni-registration')}
              >
                Sign Up
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="glass" 
                size="lg" 
                className="text-lg px-8 py-4 h-auto w-full"
                onClick={() => navigate('/alumni-login')}
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalSelection;