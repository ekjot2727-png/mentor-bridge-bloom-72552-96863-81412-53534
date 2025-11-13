import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Heart, TrendingUp, Users, Target, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const GiveBack = () => {
  const navigate = useNavigate();

  const fundraisers = [
    {
      title: "Student Scholarship Fund 2025",
      description: "Support deserving students from underprivileged backgrounds to pursue their education dreams.",
      goal: 5000000,
      raised: 3750000,
      donors: 245,
      daysLeft: 45,
      category: "Education",
      impact: "50 students will receive full scholarships"
    },
    {
      title: "New Computer Lab Infrastructure",
      description: "Upgrade computer labs with latest hardware and software to enhance student learning experience.",
      goal: 2000000,
      raised: 1250000,
      donors: 128,
      daysLeft: 30,
      category: "Infrastructure",
      impact: "500+ students will benefit annually"
    },
    {
      title: "Research & Innovation Center",
      description: "Establish a state-of-the-art research center to foster innovation and cutting-edge research.",
      goal: 10000000,
      raised: 4200000,
      donors: 187,
      daysLeft: 90,
      category: "Research",
      impact: "New research opportunities for faculty and students"
    },
    {
      title: "Library Digital Transformation",
      description: "Digitize library resources and provide access to premium online journals and publications.",
      goal: 1500000,
      raised: 980000,
      donors: 95,
      daysLeft: 60,
      category: "Infrastructure",
      impact: "Enhanced learning resources for all students"
    },
    {
      title: "Women in Tech Empowerment",
      description: "Special program to encourage and support women students pursuing technology careers.",
      goal: 3000000,
      raised: 1850000,
      donors: 156,
      daysLeft: 75,
      category: "Education",
      impact: "100+ female students receive mentorship and support"
    },
    {
      title: "Sports Complex Development",
      description: "Build modern sports facilities to promote physical fitness and sports culture.",
      goal: 8000000,
      raised: 3400000,
      donors: 203,
      daysLeft: 120,
      category: "Infrastructure",
      impact: "World-class sports facilities for students"
    }
  ];

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 100000).toFixed(1)}L`;
  };

  const getProgressPercentage = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
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

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 glass-effect px-6 py-3 rounded-full mb-4 border border-accent/20">
              <Heart className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">Make an Impact</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 hero-text">Give Back</h1>
            <p className="text-lg text-foreground/70">Support initiatives that shape the future of education</p>
          </div>

          {/* Impact Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="glass-effect p-6 border border-accent/20 text-center">
              <DollarSign className="h-8 w-8 text-accent mx-auto mb-2" />
              <div className="text-3xl font-bold text-accent mb-2">₹1.5Cr+</div>
              <p className="text-sm text-foreground/70">Total Raised This Year</p>
            </Card>
            <Card className="glass-effect p-6 border border-primary/20 text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-3xl font-bold text-primary mb-2">1,014</div>
              <p className="text-sm text-foreground/70">Active Donors</p>
            </Card>
            <Card className="glass-effect p-6 border border-border/30 text-center">
              <Target className="h-8 w-8 text-foreground mx-auto mb-2" />
              <div className="text-3xl font-bold text-foreground mb-2">6</div>
              <p className="text-sm text-foreground/70">Active Campaigns</p>
            </Card>
          </div>

          {/* Fundraiser Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {fundraisers.map((project, index) => (
              <Card key={index} className="glass-effect p-6 border border-primary/20 hover:border-accent/40 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-foreground">{project.title}</h3>
                  <Badge variant="secondary">{project.category}</Badge>
                </div>

                <p className="text-foreground/70 mb-4">{project.description}</p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground/70">Progress</span>
                    <span className="font-semibold text-accent">
                      {getProgressPercentage(project.raised, project.goal).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-background/50 rounded-full h-3 mb-2">
                    <div 
                      className="bg-gradient-to-r from-accent to-primary rounded-full h-3 transition-all"
                      style={{ width: `${getProgressPercentage(project.raised, project.goal)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-foreground">{formatCurrency(project.raised)} raised</span>
                    <span className="text-foreground/60">of {formatCurrency(project.goal)}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 p-3 rounded-lg bg-background/50">
                  <div>
                    <div className="flex items-center gap-1 text-sm text-foreground/60 mb-1">
                      <Users className="h-4 w-4" />
                      Donors
                    </div>
                    <p className="font-bold text-foreground">{project.donors}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-sm text-foreground/60 mb-1">
                      <TrendingUp className="h-4 w-4" />
                      Days Left
                    </div>
                    <p className="font-bold text-foreground">{project.daysLeft}</p>
                  </div>
                </div>

                {/* Impact */}
                <div className="mb-4 p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-sm font-medium text-accent mb-1">Impact:</p>
                  <p className="text-sm text-foreground/80">{project.impact}</p>
                </div>

                <div className="flex gap-2">
                  <Button variant="hero" className="flex-1">
                    <Heart className="h-4 w-4 mr-2" />
                    Donate Now
                  </Button>
                  <Button variant="outline">Share</Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Why Give Back Section */}
          <Card className="glass-effect p-8 mt-12 border border-border/30 text-center">
            <Heart className="h-16 w-16 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3 text-foreground">Why Your Support Matters</h2>
            <p className="text-foreground/70 max-w-2xl mx-auto mb-6">
              Your contributions directly impact the lives of students, helping them access better education, 
              facilities, and opportunities. Every donation, big or small, creates a lasting legacy and 
              empowers the next generation of leaders.
            </p>
            <Button variant="hero" size="lg">
              View All Campaigns
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GiveBack;
