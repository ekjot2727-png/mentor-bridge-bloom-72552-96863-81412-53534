import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, MapPin, Briefcase, Users, MessageCircle, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const AlumniDirectory = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const alumni = [
    {
      name: "Dr. Priya Sharma",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaDir",
      role: "Senior ML Engineer",
      company: "Google",
      location: "Bangalore",
      graduationYear: "2015",
      connections: 487,
      mutualConnections: 23,
      skills: ["ML", "AI", "Python"],
      isConnected: true
    },
    {
      name: "Amit Patel",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AmitDir",
      role: "Tech Lead",
      company: "Microsoft",
      location: "Hyderabad",
      graduationYear: "2016",
      connections: 342,
      mutualConnections: 15,
      skills: ["React", "Node.js", "AWS"],
      isConnected: true
    },
    {
      name: "Neha Gupta",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=NehaDir",
      role: "Data Science Manager",
      company: "Amazon",
      location: "Mumbai",
      graduationYear: "2014",
      connections: 521,
      mutualConnections: 31,
      skills: ["Data Science", "Python", "SQL"],
      isConnected: false
    },
    {
      name: "Rahul Verma",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=RahulDir",
      role: "Senior Software Engineer",
      company: "Flipkart",
      location: "Bangalore",
      graduationYear: "2017",
      connections: 289,
      mutualConnections: 12,
      skills: ["Java", "Spring Boot", "Microservices"],
      isConnected: false
    },
    {
      name: "Sneha Reddy",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SnehaDir",
      role: "Product Manager",
      company: "Zomato",
      location: "Gurgaon",
      graduationYear: "2018",
      connections: 398,
      mutualConnections: 18,
      skills: ["Product Management", "Strategy", "Analytics"],
      isConnected: true
    },
    {
      name: "Vikram Singh",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=VikramDir",
      role: "Founder & CEO",
      company: "CodeMentor AI",
      location: "Jaipur",
      graduationYear: "2015",
      connections: 612,
      mutualConnections: 27,
      skills: ["Entrepreneurship", "AI", "Leadership"],
      isConnected: false
    },
    {
      name: "Ananya Das",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AnanyaDir",
      role: "UX Design Lead",
      company: "Swiggy",
      location: "Bangalore",
      graduationYear: "2019",
      connections: 234,
      mutualConnections: 9,
      skills: ["UI/UX", "Figma", "Design Thinking"],
      isConnected: false
    },
    {
      name: "Karthik Iyer",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Karthik",
      role: "DevOps Engineer",
      company: "PayTM",
      location: "Noida",
      graduationYear: "2016",
      connections: 376,
      mutualConnections: 14,
      skills: ["Docker", "Kubernetes", "AWS"],
      isConnected: true
    }
  ];

  const filteredAlumni = alumni.filter(person =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 hero-text">Alumni Directory</h1>
            <p className="text-lg text-foreground/70 mb-6">
              Connect with {alumni.length.toLocaleString()}+ alumni worldwide
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/50" />
              <Input
                type="text"
                placeholder="Search by name, company, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg glass-effect border-primary/20"
              />
            </div>
          </div>

          {/* Alumni Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {filteredAlumni.map((person, index) => (
              <Card key={index} className="glass-effect p-6 border border-primary/20 hover:border-accent/40 transition-all">
                <div className="flex gap-4">
                  <img 
                    src={person.avatar}
                    alt={person.name}
                    className="w-20 h-20 rounded-full ring-2 ring-primary/30"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">{person.name}</h3>
                        <p className="text-sm text-foreground/70">{person.role}</p>
                        <p className="text-sm text-foreground/60">{person.company}</p>
                      </div>
                      {person.isConnected && (
                        <Badge variant="secondary" className="text-xs">
                          Connected
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-foreground/60 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {person.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        Class of {person.graduationYear}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {person.connections} connections
                      </div>
                    </div>

                    {person.mutualConnections > 0 && (
                      <p className="text-xs text-accent mb-3">
                        {person.mutualConnections} mutual connections
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1 mb-3">
                      {person.skills.map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      {person.isConnected ? (
                        <Button size="sm" variant="outline" className="flex-1">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                      ) : (
                        <Button size="sm" variant="hero" className="flex-1">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        View Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredAlumni.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-foreground/30 mx-auto mb-4" />
              <p className="text-foreground/70">No alumni found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlumniDirectory;
