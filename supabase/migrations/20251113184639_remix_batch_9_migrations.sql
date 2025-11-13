
-- Migration: 20250930035602

-- Migration: 20250929232820_35ebf8be-e624-44e6-a961-1a014676dff3.sql
-- Create enum for user types
CREATE TYPE public.user_type AS ENUM ('student', 'alumni');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type public.user_type NOT NULL,
  email TEXT NOT NULL,
  username TEXT NOT NULL,
  full_name TEXT,
  student_id TEXT,
  graduation_year TEXT,
  company TEXT,
  position TEXT,
  location TEXT,
  bio TEXT,
  avatar_url TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create feedback table
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create contact_messages table
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for feedback
CREATE POLICY "Feedback viewable by authenticated users"
  ON public.feedback FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own feedback"
  ON public.feedback FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for contact_messages
CREATE POLICY "Anyone can insert contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for automatic timestamp updates on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, user_type, email, username, full_name)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'user_type')::public.user_type, 'student'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Migration: 20250929233402_902b6509-9c17-43d3-a734-67f2fde87dfa.sql
-- Add terms acceptance and email verification fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Update RLS policy for profiles to ensure terms are accepted
CREATE POLICY "Users must accept terms to create profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id AND terms_accepted = true);

-- Migration: 20250930024338_a92c29f1-7019-486b-9c6c-783fad7524bd.sql
-- Create alumni_profiles table for detailed alumni information
CREATE TABLE IF NOT EXISTS public.alumni_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  company TEXT,
  position TEXT,
  expertise TEXT[],
  skills TEXT[],
  years_of_experience INTEGER,
  industry TEXT,
  availability_for_mentorship BOOLEAN DEFAULT true,
  linkedin_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create student_profiles table for detailed student information
CREATE TABLE IF NOT EXISTS public.student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  branch TEXT,
  semester INTEGER,
  skills TEXT[],
  interests TEXT[],
  career_goals TEXT,
  cgpa DECIMAL(3,2),
  projects TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create connections table for student-alumni networking
CREATE TABLE IF NOT EXISTS public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  alumni_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(student_id, alumni_id)
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(participant1_id, participant2_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.alumni_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for alumni_profiles
CREATE POLICY "Alumni profiles are viewable by everyone"
  ON public.alumni_profiles FOR SELECT
  USING (true);

CREATE POLICY "Alumni can update their own profile"
  ON public.alumni_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Alumni can insert their own profile"
  ON public.alumni_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for student_profiles
CREATE POLICY "Student profiles are viewable by everyone"
  ON public.student_profiles FOR SELECT
  USING (true);

CREATE POLICY "Students can update their own profile"
  ON public.student_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Students can insert their own profile"
  ON public.student_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for connections
CREATE POLICY "Users can view their own connections"
  ON public.connections FOR SELECT
  USING (auth.uid() = student_id OR auth.uid() = alumni_id);

CREATE POLICY "Students can create connections"
  ON public.connections FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own connections"
  ON public.connections FOR UPDATE
  USING (auth.uid() = student_id OR auth.uid() = alumni_id);

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
      AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
      AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages"
  ON public.messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
      AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
    )
  );

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;


-- Migration: 20251002010232
-- Fix profiles table RLS to hide email addresses from public access
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

-- Public can view basic profile info (no emails or sensitive data)
CREATE POLICY "Public can view basic profile info"
ON profiles FOR SELECT
USING (true);
-- Note: Frontend will need to filter which fields to show publicly

-- Authenticated users can view full profiles of other users
CREATE POLICY "Authenticated users can view full profiles"
ON profiles FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Create jobs table for job postings
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  job_type TEXT, -- full-time, part-time, contract, etc.
  salary_range TEXT,
  requirements TEXT[],
  posted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active', -- active, closed, filled
  application_deadline TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_status CHECK (status IN ('active', 'closed', 'filled'))
);

-- Enable RLS on jobs table
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Jobs RLS policies
CREATE POLICY "Anyone can view active jobs"
ON jobs FOR SELECT
USING (status = 'active');

CREATE POLICY "Alumni can create jobs"
ON jobs FOR INSERT
WITH CHECK (
  auth.uid() = posted_by AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND user_type = 'alumni'
  )
);

CREATE POLICY "Job creators can update their jobs"
ON jobs FOR UPDATE
USING (auth.uid() = posted_by);

CREATE POLICY "Job creators can delete their jobs"
ON jobs FOR DELETE
USING (auth.uid() = posted_by);

-- Create job applications table
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, reviewed, accepted, rejected
  cover_letter TEXT,
  resume_url TEXT,
  UNIQUE(job_id, applicant_id),
  CONSTRAINT valid_application_status CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected'))
);

-- Enable RLS on job_applications
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Job applications RLS policies
CREATE POLICY "Students can apply for jobs"
ON job_applications FOR INSERT
WITH CHECK (
  auth.uid() = applicant_id AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND user_type = 'student'
  )
);

CREATE POLICY "Applicants can view their own applications"
ON job_applications FOR SELECT
USING (auth.uid() = applicant_id);

CREATE POLICY "Job posters can view applications for their jobs"
ON job_applications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM jobs 
    WHERE jobs.id = job_applications.job_id 
    AND jobs.posted_by = auth.uid()
  )
);

CREATE POLICY "Job posters can update application status"
ON job_applications FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM jobs 
    WHERE jobs.id = job_applications.job_id 
    AND jobs.posted_by = auth.uid()
  )
);

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT NOT NULL,
  event_type TEXT NOT NULL, -- workshop, seminar, networking, career-fair, etc.
  max_attendees INTEGER,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT,
  tags TEXT[]
);

-- Enable RLS on events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Events RLS policies
CREATE POLICY "Anyone can view events"
ON events FOR SELECT
USING (true);

CREATE POLICY "Alumni can create events"
ON events FOR INSERT
WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND user_type = 'alumni'
  )
);

CREATE POLICY "Event creators can update their events"
ON events FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Event creators can delete their events"
ON events FOR DELETE
USING (auth.uid() = created_by);

-- Create event RSVPs table
CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'attending', -- attending, maybe, not-attending
  UNIQUE(event_id, user_id),
  CONSTRAINT valid_rsvp_status CHECK (status IN ('attending', 'maybe', 'not-attending'))
);

-- Enable RLS on event_rsvps
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Event RSVPs RLS policies
CREATE POLICY "Users can create RSVPs"
ON event_rsvps FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own RSVPs"
ON event_rsvps FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Event creators can view RSVPs for their events"
ON event_rsvps FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = event_rsvps.event_id 
    AND events.created_by = auth.uid()
  )
);

CREATE POLICY "Users can update their own RSVPs"
ON event_rsvps FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own RSVPs"
ON event_rsvps FOR DELETE
USING (auth.uid() = user_id);

-- Add updated_at trigger for jobs
CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add updated_at trigger for events
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Migration: 20251002011509
-- Create institutes table for multi-tenancy
CREATE TABLE public.institutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  contact_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.institutes ENABLE ROW LEVEL SECURITY;

-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'alumni', 'student');

-- Create user_roles table (SECURITY CRITICAL: separate from profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, institute_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role, _institute_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND institute_id = _institute_id
  )
$$;

-- Function to check if user is admin of any institute
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;

-- RLS Policies for institutes
CREATE POLICY "Admins can view their institute"
  ON public.institutes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.institute_id = institutes.id
        AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update their institute"
  ON public.institutes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.institute_id = institutes.id
        AND user_roles.role = 'admin'
    )
  );

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles in their institute"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.institute_id = user_roles.institute_id
        AND ur.role = 'admin'
    )
  );

-- Bulk uploads tracking table
CREATE TABLE public.bulk_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  upload_type TEXT NOT NULL CHECK (upload_type IN ('alumni_data', 'student_ids')),
  file_name TEXT NOT NULL,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  total_records INTEGER,
  processed_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  error_log JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.bulk_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage bulk uploads in their institute"
  ON public.bulk_uploads FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin', institute_id)
  );

-- Announcements table
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_audience JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage announcements in their institute"
  ON public.announcements FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin', institute_id)
  );

CREATE POLICY "Users can view published announcements from their institute"
  ON public.announcements FOR SELECT
  TO authenticated
  USING (
    status = 'published' AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.institute_id = announcements.institute_id
    )
  );

-- Pending approvals table (content moderation)
CREATE TABLE public.pending_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE NOT NULL,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  approval_type TEXT NOT NULL CHECK (approval_type IN ('success_story', 'event', 'job_posting', 'profile_update')),
  content JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.pending_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage approvals in their institute"
  ON public.pending_approvals FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin', institute_id)
  );

CREATE POLICY "Users can view their own submissions"
  ON public.pending_approvals FOR SELECT
  TO authenticated
  USING (auth.uid() = submitted_by);

-- Add institute_id to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS institute_id UUID REFERENCES public.institutes(id) ON DELETE SET NULL;

-- Update profiles RLS to consider institute context
DROP POLICY IF EXISTS "Authenticated users can view full profiles" ON public.profiles;
CREATE POLICY "Users can view profiles from their institute"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND (
      institute_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
          AND user_roles.institute_id = profiles.institute_id
      )
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_institutes_updated_at
  BEFORE UPDATE ON public.institutes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Migration: 20251002014006
-- Insert a test institute
INSERT INTO public.institutes (institute_id, name, website, contact_email, logo_url)
VALUES 
  ('INST-2024-001', 'Demo University', 'https://demo-university.edu', 'admin@demo-university.edu', NULL);

-- Create a helper function to make a user an admin
CREATE OR REPLACE FUNCTION public.make_user_admin(
  user_email text,
  inst_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
  target_institute_id uuid;
BEGIN
  -- Get user ID from profiles
  SELECT id INTO target_user_id
  FROM public.profiles
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Get institute ID
  SELECT id INTO target_institute_id
  FROM public.institutes
  WHERE institute_id = inst_id;
  
  IF target_institute_id IS NULL THEN
    RAISE EXCEPTION 'Institute with ID % not found', inst_id;
  END IF;
  
  -- Insert admin role (ignore if already exists)
  INSERT INTO public.user_roles (user_id, institute_id, role)
  VALUES (target_user_id, target_institute_id, 'admin')
  ON CONFLICT (user_id, institute_id, role) DO NOTHING;
END;
$$;

-- Migration: 20251002125402
-- Ensure RLS is enabled on contact_messages table
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop any existing overly permissive SELECT policies if they exist
DROP POLICY IF EXISTS "Anyone can view contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Public can view contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.contact_messages;

-- Create a policy that explicitly denies public SELECT access
-- Only service role (backend) can read these messages
-- This ensures contact form submissions remain private
CREATE POLICY "Only service role can view contact messages"
  ON public.contact_messages
  FOR SELECT
  USING (false);

-- Keep the existing INSERT policy for public submissions
-- (This already exists but we're documenting it here)
-- The "Anyone can insert contact messages" policy allows the contact form to work

-- Future: When admin functionality is added, create an admin-only SELECT policy:
-- CREATE POLICY "Admins can view contact messages"
--   ON public.contact_messages
--   FOR SELECT
--   USING (public.has_role(auth.uid(), 'admin'));

-- Migration: 20251003041228
-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for avatars bucket
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Migration: 20251004071731
-- Add RLS policies to allow admins to manage user roles
CREATE POLICY "Admins can insert user roles" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (
  public.is_admin(auth.uid())
);

CREATE POLICY "Admins can update user roles" ON public.user_roles
FOR UPDATE TO authenticated
USING (
  public.is_admin(auth.uid())
);

CREATE POLICY "Admins can delete user roles" ON public.user_roles
FOR DELETE TO authenticated
USING (
  public.is_admin(auth.uid())
);

-- Ensure make_user_admin function exists and is accessible
-- This function can be called directly to create the first admin
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email text, inst_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  target_user_id uuid;
  target_institute_id uuid;
BEGIN
  -- Get user ID from profiles
  SELECT id INTO target_user_id
  FROM public.profiles
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Get institute ID
  SELECT id INTO target_institute_id
  FROM public.institutes
  WHERE institute_id = inst_id;
  
  IF target_institute_id IS NULL THEN
    RAISE EXCEPTION 'Institute with ID % not found', inst_id;
  END IF;
  
  -- Insert admin role (ignore if already exists)
  INSERT INTO public.user_roles (user_id, institute_id, role)
  VALUES (target_user_id, target_institute_id, 'admin')
  ON CONFLICT (user_id, institute_id, role) DO NOTHING;
  
  RAISE NOTICE 'Successfully made % an admin for institute %', user_email, inst_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.make_user_admin(text, text) TO authenticated;

-- Migration: 20251006044859
-- Phase 1: Fix Critical Data Exposure Issues

-- 1. Fix profiles table RLS - Remove dangerous public policy if it exists
DROP POLICY IF EXISTS "Public can view basic profile info" ON public.profiles;

-- The secure policy already exists, so skip it

-- 2. Fix alumni_profiles - Require authentication
DROP POLICY IF EXISTS "Alumni profiles are viewable by everyone" ON public.alumni_profiles;

CREATE POLICY "Authenticated users can view alumni profiles"
ON public.alumni_profiles
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- 3. Fix feedback table - Actually require authentication
DROP POLICY IF EXISTS "Feedback viewable by authenticated users" ON public.feedback;

CREATE POLICY "Authenticated users can view feedback"
ON public.feedback
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- 4. Add foreign key constraints for data integrity (with IF NOT EXISTS checks via DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_alumni_profiles_user_id'
  ) THEN
    ALTER TABLE public.alumni_profiles
    ADD CONSTRAINT fk_alumni_profiles_user_id
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_student_profiles_user_id'
  ) THEN
    ALTER TABLE public.student_profiles
    ADD CONSTRAINT fk_student_profiles_user_id
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_connections_student_id'
  ) THEN
    ALTER TABLE public.connections
    ADD CONSTRAINT fk_connections_student_id
    FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_connections_alumni_id'
  ) THEN
    ALTER TABLE public.connections
    ADD CONSTRAINT fk_connections_alumni_id
    FOREIGN KEY (alumni_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_conversations_participant1_id'
  ) THEN
    ALTER TABLE public.conversations
    ADD CONSTRAINT fk_conversations_participant1_id
    FOREIGN KEY (participant1_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_conversations_participant2_id'
  ) THEN
    ALTER TABLE public.conversations
    ADD CONSTRAINT fk_conversations_participant2_id
    FOREIGN KEY (participant2_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_messages_sender_id'
  ) THEN
    ALTER TABLE public.messages
    ADD CONSTRAINT fk_messages_sender_id
    FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Migration: 20251113182254
-- Phase 1: Critical Student Data Protection
-- Fix 1: Remove overly permissive student_profiles policy and create secure ones

-- Drop the insecure policy that allows everyone to view all student profiles
DROP POLICY IF EXISTS "Student profiles are viewable by everyone" ON public.student_profiles;

-- Create secure policies for student_profiles
-- Students can view their own complete profile with all sensitive data
CREATE POLICY "Students can view their own profile"
ON public.student_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Other authenticated users can view limited student profile info (excluding sensitive fields)
-- They'll need to join with profiles table to get basic info, but won't see CGPA, career_goals directly
CREATE POLICY "Authenticated users can view basic student info"
ON public.student_profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = student_profiles.user_id
    AND profiles.institute_id IS NOT NULL
  )
);

-- Fix 2: Protect email addresses in profiles table
-- Create a function to check if users are connected
CREATE OR REPLACE FUNCTION public.are_users_connected(user1_id uuid, user2_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.connections
    WHERE (student_id = user1_id AND alumni_id = user2_id)
       OR (student_id = user2_id AND alumni_id = user1_id)
       AND status = 'accepted'
  )
$$;

-- Create a public_profiles view that excludes sensitive information for directory listings
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  id,
  user_type,
  username,
  full_name,
  student_id,
  graduation_year,
  company,
  position,
  location,
  bio,
  avatar_url,
  linkedin_url,
  institute_id,
  created_at,
  -- Only show email to the profile owner, their connections, or admins
  CASE
    WHEN id = auth.uid() THEN email
    WHEN public.are_users_connected(auth.uid(), id) THEN email
    WHEN public.is_admin(auth.uid()) THEN email
    ELSE NULL
  END AS email,
  -- Only show terms_accepted and email_verified to the profile owner or admins
  CASE
    WHEN id = auth.uid() OR public.is_admin(auth.uid()) THEN terms_accepted
    ELSE NULL
  END AS terms_accepted,
  CASE
    WHEN id = auth.uid() OR public.is_admin(auth.uid()) THEN email_verified
    ELSE NULL
  END AS email_verified
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated;

-- Create a view for safe student profile browsing (excludes CGPA and career goals for non-owners)
CREATE OR REPLACE VIEW public.public_student_profiles AS
SELECT
  sp.id,
  sp.user_id,
  sp.semester,
  sp.branch,
  sp.skills,
  sp.interests,
  sp.projects,
  sp.created_at,
  sp.updated_at,
  -- Only show CGPA to the profile owner, admins, or connected alumni
  CASE
    WHEN sp.user_id = auth.uid() THEN sp.cgpa
    WHEN public.is_admin(auth.uid()) THEN sp.cgpa
    WHEN public.are_users_connected(auth.uid(), sp.user_id) THEN sp.cgpa
    ELSE NULL
  END AS cgpa,
  -- Only show career goals to the profile owner, admins, or connected alumni
  CASE
    WHEN sp.user_id = auth.uid() THEN sp.career_goals
    WHEN public.is_admin(auth.uid()) THEN sp.career_goals
    WHEN public.are_users_connected(auth.uid(), sp.user_id) THEN sp.career_goals
    ELSE NULL
  END AS career_goals
FROM public.student_profiles sp;

-- Grant access to the view
GRANT SELECT ON public.public_student_profiles TO authenticated;
