import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Briefcase, MapPin, Clock, DollarSign, Building2, Search, Filter, Loader2, Bookmark, BookmarkCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const JenHub = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    keyword: "",
    jobType: "",
    location: "",
  });

  const jobTypeLabels: Record<string, string> = {
    full_time: "Full-time",
    part_time: "Part-time",
    contract: "Contract",
    internship: "Internship",
    freelance: "Freelance",
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params: any = { status: "open" };
      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.jobType) params.jobType = filters.jobType;
      if (filters.location) params.location = filters.location;
      
      const response = await apiClient.getJobs(params);
      setJobs(response.data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    try {
      setApplying(jobId);
      await apiClient.applyToJob(jobId);
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully.",
      });
      fetchJobs(); // Refresh to update application count
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to apply",
        variant: "destructive",
      });
    } finally {
      setApplying(null);
    }
  };

  const toggleSaveJob = (jobId: string) => {
    const newSaved = new Set(savedJobs);
    if (newSaved.has(jobId)) {
      newSaved.delete(jobId);
      toast({ title: "Job removed from saved" });
    } else {
      newSaved.add(jobId);
      toast({ title: "Job saved" });
    }
    setSavedJobs(newSaved);
    localStorage.setItem("savedJobs", JSON.stringify([...newSaved]));
  };

  useEffect(() => {
    const saved = localStorage.getItem("savedJobs");
    if (saved) {
      setSavedJobs(new Set(JSON.parse(saved)));
    }
  }, []);

  const getTimeSince = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const handleSearch = () => {
    fetchJobs();
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

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 hero-text">Jen Hub</h1>
            <p className="text-lg text-foreground/70">Discover job opportunities and internships posted by alumni</p>
          </div>

          {/* Filters */}
          <Card className="glass-effect p-4 mb-8 border border-primary/20">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
                  <Input
                    placeholder="Search jobs, companies, skills..."
                    className="pl-10"
                    value={filters.keyword}
                    onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filters.jobType || "all"} onValueChange={(v) => setFilters({ ...filters, jobType: v === "all" ? "" : v })}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="full_time">Full-time</SelectItem>
                    <SelectItem value="part_time">Part-time</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Location"
                  className="w-[150px]"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                />
                <Button onClick={handleSearch}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </Card>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : jobs.length === 0 ? (
            <Card className="glass-effect p-12 text-center">
              <Briefcase className="h-16 w-16 mx-auto mb-4 text-foreground/40" />
              <h3 className="text-xl font-semibold mb-2">No Jobs Found</h3>
              <p className="text-foreground/60">Try adjusting your search filters or check back later for new opportunities.</p>
            </Card>
          ) : (
            <div className="grid gap-6">
              {jobs.map((job) => (
                <Card key={job.id} className="glass-effect p-6 border border-primary/20 hover:border-primary/40 transition-all">
                  <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-foreground mb-1">{job.title}</h3>
                          <div className="flex items-center gap-2 text-foreground/70 mb-2">
                            <Building2 className="h-4 w-4" />
                            <span className="font-medium">{job.companyName}</span>
                          </div>
                        </div>
                        <Badge variant={job.jobType === "internship" ? "secondary" : "default"}>
                          {jobTypeLabels[job.jobType] || job.jobType}
                        </Badge>
                      </div>
                      
                      <p className="text-foreground/70 mb-4 line-clamp-2">{job.description}</p>

                      <div className="flex flex-wrap gap-4 text-sm text-foreground/60 mb-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </div>
                        {job.salary && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {job.salary}
                          </div>
                        )}
                        <div className="text-foreground/50">
                          Posted {getTimeSince(job.postedDate || job.createdAt)}
                        </div>
                        <div className="text-foreground/50">
                          {job.applicationsCount || 0} applicants
                        </div>
                      </div>

                      {job.requiredSkills && job.requiredSkills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {job.requiredSkills.slice(0, 6).map((skill: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex md:flex-col gap-2">
                      <Button 
                        variant="hero" 
                        className="flex-1 md:flex-none"
                        onClick={() => handleApply(job.id)}
                        disabled={applying === job.id}
                      >
                        {applying === job.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Apply Now"
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 md:flex-none"
                        onClick={() => toggleSaveJob(job.id)}
                      >
                        {savedJobs.has(job.id) ? (
                          <>
                            <BookmarkCheck className="h-4 w-4 mr-2" />
                            Saved
                          </>
                        ) : (
                          <>
                            <Bookmark className="h-4 w-4 mr-2" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JenHub;
