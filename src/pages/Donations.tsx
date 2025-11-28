import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Heart, Gift, Trophy, Users, GraduationCap, Sparkles, CreditCard, Building2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const PRESET_AMOUNTS = [25, 50, 100, 250, 500, 1000];

const DONATION_PURPOSES = [
  { id: 'scholarship', label: 'Student Scholarships', icon: GraduationCap, description: 'Help deserving students achieve their dreams' },
  { id: 'events', label: 'Alumni Events', icon: Users, description: 'Fund networking events and reunions' },
  { id: 'infrastructure', label: 'Platform Development', icon: Building2, description: 'Support technology improvements' },
  { id: 'general', label: 'General Fund', icon: Heart, description: 'Support where needed most' },
];

interface DonationFormData {
  amount: number;
  customAmount: string;
  purpose: string;
  isRecurring: boolean;
  frequency: 'monthly' | 'quarterly' | 'annually';
  message: string;
  isAnonymous: boolean;
}

export default function Donations() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [donationType, setDonationType] = useState<'one-time' | 'recurring'>('one-time');
  
  const [formData, setFormData] = useState<DonationFormData>({
    amount: 100,
    customAmount: '',
    purpose: 'general',
    isRecurring: false,
    frequency: 'monthly',
    message: '',
    isAnonymous: false,
  });

  const getToken = () => localStorage.getItem('accessToken');
  
  const currentAmount = formData.customAmount 
    ? parseFloat(formData.customAmount) || 0 
    : formData.amount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = getToken();
    if (!token) {
      toast({
        title: 'Please log in',
        description: 'You need to be logged in to make a donation.',
        variant: 'destructive',
      });
      navigate('/portal-selection');
      return;
    }

    if (currentAmount < 1) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid donation amount.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = donationType === 'recurring' 
        ? `${API_URL}/api/donations/subscription`
        : `${API_URL}/api/donations`;

      const body = donationType === 'recurring'
        ? {
            amount: currentAmount * 100, // Convert to cents
            currency: 'usd',
            interval: formData.frequency === 'monthly' ? 'month' : formData.frequency === 'quarterly' ? 'month' : 'year',
            intervalCount: formData.frequency === 'quarterly' ? 3 : 1,
            purpose: formData.purpose,
            message: formData.message || undefined,
            isAnonymous: formData.isAnonymous,
          }
        : {
            amount: currentAmount * 100, // Convert to cents
            currency: 'usd',
            type: 'one_time',
            purpose: formData.purpose,
            message: formData.message || undefined,
            isAnonymous: formData.isAnonymous,
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to process donation');
      }

      const data = await response.json();
      
      // In production, redirect to Stripe checkout
      if (data.clientSecret || data.url) {
        toast({
          title: 'Redirecting to payment...',
          description: 'You will be redirected to complete your donation.',
        });
        // window.location.href = data.url; // Stripe checkout URL
      } else {
        toast({
          title: 'Thank you for your generosity! 🎉',
          description: `Your $${currentAmount} donation has been processed.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Donation failed',
        description: 'There was an error processing your donation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Heart className="h-3 w-3 mr-1" />
            Support Our Community
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Make a Difference Today</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your generous contribution helps us support students, organize events, 
            and build a stronger alumni network.
          </p>
        </div>

        {/* Impact Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-3xl font-bold">500+</h3>
              <p className="text-muted-foreground">Scholarships Awarded</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-3xl font-bold">10,000+</h3>
              <p className="text-muted-foreground">Alumni Connected</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-3xl font-bold">$2M+</h3>
              <p className="text-muted-foreground">Total Raised</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Donation Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Make a Donation
                </CardTitle>
                <CardDescription>
                  Choose your donation amount and frequency
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  {/* Donation Type Tabs */}
                  <Tabs 
                    value={donationType} 
                    onValueChange={(v) => setDonationType(v as 'one-time' | 'recurring')}
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="one-time">One-Time</TabsTrigger>
                      <TabsTrigger value="recurring">
                        <Sparkles className="h-4 w-4 mr-1" />
                        Recurring
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="recurring" className="mt-4">
                      <div className="space-y-2">
                        <Label>Frequency</Label>
                        <RadioGroup
                          value={formData.frequency}
                          onValueChange={(v) => setFormData({ ...formData, frequency: v as any })}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="monthly" id="monthly" />
                            <Label htmlFor="monthly">Monthly</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="quarterly" id="quarterly" />
                            <Label htmlFor="quarterly">Quarterly</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="annually" id="annually" />
                            <Label htmlFor="annually">Annually</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Preset Amounts */}
                  <div className="space-y-2">
                    <Label>Select Amount</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {PRESET_AMOUNTS.map((amount) => (
                        <Button
                          key={amount}
                          type="button"
                          variant={formData.amount === amount && !formData.customAmount ? 'default' : 'outline'}
                          className="h-12"
                          onClick={() => setFormData({ ...formData, amount, customAmount: '' })}
                        >
                          ${amount}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="customAmount">Or Enter Custom Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="customAmount"
                        type="number"
                        min="1"
                        placeholder="Enter amount"
                        className="pl-7"
                        value={formData.customAmount}
                        onChange={(e) => setFormData({ ...formData, customAmount: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Purpose Selection */}
                  <div className="space-y-2">
                    <Label>Donation Purpose</Label>
                    <RadioGroup
                      value={formData.purpose}
                      onValueChange={(v) => setFormData({ ...formData, purpose: v })}
                      className="grid grid-cols-2 gap-3"
                    >
                      {DONATION_PURPOSES.map((purpose) => (
                        <div key={purpose.id} className="relative">
                          <RadioGroupItem
                            value={purpose.id}
                            id={purpose.id}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={purpose.id}
                            className="flex flex-col items-start gap-1 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <purpose.icon className="h-4 w-4" />
                              <span className="font-medium">{purpose.label}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {purpose.description}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Personal Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">Personal Message (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Leave a message with your donation..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={3}
                    />
                  </div>

                  {/* Anonymous Checkbox */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={formData.isAnonymous}
                      onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="anonymous" className="text-sm font-normal">
                      Make my donation anonymous
                    </Label>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                  <div className="w-full p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total {donationType === 'recurring' ? `(${formData.frequency})` : ''}</span>
                      <span className="text-2xl font-bold">${currentAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <Button type="submit" size="lg" className="w-full" disabled={isLoading || currentAmount < 1}>
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        {donationType === 'recurring' ? 'Start Recurring Donation' : 'Complete Donation'}
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    Payments are securely processed via Stripe. Your donation may be tax-deductible.
                  </p>
                </CardFooter>
              </form>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Featured Campaign */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader>
                <Badge className="w-fit mb-2">Featured Campaign</Badge>
                <CardTitle>2024 Scholarship Fund</CardTitle>
                <CardDescription>
                  Help us reach our goal of funding 50 new scholarships this year.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>$75,000 raised</span>
                    <span>$100,000 goal</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '75%' }} />
                  </div>
                  <p className="text-xs text-muted-foreground">1,250 donors</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Donors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Donors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Sarah M.', amount: 500, message: 'For future engineers!' },
                  { name: 'Anonymous', amount: 100, message: '' },
                  { name: 'John D.', amount: 250, message: 'Proud alumnus' },
                  { name: 'Lisa K.', amount: 1000, message: 'Keep up the great work' },
                ].map((donor, index) => (
                  <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {donor.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{donor.name}</span>
                        <span className="text-sm text-primary font-medium">${donor.amount}</span>
                      </div>
                      {donor.message && (
                        <p className="text-xs text-muted-foreground truncate">{donor.message}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Why Donate */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Why Donate?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>✓ 100% of donations go to programs</p>
                <p>✓ Tax-deductible contributions</p>
                <p>✓ Secure payment processing</p>
                <p>✓ Recognition in donor wall</p>
                <p>✓ Direct impact on students</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
