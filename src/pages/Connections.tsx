import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { MessageCircle, UserPlus, UserCheck, Trash2, Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Connection {
  id: string;
  connectedUserId: string;
  connectedUserEmail: string;
  connectedUserFirstName: string;
  connectedUserLastName: string;
  profilePhotoUrl?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  createdAt: string;
  connectedUserCompany?: string;
  connectedUserPosition?: string;
  connectedUserHeadline?: string;
}

export default function ConnectionsPage() {
  const navigate = useNavigate();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      navigate('/login');
      return;
    }
    setCurrentUser(user);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [connectionsData, pendingData] = await Promise.all([
        apiClient.getConnections(),
        apiClient.getPendingRequests(),
      ]);
      setConnections(connectionsData.filter((c: Connection) => c.status === 'accepted') || []);
      setPendingRequests(pendingData || []);
    } catch (err: any) {
      console.error('Failed to load connections:', err);
      setError(err.response?.data?.message || 'Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToRequest = async (connectionId: string, accepted: boolean) => {
    try {
      setLoading(true);
      await apiClient.respondToConnection(connectionId, accepted);
      setPendingRequests(prev => prev.filter(r => r.id !== connectionId));
      setSuccess(accepted ? 'Connection accepted!' : 'Connection declined');
      if (accepted) {
        await loadData();
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to respond to request');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (connection: Connection) => {
    // Navigate to messaging page - we'll handle conversation selection
    localStorage.setItem('selectedConversationId', connection.connectedUserId);
    navigate('/messages');
  };

  const handleRemoveConnection = async (connectionId: string) => {
    if (confirm('Are you sure you want to remove this connection?')) {
      try {
        setLoading(true);
        await apiClient.respondToConnection(connectionId, false);
        setConnections(prev => prev.filter(c => c.id !== connectionId));
        setSuccess('Connection removed');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to remove connection');
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredConnections = connections.filter(c =>
    `${c.connectedUserFirstName} ${c.connectedUserLastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.connectedUserEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequests = pendingRequests.filter(r =>
    `${r.connectedUserFirstName} ${r.connectedUserLastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="connections" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="connections">
              Connections ({connections.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending Requests ({pendingRequests.length})
            </TabsTrigger>
          </TabsList>

          {/* Connections Tab */}
          <TabsContent value="connections">
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="text-2xl">Your Connections</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search connections..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {filteredConnections.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No connections yet</p>
                    <p className="text-gray-400 text-sm">Send connection requests to get started!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredConnections.map((connection) => (
                      <Card key={connection.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex flex-col items-center text-center mb-4">
                            <Avatar className="h-16 w-16 mb-3">
                              <AvatarImage src={connection.profilePhotoUrl} />
                              <AvatarFallback>
                                {connection.connectedUserFirstName[0]}{connection.connectedUserLastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <h3 className="font-semibold text-lg">
                              {connection.connectedUserFirstName} {connection.connectedUserLastName}
                            </h3>
                            <p className="text-xs text-gray-500 mb-2">{connection.connectedUserEmail}</p>
                            {connection.connectedUserHeadline && (
                              <p className="text-sm text-gray-600 mb-3">{connection.connectedUserHeadline}</p>
                            )}
                            {connection.connectedUserPosition && (
                              <Badge variant="outline" className="mb-2">
                                {connection.connectedUserPosition}
                              </Badge>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleSendMessage(connection)}
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                            <Button
                              onClick={() => handleRemoveConnection(connection.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Requests Tab */}
          <TabsContent value="pending">
            <Card>
              <CardHeader className="bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-t-lg">
                <CardTitle className="text-2xl">Pending Connection Requests</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search pending requests..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {filteredRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No pending requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRequests.map((request) => (
                      <Card key={request.id} className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={request.profilePhotoUrl} />
                              <AvatarFallback>
                                {request.connectedUserFirstName[0]}{request.connectedUserLastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-semibold">
                                {request.connectedUserFirstName} {request.connectedUserLastName}
                              </h3>
                              <p className="text-sm text-gray-500">{request.connectedUserEmail}</p>
                              {request.connectedUserPosition && (
                                <p className="text-sm text-gray-600">{request.connectedUserPosition}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleRespondToRequest(request.id, true)}
                              disabled={loading}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              onClick={() => handleRespondToRequest(request.id, false)}
                              disabled={loading}
                              variant="outline"
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
