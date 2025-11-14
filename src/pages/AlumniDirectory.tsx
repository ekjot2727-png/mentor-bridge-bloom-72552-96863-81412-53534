import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { MessageCircle, UserPlus, MapPin, Briefcase, GraduationCap, Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AlumniProfile {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  headline?: string;
  bio?: string;
  profilePhotoUrl?: string;
  currentCompany?: string;
  currentPosition?: string;
  industry?: string;
  location?: string;
  city?: string;
  country?: string;
  skills?: string[];
  yearsOfExperience?: number;
  graduationYear?: number;
  departmentOrCourse?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

interface Filters {
  company: string;
  position: string;
  location: string;
  skills: string;
  industry: string;
  yearsOfExperience: string;
  graduationYear: string;
}

export default function AlumniDirectoryPage() {
  const navigate = useNavigate();
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [filteredAlumni, setFilteredAlumni] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [filters, setFilters] = useState<Filters>({
    company: '',
    position: '',
    location: '',
    skills: '',
    industry: '',
    yearsOfExperience: '',
    graduationYear: '',
  });

  useEffect(() => {
    loadAlumni();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [alumni, filters, searchQuery]);

  const loadAlumni = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAlumniDirectory(1, 100);
      setAlumni(data || []);
    } catch (err: any) {
      console.error('Failed to load alumni:', err);
      setError(err.response?.data?.message || 'Failed to load alumni directory');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = alumni;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(a =>
        `${a.firstName} ${a.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.headline?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Company filter
    if (filters.company) {
      filtered = filtered.filter(a =>
        a.currentCompany?.toLowerCase().includes(filters.company.toLowerCase())
      );
    }

    // Position filter
    if (filters.position) {
      filtered = filtered.filter(a =>
        a.currentPosition?.toLowerCase().includes(filters.position.toLowerCase())
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(a =>
        (a.city?.toLowerCase().includes(filters.location.toLowerCase()) ||
          a.country?.toLowerCase().includes(filters.location.toLowerCase()) ||
          a.location?.toLowerCase().includes(filters.location.toLowerCase()))
      );
    }

    // Industry filter
    if (filters.industry) {
      filtered = filtered.filter(a =>
        a.industry?.toLowerCase().includes(filters.industry.toLowerCase())
      );
    }

    // Skills filter
    if (filters.skills) {
      const skillsArray = filters.skills.split(',').map(s => s.trim().toLowerCase());
      filtered = filtered.filter(a =>
        a.skills?.some(skill =>
          skillsArray.some(filterSkill => skill.toLowerCase().includes(filterSkill))
        )
      );
    }

    // Years of experience filter
    if (filters.yearsOfExperience) {
      const minYears = parseInt(filters.yearsOfExperience);
      filtered = filtered.filter(a => (a.yearsOfExperience || 0) >= minYears);
    }

    // Graduation year filter
    if (filters.graduationYear) {
      const year = parseInt(filters.graduationYear);
      filtered = filtered.filter(a => a.graduationYear === year);
    }

    setFilteredAlumni(filtered);
  };

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSendConnectionRequest = async (alumniId: string) => {
    try {
      setLoading(true);
      await apiClient.sendConnectionRequest(alumniId, 'I would like to connect with you');
      setSuccess('Connection request sent!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send connection request');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      company: '',
      position: '',
      location: '',
      skills: '',
      industry: '',
      yearsOfExperience: '',
      graduationYear: '',
    });
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
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

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Alumni Directory</h1>
          <p className="text-gray-600">Connect with alumni and build your professional network</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Filters</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="md:hidden"
                  >
                    {showFilters ? 'Hide' : 'Show'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className={`space-y-4 ${!showFilters && 'hidden md:block'}`}>
                <div>
                  <label className="block text-sm font-medium mb-2">Company</label>
                  <Input
                    placeholder="Filter by company"
                    value={filters.company}
                    onChange={(e) => handleFilterChange('company', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Position</label>
                  <Input
                    placeholder="Filter by position"
                    value={filters.position}
                    onChange={(e) => handleFilterChange('position', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <Input
                    placeholder="Filter by location"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Industry</label>
                  <Input
                    placeholder="Filter by industry"
                    value={filters.industry}
                    onChange={(e) => handleFilterChange('industry', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Skills (comma-separated)</label>
                  <Input
                    placeholder="e.g., Python, React"
                    value={filters.skills}
                    onChange={(e) => handleFilterChange('skills', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Min Years of Experience</label>
                  <Input
                    type="number"
                    placeholder="Years"
                    value={filters.yearsOfExperience}
                    onChange={(e) => handleFilterChange('yearsOfExperience', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Graduation Year</label>
                  <Input
                    type="number"
                    placeholder="Year"
                    value={filters.graduationYear}
                    onChange={(e) => handleFilterChange('graduationYear', e.target.value)}
                  />
                </div>

                <Separator />

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={resetFilters}
                >
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Alumni Grid */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">
                    Alumni ({filteredAlumni.length})
                  </CardTitle>
                  <div className="relative flex-1 ml-4 max-w-xs">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-white opacity-50" />
                    <Input
                      placeholder="Search alumni..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white bg-opacity-20 border-white border-opacity-30 text-white placeholder:text-white placeholder:opacity-50"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Loading alumni...</p>
                  </div>
                ) : filteredAlumni.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No alumni found matching your filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredAlumni.map((alumnus) => (
                      <Card key={alumnus.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16 flex-shrink-0">
                              <AvatarImage src={alumnus.profilePhotoUrl} />
                              <AvatarFallback>
                                {alumnus.firstName[0]}{alumnus.lastName[0]}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg truncate">
                                {alumnus.firstName} {alumnus.lastName}
                              </h3>
                              {alumnus.headline && (
                                <p className="text-sm text-gray-600 mb-2">{alumnus.headline}</p>
                              )}

                              <div className="space-y-1 text-sm text-gray-600 mb-2">
                                {alumnus.currentCompany && (
                                  <div className="flex items-center gap-2">
                                    <Briefcase className="h-3 w-3" />
                                    <span>{alumnus.currentPosition} at {alumnus.currentCompany}</span>
                                  </div>
                                )}
                                {alumnus.location && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-3 w-3" />
                                    <span>{alumnus.location}</span>
                                  </div>
                                )}
                                {alumnus.graduationYear && (
                                  <div className="flex items-center gap-2">
                                    <GraduationCap className="h-3 w-3" />
                                    <span>Graduated {alumnus.graduationYear}</span>
                                  </div>
                                )}
                              </div>

                              {alumnus.skills && alumnus.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {alumnus.skills.slice(0, 3).map((skill, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {alumnus.skills.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{alumnus.skills.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}

                              <div className="flex gap-2 pt-2 border-t">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 text-xs"
                                  onClick={() => handleSendConnectionRequest(alumnus.userId)}
                                  disabled={loading}
                                >
                                  <UserPlus className="h-3 w-3 mr-1" />
                                  Connect
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="flex-1 text-xs"
                                >
                                  <MessageCircle className="h-3 w-3 mr-1" />
                                  View Profile
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
