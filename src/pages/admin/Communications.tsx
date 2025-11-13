import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export default function Communications() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    targetRole: "all",
    targetIndustry: "all",
    targetGraduationYear: "all",
    includeStudents: true,
    includeAlumni: true,
  });

  const handleSend = () => {
    if (!formData.title || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Announcement sent",
      description: "Your message has been delivered to the selected audience",
    });

    setFormData({
      title: "",
      message: "",
      targetRole: "all",
      targetIndustry: "all",
      targetGraduationYear: "all",
      includeStudents: true,
      includeAlumni: true,
    });
  };

  const estimatedReach = () => {
    let count = 0;
    if (formData.includeStudents) count += 1200;
    if (formData.includeAlumni) count += 2847;

    if (formData.targetIndustry !== "all") count = Math.floor(count * 0.35);
    if (formData.targetGraduationYear !== "all") count = Math.floor(count * 0.25);

    return count;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/admin/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Communications Center</h1>
          <p className="text-muted-foreground">
            Send targeted announcements to your community
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compose Announcement</CardTitle>
                <CardDescription>
                  Create a message for your alumni and students
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Upcoming Career Fair 2024"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Write your announcement here..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={8}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Audience Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Target Audience
                </CardTitle>
                <CardDescription>
                  Filter who receives this announcement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>User Type</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="students"
                          checked={formData.includeStudents}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, includeStudents: checked as boolean })
                          }
                        />
                        <label htmlFor="students" className="text-sm">
                          Students (1,200)
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="alumni"
                          checked={formData.includeAlumni}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, includeAlumni: checked as boolean })
                          }
                        />
                        <label htmlFor="alumni" className="text-sm">
                          Alumni (2,847)
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      value={formData.targetIndustry}
                      onValueChange={(value) => setFormData({ ...formData, targetIndustry: value })}
                    >
                      <SelectTrigger id="industry">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Industries</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="graduation">Graduation Year</Label>
                    <Select
                      value={formData.targetGraduationYear}
                      onValueChange={(value) =>
                        setFormData({ ...formData, targetGraduationYear: value })
                      }
                    >
                      <SelectTrigger id="graduation">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2020-2022">2020-2022</SelectItem>
                        <SelectItem value="2015-2019">2015-2019</SelectItem>
                        <SelectItem value="before-2015">Before 2015</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Estimated Reach */}
            <Card>
              <CardHeader>
                <CardTitle>Estimated Reach</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {estimatedReach().toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">recipients</p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button className="w-full" onClick={handleSend}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Announcement
                </Button>
                <Button variant="outline" className="w-full">
                  Save as Draft
                </Button>
              </CardContent>
            </Card>

            {/* Recent Announcements */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Announcements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Career Fair 2024</div>
                  <div className="text-xs text-muted-foreground">
                    Sent 2 days ago to 3,200 recipients
                  </div>
                  <Badge variant="outline" className="text-green-600">Delivered</Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Mentorship Program Launch</div>
                  <div className="text-xs text-muted-foreground">
                    Sent 1 week ago to 2,847 recipients
                  </div>
                  <Badge variant="outline" className="text-green-600">Delivered</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
