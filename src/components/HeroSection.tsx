import { Button } from "./ui/button";
import { Play, ArrowRight, Users, Network, Sparkles } from "lucide-react";
import connectionNetwork from "@/assets/connection-network.png";
import heroBackground from "@/assets/students-alumni-hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBackground} 
          alt="Students and Alumni"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-70"></div>
      </div>


      {/* Hero Content */}
      <div className="relative z-20 container mx-auto px-6">
        <div className="text-center max-w-5xl mx-auto">
          <div className="fade-in-up">
            <div className="inline-flex items-center gap-2 glass-effect px-6 py-3 rounded-full mb-8 border border-primary/20">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground/90">
                Building bridges between generations of learners
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="hero-text">CONNECT & GROW</span>
            </h1>

            {/* Main Heading */}
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-foreground">
              Where Students & Alumni Build Tomorrow Together
            </h2>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-foreground/80 mb-8 font-light leading-relaxed max-w-3xl mx-auto">
              A platform that creates meaningful connections between students and alumni, 
              fostering mentorship, career growth, and lifelong professional relationships.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
              <Button 
                variant="hero" 
                size="lg" 
                className="text-lg px-8 py-4 h-auto group"
                onClick={() => window.location.href = '/portal-selection'}
              >
                <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Start Your Journey
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 text-sm text-foreground/60 mt-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span>10,000+ Students Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
            <span>5,000+ Alumni Mentors</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
            <span>500+ Universities</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;