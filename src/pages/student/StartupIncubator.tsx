import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Rocket, Users, DollarSign, TrendingUp, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const StartupIncubator = () => {
  const navigate = useNavigate();

  // Mock startup data
  const startups = [
    {
      name: "EduTech Solutions",
      founder: "Priya Sharma",
      stage: "Seed",
      funding: "₹50 Lakhs",
      sector: "EdTech",
      description: "AI-powered personalized learning platform for students",
      team: 5,
      growth: "+120%",
      looking: ["Co-founder", "Full Stack Developer"],
      logo: "🎓"
    },
    {
      name: "HealthCare Connect",
      founder: "Amit Kumar",
      stage: "Pre-Seed",
      funding: "₹25 Lakhs",
      sector: "HealthTech",
      description: "Telemedicine platform connecting patients with doctors",
      team: 4,
      growth: "+80%",
      looking: ["Mobile Developer", "Healthcare Expert"],
      logo: "🏥"
    },
    {
      name: "AgriTech Innovations",
      founder: "Neha Patel",
      stage: "Seed",
      funding: "₹75 Lakhs",
      sector: "AgriTech",
      description: "Smart farming solutions using IoT and AI",
      team: 6,
      growth: "+150%",
      looking: ["IoT Engineer", "Data Scientist"],
      logo: "🌾"
    },
    {
      name: "FinFlow",
      founder: "Rahul Verma",
      stage: "Series A",
      funding: "₹2 Crores",
      sector: "FinTech",
      description: "Digital banking platform for millennials and Gen-Z",
      team: 12,
      growth: "+200%",
      looking: ["Backend Engineer", "Product Manager"],
      logo: "💰"
    },
    {
      name: "EcoCart",
      founder: "Sneha Reddy",
      stage: "Pre-Seed",
      funding: "₹30 Lakhs",
      sector: "E-Commerce",
      description: "Sustainable e-commerce marketplace for eco-friendly products",
      team: 3,
      growth: "+60%",
      looking: ["Frontend Developer", "Marketing Lead"],
      logo: "🛒"
    },
    {
      name: "CodeMentor AI",
      founder: "Vikram Singh",
      stage: "Seed",
      funding: "₹60 Lakhs",
      sector: "EdTech",
      description: "AI coding mentor for programming students",
      team: 7,
      growth: "+140%",
      looking: ["ML Engineer", "UX Designer"],
      logo: "💻"
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
            <div className="inline-flex items-center gap-2 glass-effect px-6 py-3 rounded-full mb-4 border border-primary/20">
              <Rocket className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Launch Your Idea</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 hero-text">Startup Incubator</h1>
            <p className="text-lg text-foreground/70">Explore student startups and launch your entrepreneurial journey</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {startups.map((startup, index) => (
              <Card key={index} className="glass-effect p-6 border border-primary/20 hover:border-primary/40 transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-4xl">{startup.logo}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">{startup.name}</h3>
                        <p className="text-sm text-foreground/70">Founded by {startup.founder}</p>
                      </div>
                      <Badge variant="secondary">{startup.stage}</Badge>
                    </div>
                  </div>
                </div>

                <p className="text-foreground/70 mb-4">{startup.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4 p-4 rounded-lg bg-background/50">
                  <div>
                    <div className="flex items-center gap-1 text-sm text-foreground/60 mb-1">
                      <DollarSign className="h-4 w-4" />
                      Funding
                    </div>
                    <p className="font-semibold text-foreground">{startup.funding}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-sm text-foreground/60 mb-1">
                      <TrendingUp className="h-4 w-4" />
                      Growth
                    </div>
                    <p className="font-semibold text-accent">{startup.growth}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-sm text-foreground/60 mb-1">
                      <Users className="h-4 w-4" />
                      Team Size
                    </div>
                    <p className="font-semibold text-foreground">{startup.team} members</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-sm text-foreground/60 mb-1">
                      <Building2 className="h-4 w-4" />
                      Sector
                    </div>
                    <p className="font-semibold text-foreground">{startup.sector}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-foreground/80 mb-2">Looking for:</p>
                  <div className="flex flex-wrap gap-2">
                    {startup.looking.map((role, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="hero" className="flex-1">Join Team</Button>
                  <Button size="sm" variant="outline" className="flex-1">Learn More</Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button variant="hero" size="lg">
              <Rocket className="h-5 w-5 mr-2" />
              Submit Your Startup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartupIncubator;
