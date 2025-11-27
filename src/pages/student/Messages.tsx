// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
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
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchCurrentUser = async () => {
    try {
      const profile = await apiClient.getMyProfile();
      setCurrentUser(profile);
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const data = await apiClient.getMessages();
      // Group messages by conversation partner
      const conversationsMap = new Map();
      data.forEach((msg: any) => {
        const partnerId = msg.sender?.id === currentUser?.id ? msg.receiver?.id : msg.sender?.id;
        const partner = msg.sender?.id === currentUser?.id ? msg.receiver : msg.sender;
        if (partnerId && !conversationsMap.has(partnerId)) {
          conversationsMap.set(partnerId, {
            id: partnerId,
            participant: partner,
            lastMessage: msg
          });
        }
      });
      setConversations(Array.from(conversationsMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const data = await apiClient.getConversation(userId);
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    try {
      await apiClient.sendMessage(selectedConversation, newMessage.trim());
      setNewMessage("");
      // Refresh messages
      fetchMessages(selectedConversation);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
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
              {conversations.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No conversations yet</p>
              ) : (
                conversations.map((conversation) => {
                  const other = conversation.participant;
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
                        <AvatarImage src={other?.avatarUrl} />
                        <AvatarFallback>{other?.firstName?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {other?.firstName} {other?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage?.content}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
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
                          message.sender?.id === currentUser?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.sender?.id === currentUser?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.createdAt).toLocaleTimeString()}
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
