import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MessagePreviewProps {
  userType: "student" | "alumni";
}

const MessagePreview = ({ userType }: MessagePreviewProps) => {
  const navigate = useNavigate();

  return (
    <Card className="glass-effect p-6 border border-border/30">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Messages
        </h2>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(userType === 'student' ? '/student/messages' : '/alumni/messages')}
        >
          View All
        </Button>
      </div>

      <div className="text-center py-6">
        <MessageSquare className="h-12 w-12 text-foreground/30 mx-auto mb-3" />
        <p className="text-foreground/60 text-sm mb-4">
          Connect with {userType === 'student' ? 'alumni and mentors' : 'students and fellow alumni'}
        </p>
        <Button 
          variant="hero" 
          size="sm"
          onClick={() => navigate(userType === 'student' ? '/student/messages' : '/alumni/messages')}
        >
          <Send className="h-4 w-4 mr-2" />
          Open Messages
        </Button>
      </div>
    </Card>
  );
};

export default MessagePreview;
