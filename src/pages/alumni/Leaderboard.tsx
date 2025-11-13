import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Trophy, Medal, Award, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const AlumniLeaderboard = () => {
  const navigate = useNavigate();

  // Mock alumni leaderboard data
  const topAlumni = [
    {
      rank: 1,
      name: "Dr. Priya Sharma",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaLead",
      points: 15850,
      company: "Google",
      role: "Senior ML Engineer",
      contributions: 78,
      mentees: 25,
      achievements: ["Top Mentor", "Community Champion", "Innovation Leader"]
    },
    {
      rank: 2,
      name: "Amit Patel",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AmitLead",
      points: 14920,
      company: "Microsoft",
      role: "Tech Lead",
      contributions: 65,
      mentees: 20,
      achievements: ["Mentor Excellence", "Top Contributor"]
    },
    {
      rank: 3,
      name: "Neha Gupta",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=NehaLead",
      points: 14210,
      company: "Amazon",
      role: "Data Science Manager",
      contributions: 62,
      mentees: 22,
      achievements: ["Community Leader", "Mentor Pro"]
    },
    {
      rank: 4,
      name: "Rahul Verma",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=RahulLead",
      points: 13590,
      company: "Flipkart",
      role: "Senior Software Engineer",
      contributions: 58,
      mentees: 18,
      achievements: ["Rising Star", "Active Mentor"]
    },
    {
      rank: 5,
      name: "Vikram Singh",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=VikramLead",
      points: 13150,
      company: "CodeMentor AI",
      role: "Founder & CEO",
      contributions: 55,
      mentees: 16,
      achievements: ["Entrepreneur", "Community Hero"]
    },
    {
      rank: 6,
      name: "Sneha Reddy",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SnehaLead",
      points: 12820,
      company: "Zomato",
      role: "Product Manager",
      contributions: 52,
      mentees: 15,
      achievements: ["Top Performer"]
    },
    {
      rank: 7,
      name: "Ananya Das",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AnanyaLead",
      points: 12350,
      company: "Swiggy",
      role: "UX Design Lead",
      contributions: 48,
      mentees: 14,
      achievements: ["Design Champion"]
    },
    {
      rank: 8,
      name: "Karthik Iyer",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=KarthikLead",
      points: 11920,
      company: "PayTM",
      role: "DevOps Engineer",
      contributions: 45,
      mentees: 12,
      achievements: ["Tech Excellence"]
    }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-8 w-8 text-yellow-500 fill-current" />;
      case 2:
        return <Medal className="h-8 w-8 text-gray-400 fill-current" />;
      case 3:
        return <Medal className="h-8 w-8 text-amber-700 fill-current" />;
      default:
        return <div className="text-2xl font-bold text-foreground/50">#{rank}</div>;
    }
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

        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 glass-effect px-6 py-3 rounded-full mb-4 border border-accent/20">
              <Trophy className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">Top Contributors</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 hero-text">Alumni Leaderboard</h1>
            <p className="text-lg text-foreground/70">Recognizing our most impactful alumni mentors and contributors</p>
          </div>

          {/* Top 3 Podium */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {topAlumni.slice(0, 3).map((alumni, index) => (
              <Card 
                key={alumni.rank}
                className={`glass-effect p-6 border text-center ${
                  index === 0 ? 'border-yellow-500/50 md:order-2' :
                  index === 1 ? 'border-gray-400/50 md:order-1' :
                  'border-amber-700/50 md:order-3'
                }`}
              >
                <div className="flex justify-center mb-4">
                  {getRankIcon(alumni.rank)}
                </div>
                <img 
                  src={alumni.avatar}
                  alt={alumni.name}
                  className="w-20 h-20 rounded-full mx-auto mb-4 ring-2 ring-accent/30"
                />
                <h3 className="text-xl font-semibold text-foreground mb-1">{alumni.name}</h3>
                <p className="text-sm text-foreground/70 mb-1">{alumni.role}</p>
                <p className="text-xs text-foreground/60 mb-3">{alumni.company}</p>
                <div className="text-3xl font-bold text-accent mb-2">{alumni.points.toLocaleString()}</div>
                <p className="text-xs text-foreground/60 mb-3">Impact Points</p>
                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div>
                    <p className="font-semibold text-foreground">{alumni.mentees}</p>
                    <p className="text-xs text-foreground/60">Mentees</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{alumni.contributions}</p>
                    <p className="text-xs text-foreground/60">Contributions</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 justify-center">
                  {alumni.achievements.slice(0, 2).map((achievement, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {achievement}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* Rest of the list */}
          <div className="space-y-4">
            {topAlumni.slice(3).map((alumni) => (
              <Card key={alumni.rank} className="glass-effect p-6 border border-border/30 hover:border-accent/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 text-center">
                    {getRankIcon(alumni.rank)}
                  </div>
                  <img 
                    src={alumni.avatar}
                    alt={alumni.name}
                    className="w-16 h-16 rounded-full ring-2 ring-accent/20"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">{alumni.name}</h3>
                    <p className="text-sm text-foreground/70">{alumni.role} at {alumni.company}</p>
                  </div>
                  <div className="text-right mr-4">
                    <div className="text-2xl font-bold text-accent mb-1">{alumni.points.toLocaleString()}</div>
                    <p className="text-xs text-foreground/60">Points</p>
                  </div>
                  <div className="text-right mr-4">
                    <div className="text-xl font-semibold text-primary mb-1">{alumni.mentees}</div>
                    <p className="text-xs text-foreground/60">Mentees</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold text-foreground mb-1">{alumni.contributions}</div>
                    <p className="text-xs text-foreground/60">Contributions</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-3 ml-28">
                  {alumni.achievements.map((achievement, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {achievement}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniLeaderboard;

