import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, Briefcase, MapPin, Clock, Edit, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const AlumniJenHub = () => {
  const navigate = useNavigate();

  // Mock posted jobs by this alumni
  const myPostings = [
    {
      id: 1,
      title: "Senior ML Engineer",
      company: "Google",
      location: "Bangalore",
      type: "Full-time",
      posted: "5 days ago",
      applicants: 23,
      status: "Active"
    },
    {
      id: 2,
      title: "ML Intern",
      company: "Google",
      location: "Remote",
      type: "Internship",
      posted: "2 weeks ago",
      applicants: 45,
      status: "Active"
    }
  ];

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
            <h1 className="text-4xl font-bold mb-4 hero-text">Jen Hub - Alumni</h1>
            <p className="text-lg text-foreground/70">Post job opportunities and internships for students</p>
          </div>

          {/* Post New Job Button */}
          <Card className="glass-effect p-8 mb-8 border border-accent/20 text-center">
            <Briefcase className="h-16 w-16 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3 text-foreground">Share Opportunities</h2>
            <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
              Help students kickstart their careers by posting job openings and internships from your company.
            </p>
            <Button variant="hero" size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Post New Opportunity
            </Button>
          </Card>

          {/* My Postings */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Your Active Postings</h2>
          </div>

          <div className="space-y-6">
            {myPostings.map((job) => (
              <Card key={job.id} className="glass-effect p-6 border border-primary/20">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-1">{job.title}</h3>
                        <p className="text-foreground/70">{job.company}</p>
                      </div>
                      <Badge variant={job.status === "Active" ? "default" : "secondary"}>
                        {job.status}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-foreground/60 mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {job.type}
                      </div>
                      <div className="text-foreground/50">
                        Posted {job.posted}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-2xl font-bold text-accent">{job.applicants}</span>
                        <span className="text-foreground/70 ml-2">applicants</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2">
                    <Button variant="outline" className="flex-1 md:flex-none">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" className="flex-1 md:flex-none">
                      View Applicants
                    </Button>
                    <Button variant="ghost" className="flex-1 md:flex-none text-destructive hover:text-destructive">
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
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

export default AlumniJenHub;
