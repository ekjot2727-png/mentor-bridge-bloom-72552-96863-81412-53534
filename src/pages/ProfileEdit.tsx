import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { AlertCircle, CheckCircle, Upload, X } from 'lucide-react';

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    phoneNumber: '',
    location: '',
    city: '',
    country: '',
    currentCompany: '',
    currentPosition: '',
    industry: '',
    skills: '',
    graduationYear: new Date().getFullYear(),
    degreeType: '',
    departmentOrCourse: '',
    yearsOfExperience: 0,
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    seekingMentorship: false,
    offeringMentorship: false,
    mentorshipTopics: '',
    headline: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) {
        navigate('/login');
        return;
      }

      const profile = await apiClient.getProfile(user.id);
      if (profile) {
        setFormData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          bio: profile.bio || '',
          phoneNumber: profile.phoneNumber || '',
          location: profile.location || '',
          city: profile.city || '',
          country: profile.country || '',
          currentCompany: profile.currentCompany || '',
          currentPosition: profile.currentPosition || '',
          industry: profile.industry || '',
          skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : profile.skills || '',
          graduationYear: profile.graduationYear || new Date().getFullYear(),
          degreeType: profile.degreeType || '',
          departmentOrCourse: profile.departmentOrCourse || '',
          yearsOfExperience: profile.yearsOfExperience || 0,
          linkedinUrl: profile.linkedinUrl || '',
          githubUrl: profile.githubUrl || '',
          portfolioUrl: profile.portfolioUrl || '',
          seekingMentorship: profile.seekingMentorship || false,
          offeringMentorship: profile.offeringMentorship || false,
          mentorshipTopics: profile.mentorshipTopics || '',
          headline: profile.headline || '',
        });
        if (profile.profilePhotoUrl) {
          setProfilePhoto(profile.profilePhotoUrl);
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      // Update profile data
      const updateData = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
      };

      await apiClient.updateProfile(user.id, updateData);

      // Upload photo if selected
      if (photoFile) {
        await apiClient.uploadProfilePhoto(user.id, photoFile);
      }

      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        navigate('/student-portal');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-3xl">Edit Your Profile</CardTitle>
            <CardDescription className="text-blue-100">
              Update your information and showcase your profile
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Photo Section */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profilePhoto || undefined} />
                  <AvatarFallback>
                    {formData.firstName[0]}{formData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <Button type="button" variant="outline" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                  </label>
                  {profilePhoto && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setProfilePhoto(null);
                        setPhotoFile(null);
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>

              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="professional">Professional</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                  <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
                </TabsList>

                {/* Basic Info Tab */}
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name</label>
                      <Input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Name</label>
                      <Input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Headline</label>
                    <Input
                      name="headline"
                      placeholder="e.g., Senior Software Engineer at Tech Company"
                      value={formData.headline}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Bio</label>
                    <Textarea
                      name="bio"
                      placeholder="Tell us about yourself..."
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <Input
                        name="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Country</label>
                      <Input
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">City</label>
                      <Input
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Location</label>
                      <Input
                        name="location"
                        placeholder="e.g., San Francisco, CA"
                        value={formData.location}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Professional Info Tab */}
                <TabsContent value="professional" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Company</label>
                    <Input
                      name="currentCompany"
                      value={formData.currentCompany}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Current Position</label>
                    <Input
                      name="currentPosition"
                      value={formData.currentPosition}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Industry</label>
                    <Input
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Years of Experience</label>
                    <Input
                      name="yearsOfExperience"
                      type="number"
                      min="0"
                      value={formData.yearsOfExperience}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Skills (comma-separated)</label>
                    <Textarea
                      name="skills"
                      placeholder="e.g., JavaScript, React, Node.js, PostgreSQL"
                      value={formData.skills}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">LinkedIn URL</label>
                      <Input
                        name="linkedinUrl"
                        type="url"
                        value={formData.linkedinUrl}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">GitHub URL</label>
                      <Input
                        name="githubUrl"
                        type="url"
                        value={formData.githubUrl}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Portfolio URL</label>
                      <Input
                        name="portfolioUrl"
                        type="url"
                        value={formData.portfolioUrl}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Education Tab */}
                <TabsContent value="education" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Degree Type</label>
                    <Input
                      name="degreeType"
                      placeholder="e.g., Bachelor's, Master's"
                      value={formData.degreeType}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Department / Course</label>
                    <Input
                      name="departmentOrCourse"
                      value={formData.departmentOrCourse}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Graduation Year</label>
                    <Input
                      name="graduationYear"
                      type="number"
                      min="1990"
                      max={new Date().getFullYear() + 5}
                      value={formData.graduationYear}
                      onChange={handleInputChange}
                    />
                  </div>
                </TabsContent>

                {/* Mentorship Tab */}
                <TabsContent value="mentorship" className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="seekingMentorship"
                      checked={formData.seekingMentorship}
                      onChange={handleInputChange}
                      id="seeking"
                      className="h-4 w-4"
                    />
                    <label htmlFor="seeking" className="text-sm font-medium cursor-pointer">
                      I'm seeking mentorship
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="offeringMentorship"
                      checked={formData.offeringMentorship}
                      onChange={handleInputChange}
                      id="offering"
                      className="h-4 w-4"
                    />
                    <label htmlFor="offering" className="text-sm font-medium cursor-pointer">
                      I'm willing to mentor others
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Mentorship Topics</label>
                    <Textarea
                      name="mentorshipTopics"
                      placeholder="e.g., Career guidance, Technical skills, Leadership"
                      value={formData.mentorshipTopics}
                      onChange={handleInputChange}
                      rows={4}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Saving...' : 'Save Profile'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
