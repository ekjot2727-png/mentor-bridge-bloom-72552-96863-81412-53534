import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Leaderboard = () => {
  const navigate = useNavigate();

  // Mock leaderboard data
  const topStudents = [
    {
      rank: 1,
      name: "Rajesh Kumar",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
      points: 9850,
      college: "JECRC Foundation",
      contributions: 45,
      achievements: ["Top Contributor", "Innovation Leader", "Mentor"]
    },
    {
      rank: 2,
      name: "Priya Sharma",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya2",
      points: 9520,
      college: "IIT Bombay",
      contributions: 42,
      achievements: ["Community Leader", "Project Master"]
    },
    {
      rank: 3,
      name: "Amit Patel",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit2",
      points: 9210,
      college: "JECRC University",
      contributions: 38,
      achievements: ["Innovation Award", "Top Collaborator"]
    },
    {
      rank: 4,
      name: "Sneha Reddy",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
      points: 8890,
      college: "IIT Madras",
      contributions: 36,
      achievements: ["Rising Star", "Community Hero"]
    },
    {
      rank: 5,
      name: "Vikram Singh",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
      points: 8650,
      college: "JECRC Foundation",
      contributions: 34,
      achievements: ["Tech Excellence"]
    },
    {
      rank: 6,
      name: "Neha Gupta",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha2",
      points: 8420,
      college: "IIT Delhi",
      contributions: 32,
      achievements: ["Top Performer"]
    },
    {
      rank: 7,
      name: "Rahul Verma",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul2",
      points: 8150,
      college: "JECRC University",
      contributions: 30,
      achievements: ["Innovation Badge"]
    },
    {
      rank: 8,
      name: "Ananya Das",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
      points: 7920,
      college: "IIT Kharagpur",
      contributions: 28,
      achievements: ["Community Star"]
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
          onClick={() => navigate('/student-portal')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Portal
        </Button>

        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 glass-effect px-6 py-3 rounded-full mb-4 border border-primary/20">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Top Contributors</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 hero-text">Student Leaderboard</h1>
            <p className="text-lg text-foreground/70">Recognizing our most active and impactful community members</p>
          </div>

          {/* Top 3 Podium */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {topStudents.slice(0, 3).map((student, index) => (
              <Card 
                key={student.rank}
                className={`glass-effect p-6 border text-center ${
                  index === 0 ? 'border-yellow-500/50 md:order-2' :
                  index === 1 ? 'border-gray-400/50 md:order-1' :
                  'border-amber-700/50 md:order-3'
                }`}
              >
                <div className="flex justify-center mb-4">
                  {getRankIcon(student.rank)}
                </div>
                <img 
                  src={student.avatar}
                  alt={student.name}
                  className="w-20 h-20 rounded-full mx-auto mb-4 ring-2 ring-primary/30"
                />
                <h3 className="text-xl font-semibold text-foreground mb-1">{student.name}</h3>
                <p className="text-sm text-foreground/70 mb-3">{student.college}</p>
                <div className="text-3xl font-bold text-primary mb-2">{student.points.toLocaleString()}</div>
                <p className="text-xs text-foreground/60 mb-3">Points</p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {student.achievements.map((achievement, idx) => (
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
            {topStudents.slice(3).map((student) => (
              <Card key={student.rank} className="glass-effect p-6 border border-border/30 hover:border-primary/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 text-center">
                    {getRankIcon(student.rank)}
                  </div>
                  <img 
                    src={student.avatar}
                    alt={student.name}
                    className="w-16 h-16 rounded-full ring-2 ring-primary/20"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">{student.name}</h3>
                    <p className="text-sm text-foreground/70">{student.college}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary mb-1">{student.points.toLocaleString()}</div>
                    <p className="text-xs text-foreground/60">Points</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold text-accent mb-1">{student.contributions}</div>
                    <p className="text-xs text-foreground/60">Contributions</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-3 ml-28">
                  {student.achievements.map((achievement, idx) => (
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

export default Leaderboard;
