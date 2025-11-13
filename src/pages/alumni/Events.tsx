import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar, MapPin, Users, Clock, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Events = () => {
  const navigate = useNavigate();

  const events = [
    {
      title: "Annual Alumni Meet 2025",
      date: "March 15, 2025",
      time: "10:00 AM - 6:00 PM",
      location: "JECRC Foundation Campus, Jaipur",
      type: "In-Person",
      attendees: 250,
      status: "Upcoming",
      description: "Join us for our annual alumni gathering. Network, share experiences, and reconnect with old friends.",
      highlights: ["Networking Session", "Panel Discussions", "Campus Tour", "Dinner Gala"]
    },
    {
      title: "Tech Talk: Future of AI",
      date: "February 28, 2025",
      time: "6:00 PM - 8:00 PM",
      location: "Virtual (Zoom)",
      type: "Virtual",
      attendees: 500,
      status: "Registration Open",
      description: "Industry experts discuss the latest trends and future of Artificial Intelligence.",
      highlights: ["Expert Speakers", "Q&A Session", "Networking Rooms"]
    },
    {
      title: "Career Guidance Workshop",
      date: "March 5, 2025",
      time: "3:00 PM - 5:00 PM",
      location: "JECRC University, Jaipur",
      type: "Hybrid",
      attendees: 150,
      status: "Upcoming",
      description: "Alumni share career insights and guidance for current students.",
      highlights: ["Resume Review", "Mock Interviews", "Industry Insights"]
    },
    {
      title: "Startup Pitch Day",
      date: "March 20, 2025",
      time: "11:00 AM - 4:00 PM",
      location: "Innovation Hub, Bangalore",
      type: "In-Person",
      attendees: 100,
      status: "Registration Open",
      description: "Alumni startups pitch to investors and fellow entrepreneurs.",
      highlights: ["Pitch Presentations", "Investor Meetings", "Networking Lunch"]
    },
    {
      title: "Sports Day 2025",
      date: "April 10, 2025",
      time: "9:00 AM - 5:00 PM",
      location: "JECRC Sports Complex",
      type: "In-Person",
      attendees: 200,
      status: "Upcoming",
      description: "A day of sports, fun, and team building with fellow alumni.",
      highlights: ["Cricket", "Football", "Basketball", "Awards Ceremony"]
    },
    {
      title: "Global Alumni Webinar",
      date: "February 25, 2025",
      time: "7:00 PM - 9:00 PM",
      location: "Virtual (Microsoft Teams)",
      type: "Virtual",
      attendees: 800,
      status: "Registration Open",
      description: "Connect with alumni from around the world in this global networking event.",
      highlights: ["Regional Breakout Rooms", "Success Stories", "Cultural Exchange"]
    }
  ];

  const getStatusColor = (status: string) => {
    if (status === "Registration Open") return "default";
    if (status === "Upcoming") return "secondary";
    return "outline";
  };

  const getTypeColor = (type: string) => {
    if (type === "Virtual") return "text-blue-500";
    if (type === "Hybrid") return "text-purple-500";
    return "text-green-500";
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

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 glass-effect px-6 py-3 rounded-full mb-4 border border-primary/20">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Institute Events</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 hero-text">Alumni Events</h1>
            <p className="text-lg text-foreground/70">Stay connected through networking events and gatherings</p>
          </div>

          <div className="grid gap-6">
            {events.map((event, index) => (
              <Card key={index} className="glass-effect p-6 border border-primary/20 hover:border-primary/40 transition-all">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold text-foreground mb-2">{event.title}</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant={getStatusColor(event.status)}>{event.status}</Badge>
                          <Badge variant="outline" className={getTypeColor(event.type)}>{event.type}</Badge>
                        </div>
                      </div>
                    </div>

                    <p className="text-foreground/70 mb-4">{event.description}</p>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-foreground/70">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground/70">
                        <Clock className="h-4 w-4 text-accent" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground/70">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground/70">
                        <Users className="h-4 w-4 text-accent" />
                        <span>{event.attendees} registered</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-foreground/80 mb-2">Event Highlights:</p>
                      <div className="flex flex-wrap gap-2">
                        {event.highlights.map((highlight, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {highlight}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {event.status === "Registration Open" && (
                        <Button variant="hero">
                          Register Now
                        </Button>
                      )}
                      <Button variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="ghost">Add to Calendar</Button>
                    </div>
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

export default Events;
