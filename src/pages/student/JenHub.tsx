import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Briefcase, MapPin, Clock, DollarSign, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const JenHub = () => {
  const navigate = useNavigate();

  // Mock job postings
  const jobPostings = [
    {
      title: "Frontend Developer Intern",
      company: "TechCorp India",
      location: "Bangalore",
      type: "Internship",
      duration: "3 months",
      stipend: "₹15,000/month",
      posted: "2 days ago",
      skills: ["React", "JavaScript", "CSS", "Git"],
      description: "Looking for passionate frontend developers to join our growing team."
    },
    {
      title: "Machine Learning Intern",
      company: "AI Innovations",
      location: "Hyderabad",
      type: "Internship",
      duration: "6 months",
      stipend: "₹20,000/month",
      posted: "1 week ago",
      skills: ["Python", "TensorFlow", "PyTorch", "ML"],
      description: "Work on cutting-edge AI projects and learn from industry experts."
    },
    {
      title: "Full Stack Developer",
      company: "StartupXYZ",
      location: "Remote",
      type: "Full-time",
      duration: "Permanent",
      stipend: "₹8-12 LPA",
      posted: "3 days ago",
      skills: ["React", "Node.js", "MongoDB", "AWS"],
      description: "Join our dynamic startup and build products used by millions."
    },
    {
      title: "Data Analyst Intern",
      company: "Data Insights Co.",
      location: "Pune",
      type: "Internship",
      duration: "4 months",
      stipend: "₹18,000/month",
      posted: "5 days ago",
      skills: ["Python", "SQL", "Excel", "Tableau"],
      description: "Analyze data and help drive business decisions with insights."
    },
    {
      title: "Backend Developer",
      company: "Cloud Systems Ltd",
      location: "Jaipur",
      type: "Full-time",
      duration: "Permanent",
      stipend: "₹6-10 LPA",
      posted: "1 day ago",
      skills: ["Java", "Spring Boot", "MySQL", "Docker"],
      description: "Build scalable backend systems for enterprise applications."
    },
    {
      title: "UI/UX Design Intern",
      company: "Design Studio",
      location: "Mumbai",
      type: "Internship",
      duration: "3 months",
      stipend: "₹12,000/month",
      posted: "4 days ago",
      skills: ["Figma", "Adobe XD", "UI Design", "Prototyping"],
      description: "Create beautiful and intuitive user interfaces for mobile and web."
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
            <h1 className="text-4xl font-bold mb-4 hero-text">Jen Hub</h1>
            <p className="text-lg text-foreground/70">Discover job opportunities and internships posted by alumni</p>
          </div>

          <div className="grid gap-6">
            {jobPostings.map((job, index) => (
              <Card key={index} className="glass-effect p-6 border border-primary/20 hover:border-primary/40 transition-all">
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-1">{job.title}</h3>
                        <div className="flex items-center gap-2 text-foreground/70 mb-2">
                          <Building2 className="h-4 w-4" />
                          <span className="font-medium">{job.company}</span>
                        </div>
                      </div>
                      <Badge variant={job.type === "Internship" ? "secondary" : "default"}>
                        {job.type}
                      </Badge>
                    </div>
                    
                    <p className="text-foreground/70 mb-4">{job.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-foreground/60 mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {job.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {job.stipend}
                      </div>
                      <div className="text-foreground/50">
                        Posted {job.posted}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2">
                    <Button variant="hero" className="flex-1 md:flex-none">Apply Now</Button>
                    <Button variant="outline" className="flex-1 md:flex-none">Save</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JenHub;
