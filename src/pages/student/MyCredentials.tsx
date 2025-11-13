import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Award, Download, ExternalLink, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const MyCredentials = () => {
  const navigate = useNavigate();

  // Mock certificates data
  const certificates = [
    {
      title: "AWS Certified Cloud Practitioner",
      issuer: "Amazon Web Services",
      date: "March 2024",
      credentialId: "AWS-CCP-2024-123456",
      status: "Active",
      validUntil: "March 2027",
      logo: "https://images.credly.com/images/00634f82-b07f-4bbd-a6bb-53de397fc3a6/twitter_thumb_201604_image.png"
    },
    {
      title: "Google Data Analytics Professional Certificate",
      issuer: "Google",
      date: "January 2024",
      credentialId: "GOOGLE-DA-2024-789012",
      status: "Active",
      validUntil: "Lifetime",
      logo: "https://images.credly.com/images/d41d8cd9-cfd1-41d7-9c98-5f0e0d7e6c73/twitter_thumb_201604_image.png"
    },
    {
      title: "React Developer Certification",
      issuer: "Meta",
      date: "December 2023",
      credentialId: "META-REACT-2023-345678",
      status: "Active",
      validUntil: "December 2025",
      logo: "https://images.credly.com/images/00634f82-b07f-4bbd-a6bb-53de397fc3a6/twitter_thumb_201604_image.png"
    },
    {
      title: "Machine Learning Specialization",
      issuer: "Stanford University (Coursera)",
      date: "September 2023",
      credentialId: "STANFORD-ML-2023-901234",
      status: "Active",
      validUntil: "Lifetime",
      logo: "https://images.credly.com/images/d41d8cd9-cfd1-41d7-9c98-5f0e0d7e6c73/twitter_thumb_201604_image.png"
    },
    {
      title: "Python for Data Science",
      issuer: "IBM",
      date: "July 2023",
      credentialId: "IBM-PY-2023-567890",
      status: "Active",
      validUntil: "Lifetime",
      logo: "https://images.credly.com/images/00634f82-b07f-4bbd-a6bb-53de397fc3a6/twitter_thumb_201604_image.png"
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

        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 glass-effect px-6 py-3 rounded-full mb-4 border border-primary/20">
              <Award className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Professional Credentials</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 hero-text">My Credentials</h1>
            <p className="text-lg text-foreground/70">Track your certifications and achievements</p>
          </div>

          <div className="grid gap-6">
            {certificates.map((cert, index) => (
              <Card key={index} className="glass-effect p-6 border border-primary/20 hover:border-primary/40 transition-all">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-lg bg-background/50 flex items-center justify-center p-4">
                      <Award className="h-12 w-12 text-primary" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-1">{cert.title}</h3>
                        <p className="text-foreground/70 mb-2">{cert.issuer}</p>
                      </div>
                      <Badge variant="secondary">{cert.status}</Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm text-foreground/70">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Issued: {cert.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Valid Until: {cert.validUntil}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-foreground/60">
                        Credential ID: <span className="font-mono text-foreground/80">{cert.credentialId}</span>
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Verify
                      </Button>
                      <Button size="sm" variant="outline">
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button variant="hero" size="lg">
              <Award className="h-5 w-5 mr-2" />
              Add New Credential
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCredentials;
