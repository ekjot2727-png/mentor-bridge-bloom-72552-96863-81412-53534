import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Rocket, Users, DollarSign, TrendingUp, Building2, Plus, Loader2 } from "lucide-react";
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

const StartupIncubator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [startups, setStartups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [myStartup, setMyStartup] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    description: "",
    industry: "",
    stage: "idea",
    fundingStage: "bootstrapped",
    location: "",
    website: "",
    teamSize: 1,
    technologies: "",
    lookingFor: "",
    contactEmail: "",
  });

  const stageLabels: Record<string, string> = {
    idea: "Idea",
    mvp: "MVP",
    early_stage: "Early Stage",
    growth: "Growth",
    scaling: "Scaling",
  };

  const fundingLabels: Record<string, string> = {
    bootstrapped: "Bootstrapped",
    pre_seed: "Pre-Seed",
    seed: "Seed",
    series_a: "Series A",
    series_b: "Series B",
    series_c_plus: "Series C+",
  };

  useEffect(() => {
    fetchStartups();
    fetchMyStartup();
  }, []);

  const fetchStartups = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getStartups({ status: "approved" });
      setStartups(response.data || []);
    } catch (error) {
      console.error("Error fetching startups:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyStartup = async () => {
    try {
      const response = await apiClient.getMyStartup();
      setMyStartup(response);
    } catch (error) {
      // User doesn't have a startup yet
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        teamSize: Number(formData.teamSize),
        technologies: formData.technologies.split(",").map((t) => t.trim()).filter(Boolean),
      };

      await apiClient.createStartup(payload);
      toast({
        title: "Startup Submitted",
        description: "Your startup has been submitted for review.",
      });
      setDialogOpen(false);
      fetchMyStartup();
      fetchStartups();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit startup",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
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

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 glass-effect px-6 py-3 rounded-full mb-4 border border-primary/20">
              <Rocket className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Launch Your Idea</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 hero-text">Startup Incubator</h1>
            <p className="text-lg text-foreground/70">Explore student startups and launch your entrepreneurial journey</p>
          </div>

          {myStartup && (
            <Card className="glass-effect p-6 border border-accent/40 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Your Startup: {myStartup.name}</h3>
                  <p className="text-sm text-foreground/70">
                    Status: <Badge variant={myStartup.status === 'approved' ? 'default' : myStartup.status === 'pending' ? 'secondary' : 'destructive'}>
                      {myStartup.status}
                    </Badge>
                  </p>
                </div>
                <Button variant="outline" onClick={() => navigate(`/student-portal/startup/${myStartup.id}`)}>
                  View Details
                </Button>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {startups.map((startup, index) => (
                <Card key={startup.id || index} className="glass-effect p-6 border border-primary/20 hover:border-primary/40 transition-all">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-4xl">{startup.logo || "🚀"}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-foreground">{startup.name}</h3>
                          <p className="text-sm text-foreground/70">
                            {startup.tagline || `Founded by ${startup.founder?.firstName || 'Unknown'}`}
                          </p>
                        </div>
                        <Badge variant="secondary">{stageLabels[startup.stage] || startup.stage}</Badge>
                      </div>
                    </div>
                  </div>

                  <p className="text-foreground/70 mb-4 line-clamp-2">{startup.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4 p-4 rounded-lg bg-background/50">
                    <div>
                      <div className="flex items-center gap-1 text-sm text-foreground/60 mb-1">
                        <DollarSign className="h-4 w-4" />
                        Funding
                      </div>
                      <p className="font-semibold text-foreground">{fundingLabels[startup.fundingStage] || startup.fundingStage}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-sm text-foreground/60 mb-1">
                        <TrendingUp className="h-4 w-4" />
                        Stage
                      </div>
                      <p className="font-semibold text-accent">{stageLabels[startup.stage] || startup.stage}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-sm text-foreground/60 mb-1">
                        <Users className="h-4 w-4" />
                        Team Size
                      </div>
                      <p className="font-semibold text-foreground">{startup.teamSize || 1} members</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-sm text-foreground/60 mb-1">
                        <Building2 className="h-4 w-4" />
                        Industry
                      </div>
                      <p className="font-semibold text-foreground">{startup.industry || 'Tech'}</p>
                    </div>
                  </div>

                  {startup.technologies && startup.technologies.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-foreground/80 mb-2">Technologies:</p>
                      <div className="flex flex-wrap gap-2">
                        {startup.technologies.slice(0, 4).map((tech: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" variant="hero" className="flex-1">Connect</Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate(`/student-portal/startup/${startup.id}`)}>
                      Learn More
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {startups.length === 0 && !loading && (
            <div className="text-center py-12 text-foreground/60">
              <Rocket className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No startups found. Be the first to submit yours!</p>
            </div>
          )}

          {!myStartup && (
            <div className="mt-8 text-center">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="hero" size="lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Submit Your Startup
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Register Your Startup</DialogTitle>
                    <DialogDescription>
                      Fill in the details below to submit your startup for review
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Startup Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tagline">Tagline</Label>
                        <Input
                          id="tagline"
                          value={formData.tagline}
                          onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                          placeholder="One line about your startup"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry *</Label>
                        <Input
                          id="industry"
                          value={formData.industry}
                          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                          placeholder="e.g., EdTech, FinTech"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Stage</Label>
                        <Select value={formData.stage} onValueChange={(v) => setFormData({ ...formData, stage: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="idea">Idea</SelectItem>
                            <SelectItem value="mvp">MVP</SelectItem>
                            <SelectItem value="early_stage">Early Stage</SelectItem>
                            <SelectItem value="growth">Growth</SelectItem>
                            <SelectItem value="scaling">Scaling</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Funding Stage</Label>
                        <Select value={formData.fundingStage} onValueChange={(v) => setFormData({ ...formData, fundingStage: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bootstrapped">Bootstrapped</SelectItem>
                            <SelectItem value="pre_seed">Pre-Seed</SelectItem>
                            <SelectItem value="seed">Seed</SelectItem>
                            <SelectItem value="series_a">Series A</SelectItem>
                            <SelectItem value="series_b">Series B</SelectItem>
                            <SelectItem value="series_c_plus">Series C+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="teamSize">Team Size</Label>
                        <Input
                          id="teamSize"
                          type="number"
                          min="1"
                          value={formData.teamSize}
                          onChange={(e) => setFormData({ ...formData, teamSize: parseInt(e.target.value) || 1 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          type="url"
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          placeholder="https://"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="technologies">Technologies (comma separated)</Label>
                      <Input
                        id="technologies"
                        value={formData.technologies}
                        onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                        placeholder="React, Node.js, AI/ML"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lookingFor">Looking For</Label>
                      <Input
                        id="lookingFor"
                        value={formData.lookingFor}
                        onChange={(e) => setFormData({ ...formData, lookingFor: e.target.value })}
                        placeholder="Co-founder, Developer, Investment"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Rocket className="h-4 w-4 mr-2" />
                          Submit Startup
                        </>
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StartupIncubator;
