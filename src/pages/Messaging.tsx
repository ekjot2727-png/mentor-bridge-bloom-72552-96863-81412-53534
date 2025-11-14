import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { Send, Plus, Search, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Message {
  id: string;
  senderId: string;
  senderEmail: string;
  receiverId: string;
  content: string;
  status: 'sent' | 'delivered' | 'read';
  createdAt: string;
  updatedAt: string;
}

interface Conversation {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  profilePhotoUrl?: string;
}

export default function MessagingPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      navigate('/login');
      return;
    }
    setCurrentUser(user);
    loadConversations();

    // Poll for new messages every 2 seconds
    const interval = setInterval(() => {
      if (selectedConversation) {
        loadMessages(selectedConversation.userId);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Get all connections
      const connections = await apiClient.getConnections(user.id);
      
      // Build conversation list from connections
      const convos: Conversation[] = connections.map((conn: any) => ({
        userId: conn.connectedUserId,
        email: conn.connectedUserEmail,
        firstName: conn.connectedUserFirstName || 'User',
        lastName: conn.connectedUserLastName || '',
        unreadCount: 0,
        profilePhotoUrl: conn.profilePhotoUrl,
      }));
      
      setConversations(convos);
    } catch (err: any) {
      console.error('Failed to load conversations:', err);
      setError(err.response?.data?.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (otherUserId: string) => {
    try {
      const msgData = await apiClient.getConversation(otherUserId);
      setMessages(msgData || []);

      // Auto-scroll to bottom
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error('Failed to load messages:', err);
      setError(err.response?.data?.message || 'Failed to load messages');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      const newMessage = await apiClient.sendMessage(
        selectedConversation.userId,
        messageInput.trim()
      );

      setMessages(prev => [...prev, newMessage]);
      setMessageInput('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      // Since deleteMessage doesn't exist in API, we'll just remove from UI
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete message');
    }
  };

  const filteredConversations = conversations.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto h-[calc(100vh-100px)]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full">
          {/* Conversations List */}
          <Card className="md:col-span-1 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Messages</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-3 space-y-3">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  {filteredConversations.map((conversation) => (
                    <button
                      key={conversation.userId}
                      onClick={() => {
                        setSelectedConversation(conversation);
                        loadMessages(conversation.userId);
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedConversation?.userId === conversation.userId
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conversation.profilePhotoUrl} />
                          <AvatarFallback>
                            {conversation.firstName[0]}{conversation.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {conversation.firstName} {conversation.lastName}
                          </p>
                          <p className="text-xs truncate opacity-75">
                            {conversation.lastMessage || 'No messages yet'}
                          </p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages Area */}
          <Card className="md:col-span-3 flex flex-col">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={selectedConversation.profilePhotoUrl} />
                        <AvatarFallback>
                          {selectedConversation.firstName[0]}{selectedConversation.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {selectedConversation.firstName} {selectedConversation.lastName}
                        </CardTitle>
                        <p className="text-xs text-gray-500">{selectedConversation.email}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-hidden p-4 flex flex-col">
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <ScrollArea className="flex-1 mb-4">
                    <div className="space-y-3">
                      {messages.map((message) => {
                        const isOwn = message.senderId === currentUser?.id;
                        return (
                          <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isOwn
                                  ? 'bg-blue-500 text-white rounded-br-none'
                                  : 'bg-gray-200 text-gray-900 rounded-bl-none'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <div className="flex items-center justify-between gap-2 mt-1">
                                <p className="text-xs opacity-75">
                                  {new Date(message.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                                {isOwn && (
                                  <>
                                    <span className="text-xs opacity-75">
                                      {message.status === 'read' ? '✓✓' : '✓'}
                                    </span>
                                    <button
                                      onClick={() => handleDeleteMessage(message.id)}
                                      className="hover:opacity-75"
                                      title="Delete message"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={scrollRef} />
                    </div>
                  </ScrollArea>

                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a message..."
                      disabled={loading}
                    />
                    <Button
                      type="submit"
                      disabled={loading || !messageInput.trim()}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
