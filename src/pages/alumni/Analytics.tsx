import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Users, Briefcase, MapPin, TrendingUp, GraduationCap, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Analytics = () => {
  const navigate = useNavigate();

  const analyticsData = {
    totalAlumni: 8547,
    activeMembers: 3215,
    mentors: 487,
    growth: "+23%",
    byIndustry: [
      { name: "Technology", count: 3245, percentage: 38 },
      { name: "Finance", count: 1709, percentage: 20 },
      { name: "Healthcare", count: 1281, percentage: 15 },
      { name: "Education", count: 1025, percentage: 12 },
      { name: "Engineering", count: 854, percentage: 10 },
      { name: "Others", count: 433, percentage: 5 }
    ],
    byLocation: [
      { city: "Bangalore", count: 2564 },
      { city: "Mumbai", count: 1923 },
      { city: "Delhi NCR", count: 1709 },
      { city: "Hyderabad", count: 1281 },
      { city: "Pune", count: 854 },
      { city: "International", count: 216 }
    ],
    topCompanies: [
      { name: "Google", count: 245, logo: "🔍" },
      { name: "Microsoft", count: 198, logo: "🪟" },
      { name: "Amazon", count: 187, logo: "📦" },
      { name: "TCS", count: 176, logo: "💼" },
      { name: "Infosys", count: 165, logo: "ℹ️" },
      { name: "Wipro", count: 143, logo: "🔷" }
    ],
    graduationYears: [
      { year: "2020-2024", count: 2134 },
      { year: "2015-2019", count: 3421 },
      { year: "2010-2014", count: 1987 },
      { year: "2005-2009", count: 876 },
      { year: "Before 2005", count: 129 }
    ],
    topColleges: [
      { name: "JECRC Foundation", count: 2456 },
      { name: "JECRC University", count: 1987 },
      { name: "IIT Bombay", count: 1234 },
      { name: "IIT Madras", count: 987 },
      { name: "IIT Delhi", count: 876 }
    ]
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

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 hero-text">Alumni Analytics</h1>
            <p className="text-lg text-foreground/70">Community insights and demographics overview</p>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="glass-effect p-6 border border-primary/20 text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-4xl font-bold text-foreground mb-2">{analyticsData.totalAlumni.toLocaleString()}</div>
              <p className="text-sm text-foreground/70">Total Alumni</p>
            </Card>
            <Card className="glass-effect p-6 border border-accent/20 text-center">
              <TrendingUp className="h-8 w-8 text-accent mx-auto mb-2" />
              <div className="text-4xl font-bold text-accent mb-2">{analyticsData.activeMembers.toLocaleString()}</div>
              <p className="text-sm text-foreground/70">Active Members</p>
            </Card>
            <Card className="glass-effect p-6 border border-border/30 text-center">
              <GraduationCap className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-4xl font-bold text-foreground mb-2">{analyticsData.mentors}</div>
              <p className="text-sm text-foreground/70">Active Mentors</p>
            </Card>
            <Card className="glass-effect p-6 border border-border/30 text-center">
              <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-4xl font-bold text-green-500 mb-2">{analyticsData.growth}</div>
              <p className="text-sm text-foreground/70">YoY Growth</p>
            </Card>
          </div>

          {/* Industry Distribution */}
          <Card className="glass-effect p-6 mb-8 border border-border/30">
            <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" />
              Alumni by Industry
            </h2>
            <div className="space-y-4">
              {analyticsData.byIndustry.map((industry, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">{industry.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-foreground/70">{industry.count.toLocaleString()}</span>
                      <Badge variant="secondary">{industry.percentage}%</Badge>
                    </div>
                  </div>
                  <div className="w-full bg-background/50 rounded-full h-2">
                    <div 
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${industry.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Location Distribution */}
            <Card className="glass-effect p-6 border border-border/30">
              <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center gap-2">
                <MapPin className="h-6 w-6 text-accent" />
                Alumni by Location
              </h2>
              <div className="space-y-3">
                {analyticsData.byLocation.map((location, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                    <span className="font-medium text-foreground">{location.city}</span>
                    <span className="text-xl font-bold text-accent">{location.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Companies */}
            <Card className="glass-effect p-6 border border-border/30">
              <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                Top Employers
              </h2>
              <div className="space-y-3">
                {analyticsData.topCompanies.map((company, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{company.logo}</span>
                      <span className="font-medium text-foreground">{company.name}</span>
                    </div>
                    <span className="text-xl font-bold text-primary">{company.count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Graduation Years */}
            <Card className="glass-effect p-6 border border-border/30">
              <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-accent" />
                Alumni by Batch
              </h2>
              <div className="space-y-3">
                {analyticsData.graduationYears.map((batch, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                    <span className="font-medium text-foreground">{batch.year}</span>
                    <span className="text-xl font-bold text-foreground">{batch.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Colleges */}
            <Card className="glass-effect p-6 border border-border/30">
              <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                Alumni by College
              </h2>
              <div className="space-y-3">
                {analyticsData.topColleges.map((college, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                    <span className="font-medium text-foreground">{college.name}</span>
                    <span className="text-xl font-bold text-primary">{college.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
