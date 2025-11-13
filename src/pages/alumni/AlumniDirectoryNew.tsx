import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  MapPin,
  Building,
  Briefcase,
  Mail,
  User,
  Search,
  Filter,
  X,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface AlumniProfile {
  id: string;
  firstName: string;
  lastName: string;
  headline?: string;
  bio?: string;
  profilePhotoUrl?: string;
  location?: string;
  currentCompany?: string;
  currentPosition?: string;
  industry?: string;
  skills?: string[];
  graduationYear?: number;
  offeringMentorship?: boolean;
}

interface SearchFilters {
  keyword?: string;
  skills?: string[];
  company?: string;
  location?: string;
  graduationYear?: number;
  industry?: string;
  offeringMentorship?: boolean;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export default function AlumniDirectory() {
  const { toast } = useToast();
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filter state
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [industry, setIndustry] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadAlumni();
  }, [currentPage, filters]);

  const loadAlumni = async () => {
    try {
      setLoading(true);
      const response = await apiClient.searchAlumni(filters, currentPage, 12);
      setAlumni(response.data);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      toast({
        title: 'Error loading alumni',
        description: error instanceof Error ? error.message : 'Failed to load alumni',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const newFilters: SearchFilters = {
      sortBy,
      order,
    };

    if (keyword) newFilters.keyword = keyword;
    if (selectedSkills.length > 0) newFilters.skills = selectedSkills;
    if (company) newFilters.company = company;
    if (location) newFilters.location = location;
    if (graduationYear) newFilters.graduationYear = parseInt(graduationYear);
    if (industry) newFilters.industry = industry;

    setFilters(newFilters);
    setCurrentPage(1);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({});
    setKeyword('');
    setSelectedSkills([]);
    setCompany('');
    setLocation('');
    setGraduationYear('');
    setIndustry('');
    setSortBy('createdAt');
    setOrder('desc');
    setCurrentPage(1);
  };

  const addSkill = (skill: string) => {
    if (skill && !selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill));
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Alumni Directory</h1>
          <p className="text-muted-foreground text-lg">
            Discover and connect with {total} alumni from our network
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name, skills, company..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button onClick={applyFilters}>Search</Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Company Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Company</label>
                <Input
                  placeholder="e.g., Google, Microsoft"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <Input
                  placeholder="e.g., San Francisco, New York"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {/* Graduation Year Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Graduation Year</label>
                <Select value={graduationYear} onValueChange={setGraduationYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(30)].map((_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Industry Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Industry</label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="media">Media & Entertainment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium mb-2">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Recently Joined</SelectItem>
                    <SelectItem value="firstName">Name (A-Z)</SelectItem>
                    <SelectItem value="graduationYear">Graduation Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-medium mb-2">Order</label>
                <Select value={order} onValueChange={(v) => setOrder(v as 'asc' | 'desc')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Skills Filter */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Skills</label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add skill (e.g., Python, React)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addSkill((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-2 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex gap-2 mt-6">
              <Button onClick={applyFilters}>Apply Filters</Button>
              <Button variant="outline" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          </Card>
        )}

        {/* Active Filters Display */}
        {(Object.keys(filters).length > 0 || Object.values({ keyword, company, location, industry }).some(Boolean)) && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium">Active filters:</span>
              {keyword && (
                <Badge variant="secondary">
                  Keyword: {keyword}
                  <button
                    onClick={() => setKeyword('')}
                    className="ml-2 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {company && (
                <Badge variant="secondary">
                  Company: {company}
                  <button
                    onClick={() => setCompany('')}
                    className="ml-2 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {location && (
                <Badge variant="secondary">
                  Location: {location}
                  <button
                    onClick={() => setLocation('')}
                    className="ml-2 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {industry && (
                <Badge variant="secondary">
                  Industry: {industry}
                  <button
                    onClick={() => setIndustry('')}
                    className="ml-2 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Alumni Grid */}
        {loading ? (
          <div className="flex justify-center items-center min-h-96">
            <div className="text-lg text-muted-foreground">Loading alumni...</div>
          </div>
        ) : alumni.length === 0 ? (
          <div className="flex justify-center items-center min-h-96">
            <div className="text-center">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">No alumni found matching your filters</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {alumni.map((alumnus) => (
                <Card key={alumnus.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={alumnus.profilePhotoUrl} />
                        <AvatarFallback>
                          {alumnus.firstName[0]}
                          {alumnus.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">
                          {alumnus.firstName} {alumnus.lastName}
                        </h3>
                        <p className="text-sm text-primary">{alumnus.headline || 'Alumni'}</p>
                      </div>
                    </div>

                    {/* Bio */}
                    {alumnus.bio && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{alumnus.bio}</p>
                    )}

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      {alumnus.currentPosition && (
                        <div className="flex items-center gap-2 text-sm">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span>{alumnus.currentPosition}</span>
                        </div>
                      )}
                      {alumnus.currentCompany && (
                        <div className="flex items-center gap-2 text-sm">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{alumnus.currentCompany}</span>
                        </div>
                      )}
                      {alumnus.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{alumnus.location}</span>
                        </div>
                      )}
                      {alumnus.graduationYear && (
                        <div className="text-xs text-muted-foreground">
                          Class of {alumnus.graduationYear}
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    {alumnus.skills && alumnus.skills.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {alumnus.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {alumnus.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{alumnus.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Mentorship Badge */}
                    {alumnus.offeringMentorship && (
                      <div className="mb-4">
                        <Badge className="bg-green-100 text-green-800">Offering Mentorship</Badge>
                      </div>
                    )}

                    {/* Actions */}
                    <Button className="w-full" variant="default">
                      <Mail className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination>
                  <PaginationContent>
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationPrevious onClick={() => setCurrentPage(currentPage - 1)} />
                      </PaginationItem>
                    )}

                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pageNum = currentPage - 2 + i;
                      if (pageNum < 1 || pageNum > totalPages) return null;

                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNum)}
                            isActive={pageNum === currentPage}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    {currentPage < totalPages && (
                      <PaginationItem>
                        <PaginationNext onClick={() => setCurrentPage(currentPage + 1)} />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              </div>
            )}

            <div className="text-center mt-6 text-sm text-muted-foreground">
              Showing {(currentPage - 1) * 12 + 1} to {Math.min(currentPage * 12, total)} of {total} alumni
            </div>
          </>
        )}
      </div>
    </div>
  );
}
