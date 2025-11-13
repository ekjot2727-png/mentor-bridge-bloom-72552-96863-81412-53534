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

    // GET /jobs - Get all active jobs
    if (req.method === 'GET' && pathParts.length === 1) {
      const { data: jobs, error } = await supabaseClient
        .from('jobs')
        .select(`
          *,
          profiles:posted_by (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ jobs }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /jobs/:id - Get single job
    if (req.method === 'GET' && pathParts.length === 2 && !path.includes('/apply/') && !path.includes('/applications')) {
      const jobId = pathParts[1];
      const { data: job, error } = await supabaseClient
        .from('jobs')
        .select(`
          *,
          profiles:posted_by (
            username,
            full_name,
            avatar_url,
            company,
            position
          )
        `)
        .eq('id', jobId)
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ job }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /jobs - Create a new job (Alumni only)
    if (req.method === 'POST' && !path.includes('/apply/')) {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();

      if (profile?.user_type !== 'alumni') {
        return new Response(JSON.stringify({ error: 'Only alumni can post jobs' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const jobData = await req.json();
      const { data: job, error } = await supabaseClient
        .from('jobs')
        .insert({
          ...jobData,
          posted_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ job }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PUT /jobs/:id - Update job (Alumni only, owner only)
    if (req.method === 'PUT' && pathParts.length === 2) {
      const jobId = pathParts[1];

      // Verify ownership
      const { data: job } = await supabaseClient
        .from('jobs')
        .select('posted_by')
        .eq('id', jobId)
        .single();

      if (!job || job.posted_by !== user.id) {
        return new Response(JSON.stringify({ error: 'Unauthorized to update this job' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const jobData = await req.json();
      const { data: updatedJob, error } = await supabaseClient
        .from('jobs')
        .update(jobData)
        .eq('id', jobId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ job: updatedJob }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE /jobs/:id - Delete job (Alumni only, owner only)
    if (req.method === 'DELETE' && pathParts.length === 2) {
      const jobId = pathParts[1];

      // Verify ownership
      const { data: job } = await supabaseClient
        .from('jobs')
        .select('posted_by')
        .eq('id', jobId)
        .single();

      if (!job || job.posted_by !== user.id) {
        return new Response(JSON.stringify({ error: 'Unauthorized to delete this job' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error } = await supabaseClient
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      return new Response(JSON.stringify({ message: 'Job deleted successfully' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /jobs/:id/applications - Get applications for a job (owner only)
    if (req.method === 'GET' && pathParts.length === 3 && pathParts[2] === 'applications') {
      const jobId = pathParts[1];

      // Verify ownership
      const { data: job } = await supabaseClient
        .from('jobs')
        .select('posted_by')
        .eq('id', jobId)
        .single();

      if (!job || job.posted_by !== user.id) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: applications, error } = await supabaseClient
        .from('job_applications')
        .select(`
          *,
          profiles:applicant_id (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ applications }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /jobs/apply/:id - Apply for a job (Students only)
    if (req.method === 'POST' && path.includes('/apply/')) {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();

      if (profile?.user_type !== 'student') {
        return new Response(JSON.stringify({ error: 'Only students can apply for jobs' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const jobId = path.split('/').pop();
      const applicationData = await req.json();

      const { data: application, error } = await supabaseClient
        .from('job_applications')
        .insert({
          job_id: jobId,
          applicant_id: user.id,
          ...applicationData,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return new Response(JSON.stringify({ error: 'You have already applied for this job' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        throw error;
      }

      return new Response(JSON.stringify({ application }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Jobs API error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
