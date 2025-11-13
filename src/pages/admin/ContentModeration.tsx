import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, XCircle, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function ContentModeration() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pendingItems, setPendingItems] = useState([
    {
      id: 1,
      type: "success_story",
      title: "From Student to CTO: My Journey at Tech Startup",
      submittedBy: "John Smith",
      submittedAt: "2024-01-15",
      content: "After graduating in 2018, I joined a small startup as employee #5. Today, I lead a team of 50 engineers...",
      status: "pending",
    },
    {
      id: 2,
      type: "event",
      title: "Annual Alumni Networking Gala 2024",
      submittedBy: "Sarah Johnson",
      submittedAt: "2024-01-14",
      content: "Join us for an evening of networking, reconnecting, and celebrating our community...",
      status: "pending",
    },
    {
      id: 3,
      type: "job_posting",
      title: "Senior Software Engineer at Google",
      submittedBy: "Michael Brown",
      submittedAt: "2024-01-13",
      content: "We're looking for experienced engineers to join our Cloud Platform team...",
      status: "pending",
    },
  ]);

  const handleApprove = (id: number) => {
    setPendingItems(pendingItems.map(item =>
      item.id === id ? { ...item, status: 'approved' } : item
    ));
    toast({
      title: "Content approved",
      description: "The submission has been published",
    });
  };

  const handleReject = (id: number) => {
    setPendingItems(pendingItems.map(item =>
      item.id === id ? { ...item, status: 'rejected' } : item
    ));
    toast({
      title: "Content rejected",
      description: "The submitter will be notified",
      variant: "destructive",
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success_story': return 'bg-blue-500';
      case 'event': return 'bg-green-500';
      case 'job_posting': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeLabel = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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
          <h1 className="text-3xl font-bold mb-2">Content Moderation</h1>
          <p className="text-muted-foreground">
            Review and approve submitted content
          </p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingItems.filter(i => i.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingItems
              .filter(item => item.status === 'pending')
              .map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getTypeColor(item.type)}>
                            {getTypeLabel(item.type)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Submitted {item.submittedAt} by {item.submittedBy}
                          </span>
                        </div>
                        <CardTitle className="text-xl">{item.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{item.content}</p>
                    <Separator className="my-4" />
                    <div className="flex gap-3">
                      <Button
                        variant="default"
                        onClick={() => handleApprove(item.id)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(item.id)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                      <Button variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        View Full Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="approved">
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No approved items to display
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected">
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No rejected items to display
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
