import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Filter, Download, Mail } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Mock user data
  const users = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@email.com",
      role: "alumni",
      graduationYear: "2018",
      company: "Google",
      position: "Software Engineer",
      status: "active",
      avatar: null,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      role: "student",
      semester: "6th",
      branch: "Computer Science",
      cgpa: "8.5",
      status: "active",
      avatar: null,
    },
    {
      id: 3,
      name: "Michael Brown",
      email: "mbrown@email.com",
      role: "alumni",
      graduationYear: "2015",
      company: "Microsoft",
      position: "Senior Developer",
      status: "active",
      avatar: null,
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily.d@email.com",
      role: "student",
      semester: "4th",
      branch: "Electrical Engineering",
      cgpa: "9.2",
      status: "active",
      avatar: null,
    },
    {
      id: 5,
      name: "David Wilson",
      email: "dwilson@email.com",
      role: "alumni",
      graduationYear: "2020",
      company: "Amazon",
      position: "Product Manager",
      status: "active",
      avatar: null,
    },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-muted-foreground">
            Manage students and alumni in your network
          </p>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="alumni">Alumni</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Directory Table */}
        <Card>
          <CardHeader>
            <CardTitle>User Directory</CardTitle>
            <CardDescription>
              {filteredUsers.length} users found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar || undefined} />
                          <AvatarFallback>
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'alumni' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.role === 'alumni' ? (
                        <div className="text-sm">
                          <div>{user.company}</div>
                          <div className="text-muted-foreground">{user.position}</div>
                          <div className="text-muted-foreground">Class of {user.graduationYear}</div>
                        </div>
                      ) : (
                        <div className="text-sm">
                          <div>{user.branch}</div>
                          <div className="text-muted-foreground">Semester {user.semester}</div>
                          <div className="text-muted-foreground">CGPA: {user.cgpa}</div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-green-600">
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        View Profile
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
