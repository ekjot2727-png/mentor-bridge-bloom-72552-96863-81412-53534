import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Feedback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit feedback.",
        variant: "destructive",
      });
      navigate('/portal-selection');
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-feedback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            rating,
            description,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      toast({
        title: "Feedback Submitted!",
        description: "Thank you for helping us improve.",
      });
      
      setDescription("");
      setRating(0);
    } catch (error: any) {
      console.error('Feedback submission error:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-6 py-12">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 hero-text">
              Share Your Feedback
            </h1>
            <p className="text-xl text-foreground/80">
              Help us improve AlNet for everyone
            </p>
          </div>

          <Card className="glass-effect p-8 md:p-12 border border-primary/20">
            {!isAuthenticated && (
              <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
                <p className="text-sm text-foreground/80">
                  Please log in to submit feedback. <button onClick={() => navigate('/portal-selection')} className="text-accent underline">Go to login</button>
                </p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-8">

              <div className="space-y-3">
                <Label>Rating *</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-10 w-10 ${
                          star <= (hoveredRating || rating)
                            ? "fill-primary text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-foreground/60">
                  {rating === 0 && "Please select a rating"}
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us more about your experience..."
                  rows={6}
                  required
                />
              </div>

              <Button 
                type="submit" 
                variant="hero" 
                size="lg" 
                className="w-full text-lg py-4 h-auto"
                disabled={rating === 0 || loading || !isAuthenticated}
              >
                {loading ? "Submitting..." : "Submit Feedback"}
              </Button>
            </form>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-foreground/60">
              Your feedback is valuable and helps us create a better experience for all users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
