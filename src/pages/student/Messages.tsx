// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Messages = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      subscribeToMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // @ts-ignore
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setCurrentUser(profile);
    }
  };

  const fetchConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // @ts-ignore
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant1:profiles!conversations_participant1_id_fkey(*),
        participant2:profiles!conversations_participant2_id_fkey(*)
      `)
      .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return;
    }

    setConversations(data || []);
  };

  const fetchMessages = async (conversationId: string) => {
    // @ts-ignore
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles(*)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data || []);
  };

  const subscribeToMessages = (conversationId: string) => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    // @ts-ignore
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: selectedConversation,
        sender_id: currentUser.id,
        content: newMessage.trim(),
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      return;
    }

    setNewMessage("");
  };

  const getOtherParticipant = (conversation: any) => {
    if (!currentUser) return null;
    return conversation.participant1_id === currentUser.id
      ? conversation.participant2
      : conversation.participant1;
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="glass-effect p-4">
            <h2 className="text-xl font-semibold mb-4">Conversations</h2>
            <ScrollArea className="h-[calc(100%-3rem)]">
              {conversations.map((conversation) => {
                const other = getOtherParticipant(conversation);
                return (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation === conversation.id
                        ? 'bg-primary/20'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Avatar>
                      <AvatarImage src={other?.avatar_url} />
                      <AvatarFallback>{other?.full_name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{other?.full_name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {other?.position || other?.student_id}
                      </p>
                    </div>
                  </div>
                );
              })}
            </ScrollArea>
          </Card>

          {/* Messages Area */}
          <Card className="glass-effect p-4 md:col-span-2">
            {selectedConversation ? (
              <>
                <ScrollArea className="h-[calc(100%-5rem)] mb-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.sender_id === currentUser?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Select a conversation to start messaging
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messages;
