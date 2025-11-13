import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft,
  Briefcase,
  Building,
  MapPin,
  Search,
  GraduationCap,
  Mail
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const alumniData = [
  {
    name: "Sarah Johnson",
    initials: "SJ",
    position: "Senior Software Engineer",
    company: "Google",
    location: "San Francisco, CA",
    graduationYear: "2018",
    degree: "B.S. Computer Science",
    expertise: ["Software Development", "Cloud Computing", "AI/ML"],
    email: "sarah.j@example.com",
    color: "bg-primary"
  },
  {
    name: "Michael Chen",
    initials: "MC",
    position: "Product Manager",
    company: "Microsoft",
    location: "Seattle, WA",
    graduationYear: "2017",
    degree: "B.S. Information Systems",
    expertise: ["Product Strategy", "Agile", "UX Design"],
    email: "michael.c@example.com",
    color: "bg-accent"
  },
  {
    name: "Priya Patel",
    initials: "PP",
    position: "Data Scientist",
    company: "Amazon",
    location: "Austin, TX",
    graduationYear: "2019",
    degree: "M.S. Data Science",
    expertise: ["Machine Learning", "Data Analytics", "Python"],
    email: "priya.p@example.com",
    color: "bg-secondary"
  },
  {
    name: "David Martinez",
    initials: "DM",
    position: "Startup Founder",
    company: "TechVenture Inc.",
    location: "New York, NY",
    graduationYear: "2016",
    degree: "B.S. Business Administration",
    expertise: ["Entrepreneurship", "Business Strategy", "Fundraising"],
    email: "david.m@example.com",
    color: "bg-primary"
  },
  {
    name: "Emily Thompson",
    initials: "ET",
    position: "Marketing Director",
    company: "Adobe",
    location: "San Jose, CA",
    graduationYear: "2018",
    degree: "B.A. Marketing",
    expertise: ["Digital Marketing", "Brand Strategy", "Content Creation"],
    email: "emily.t@example.com",
    color: "bg-accent"
  },
  {
    name: "Raj Sharma",
    initials: "RS",
    position: "Financial Analyst",
    company: "Goldman Sachs",
    location: "New York, NY",
    graduationYear: "2017",
    degree: "B.S. Finance",
    expertise: ["Investment Banking", "Financial Modeling", "Market Analysis"],
    email: "raj.s@example.com",
    color: "bg-secondary"
  },
  {
    name: "Jessica Williams",
    initials: "JW",
    position: "UX Designer",
    company: "Apple",
    location: "Cupertino, CA",
    graduationYear: "2020",
    degree: "B.F.A. Design",
    expertise: ["UI/UX Design", "Prototyping", "User Research"],
    email: "jessica.w@example.com",
    color: "bg-primary"
  },
  {
    name: "Kevin Lee",
    initials: "KL",
    position: "Cybersecurity Engineer",
    company: "Cisco",
    location: "San Jose, CA",
    graduationYear: "2015",
    degree: "B.S. Computer Engineering",
    expertise: ["Network Security", "Ethical Hacking", "Compliance"],
    email: "kevin.l@example.com",
    color: "bg-accent"
  },
  {
    name: "Aisha Ahmed",
    initials: "AA",
    position: "Research Scientist",
    company: "MIT Labs",
    location: "Boston, MA",
    graduationYear: "2019",
    degree: "Ph.D. Artificial Intelligence",
    expertise: ["AI Research", "Neural Networks", "Deep Learning"],
    email: "aisha.a@example.com",
    color: "bg-secondary"
  },
  {
    name: "James Anderson",
    initials: "JA",
    position: "DevOps Engineer",
    company: "Netflix",
    location: "Los Gatos, CA",
    graduationYear: "2018",
    degree: "B.S. Software Engineering",
    expertise: ["CI/CD", "Kubernetes", "AWS"],
    email: "james.a@example.com",
    color: "bg-primary"
  },
  {
    name: "Sophia Rodriguez",
    initials: "SR",
    position: "HR Director",
    company: "LinkedIn",
    location: "Sunnyvale, CA",
    graduationYear: "2016",
    degree: "M.A. Human Resources",
    expertise: ["Talent Acquisition", "Employee Relations", "HR Strategy"],
    email: "sophia.r@example.com",
    color: "bg-accent"
  },
  {
    name: "Daniel Kim",
    initials: "DK",
    position: "Mobile Developer",
    company: "Uber",
    location: "San Francisco, CA",
    graduationYear: "2019",
    degree: "B.S. Computer Science",
    expertise: ["iOS Development", "React Native", "Mobile Architecture"],
    email: "daniel.k@example.com",
    color: "bg-secondary"
  }
];

const AlumniDirectory = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAlumni = alumniData.filter(alumni =>
    alumni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alumni.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alumni.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alumni.expertise.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-6 py-12">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/student-portal')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Portal
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 hero-text">
            Find Alumni
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Connect with successful alumni from your institution who are ready to mentor and guide you.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/40" />
            <Input
              type="text"
              placeholder="Search by name, company, position, or expertise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-lg glass-effect border-border/30"
            />
          </div>
        </div>

        {/* Alumni Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.map((alumni, index) => (
            <Card 
              key={alumni.email}
              className="glass-effect p-6 border border-border/30 hover:border-accent/30 transition-all duration-300 group hover:scale-105"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className={`${alumni.color} text-white text-lg font-bold`}>
                    {alumni.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
                    {alumni.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-foreground/60 mb-1">
                    <GraduationCap className="h-3 w-3" />
                    <span>Class of {alumni.graduationYear}</span>
                  </div>
                  <p className="text-xs text-foreground/60">{alumni.degree}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <span>{alumni.position}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <Building className="h-4 w-4 text-accent" />
                  <span>{alumni.company}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <MapPin className="h-4 w-4 text-secondary" />
                  <span>{alumni.location}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-foreground/60 mb-2">Expertise:</p>
                <div className="flex flex-wrap gap-2">
                  {alumni.expertise.map((skill) => (
                    <span 
                      key={skill}
                      className="text-xs px-2 py-1 rounded-full glass-effect border border-primary/20 text-foreground/80"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <Button 
                variant="glass" 
                size="sm" 
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Connect
              </Button>
            </Card>
          ))}
        </div>

        {filteredAlumni.length === 0 && (
          <div className="text-center py-12">
            <p className="text-foreground/60 text-lg">No alumni found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlumniDirectory;
