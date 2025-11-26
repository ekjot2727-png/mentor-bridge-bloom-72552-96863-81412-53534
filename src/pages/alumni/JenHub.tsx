import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, Briefcase, MapPin, Clock, Edit, Trash, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AlumniJenHub = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    companyName: "",
    location: "",
    jobType: "full_time",
    salary: "",
    requiredSkills: "",
    applicationDeadline: "",
  });

  const jobTypeLabels: Record<string, string> = {
    full_time: "Full-time",
    part_time: "Part-time",
    contract: "Contract",
    internship: "Internship",
    freelance: "Freelance",
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMyPostedJobs();
      setJobs(response.data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      companyName: "",
      location: "",
      jobType: "full_time",
      salary: "",
      requiredSkills: "",
      applicationDeadline: "",
    });
    setEditingJob(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        requiredSkills: formData.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
        applicationDeadline: formData.applicationDeadline || undefined,
      };

      if (editingJob) {
        await apiClient.updateJob(editingJob.id, payload);
        toast({
          title: "Job Updated",
          description: "Your job posting has been updated.",
        });
      } else {
        await apiClient.createJob(payload);
        toast({
          title: "Job Posted",
          description: "Your job has been posted successfully.",
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchMyJobs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save job",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (job: any) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      companyName: job.companyName,
      location: job.location,
      jobType: job.jobType,
      salary: job.salary || "",
      requiredSkills: job.requiredSkills?.join(", ") || "",
      applicationDeadline: job.applicationDeadline?.split("T")[0] || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (jobId: string) => {
    try {
      await apiClient.deleteJob(jobId);
      toast({
        title: "Job Deleted",
        description: "Your job posting has been deleted.",
      });
      fetchMyJobs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete job",
        variant: "destructive",
      });
    }
  };

  const handleCloseJob = async (jobId: string) => {
    try {
      await apiClient.closeJob(jobId);
      toast({
        title: "Job Closed",
        description: "Your job posting has been closed.",
      });
      fetchMyJobs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to close job",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Not set";
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

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

          {/* Post New Job Card */}
          <Card className="glass-effect p-8 mb-8 border border-accent/20 text-center">
            <Briefcase className="h-16 w-16 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3 text-foreground">Share Opportunities</h2>
            <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
              Help students kickstart their careers by posting job openings and internships from your company.
            </p>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button variant="hero" size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Post New Opportunity
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingJob ? "Edit Job Posting" : "Post New Job"}</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to {editingJob ? "update" : "create"} your job posting
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Senior Software Engineer"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      rows={4}
                      placeholder="Describe the role, responsibilities, and requirements..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Bangalore, Remote"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Job Type *</Label>
                      <Select value={formData.jobType} onValueChange={(v) => setFormData({ ...formData, jobType: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full_time">Full-time</SelectItem>
                          <SelectItem value="part_time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                          <SelectItem value="freelance">Freelance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salary">Salary Range</Label>
                      <Input
                        id="salary"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        placeholder="e.g., ₹10-15 LPA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="applicationDeadline">Application Deadline</Label>
                      <Input
                        id="applicationDeadline"
                        type="date"
                        value={formData.applicationDeadline}
                        onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requiredSkills">Required Skills (comma separated)</Label>
                    <Input
                      id="requiredSkills"
                      value={formData.requiredSkills}
                      onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                      placeholder="React, Node.js, TypeScript"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {editingJob ? "Updating..." : "Posting..."}
                      </>
                    ) : (
                      <>
                        <Briefcase className="h-4 w-4 mr-2" />
                        {editingJob ? "Update Job" : "Post Job"}
                      </>
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </Card>

          {/* My Postings */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Your Job Postings</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : jobs.length === 0 ? (
            <Card className="glass-effect p-8 text-center">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-foreground/40" />
              <p className="text-foreground/60">You haven't posted any jobs yet.</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {jobs.map((job) => (
                <Card key={job.id} className="glass-effect p-6 border border-primary/20">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-foreground mb-1">{job.title}</h3>
                          <p className="text-foreground/70">{job.companyName}</p>
                        </div>
                        <Badge variant={job.status === "open" ? "default" : "secondary"}>
                          {job.status === "open" ? "Active" : job.status}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-foreground/60 mb-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {jobTypeLabels[job.jobType] || job.jobType}
                        </div>
                        <div className="text-foreground/50">
                          Posted {getTimeSince(job.postedDate || job.createdAt)}
                        </div>
                      </div>

                      {job.requiredSkills && job.requiredSkills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.requiredSkills.slice(0, 5).map((skill: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <span className="text-2xl font-bold text-accent">{job.applicationsCount || 0}</span>
                          <span className="text-foreground/70 ml-2">applicants</span>
                        </div>
                        {job.salary && (
                          <div className="text-foreground/70">
                            Salary: <span className="font-medium text-foreground">{job.salary}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-2">
                      <Button variant="outline" className="flex-1 md:flex-none" onClick={() => handleEdit(job)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      {job.status === "open" && (
                        <Button variant="outline" className="flex-1 md:flex-none" onClick={() => handleCloseJob(job.id)}>
                          Close Job
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" className="flex-1 md:flex-none text-destructive hover:text-destructive">
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Job Posting?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your job posting.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(job.id)} className="bg-destructive">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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

export default AlumniJenHub;
