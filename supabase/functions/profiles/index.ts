import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const path = url.pathname;
    const pathParts = path.split('/').filter(Boolean);

    // GET /profiles/me - Get current user's complete profile
    if (req.method === 'GET' && path.includes('/me')) {
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Get additional profile data based on user type
      let additionalData = null;
      if (profile.user_type === 'student') {
        const { data, error } = await supabaseClient
          .from('student_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        if (error) throw error;
        additionalData = data;
      } else if (profile.user_type === 'alumni') {
        const { data, error } = await supabaseClient
          .from('alumni_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        if (error) throw error;
        additionalData = data;
      }

      return new Response(JSON.stringify({ 
        profile,
        additionalData 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /profiles/:id - Get specific user's profile
    if (req.method === 'GET' && pathParts.length === 2 && pathParts[1] !== 'me' && !path.includes('/avatar')) {
      const profileId = pathParts[1];
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (profileError) throw profileError;

      // Get additional profile data based on user type
      let additionalData = null;
      if (profile.user_type === 'student') {
        const { data, error } = await supabaseClient
          .from('student_profiles')
          .select('*')
          .eq('user_id', profileId)
          .maybeSingle();
        if (error) throw error;
        additionalData = data;
      } else if (profile.user_type === 'alumni') {
        const { data, error } = await supabaseClient
          .from('alumni_profiles')
          .select('*')
          .eq('user_id', profileId)
          .maybeSingle();
        if (error) throw error;
        additionalData = data;
      }

      return new Response(JSON.stringify({ 
        profile,
        additionalData 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /profiles - Get all alumni profiles (directory)
    if (req.method === 'GET' && pathParts.length === 1) {
      const { data: profiles, error } = await supabaseClient
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          bio,
          avatar_url,
          graduation_year,
          user_type,
          alumni_profiles (
            company,
            position,
            industry,
            skills,
            availability_for_mentorship
          )
        `)
        .eq('user_type', 'alumni')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ profiles }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /profiles - Create or update profile
    if (req.method === 'POST' && !path.includes('/avatar')) {
      const profileData = await req.json();
      
      // Update main profile
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .update({
          bio: profileData.bio,
          avatar_url: profileData.avatar_url,
          linkedin_url: profileData.linkedin_url,
          location: profileData.location,
          full_name: profileData.full_name,
        })
        .eq('id', user.id)
        .select()
        .single();

      if (profileError) throw profileError;

      // Update additional profile data
      if (profile.user_type === 'student' && profileData.studentData) {
        const { error } = await supabaseClient
          .from('student_profiles')
          .upsert({
            user_id: user.id,
            ...profileData.studentData,
          });
        if (error) throw error;
      } else if (profile.user_type === 'alumni' && profileData.alumniData) {
        const { error } = await supabaseClient
          .from('alumni_profiles')
          .upsert({
            user_id: user.id,
            ...profileData.alumniData,
          });
        if (error) throw error;
      }

      return new Response(JSON.stringify({ 
        success: true,
        profile 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /profiles/avatar - Upload avatar
    if (req.method === 'POST' && path.includes('/avatar')) {
      const formData = await req.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return new Response(JSON.stringify({ error: 'No file provided' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const fileBuffer = await file.arrayBuffer();

      const { error: uploadError } = await supabaseClient.storage
        .from('avatars')
        .upload(fileName, fileBuffer, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabaseClient.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      return new Response(JSON.stringify({ avatar_url: publicUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Profiles API error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
