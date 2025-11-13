import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);

    // GET /connections - Get all connections for current user
    if (req.method === 'GET' && pathParts.length === 1) {
      const { data: connections, error } = await supabaseClient
        .from('connections')
        .select(`
          *,
          student:profiles!connections_student_id_fkey(id, full_name, avatar_url, email),
          alumni:profiles!connections_alumni_id_fkey(id, full_name, avatar_url, company, position)
        `)
        .or(`student_id.eq.${user.id},alumni_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching connections:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ connections }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // POST /connections - Create connection request
    if (req.method === 'POST' && pathParts.length === 1) {
      const { alumni_id } = await req.json();

      // Verify current user is a student
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();

      if (profile?.user_type !== 'student') {
        return new Response(
          JSON.stringify({ error: 'Only students can request connections' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }

      // Check if connection already exists
      const { data: existing } = await supabaseClient
        .from('connections')
        .select('id')
        .eq('student_id', user.id)
        .eq('alumni_id', alumni_id)
        .maybeSingle();

      if (existing) {
        return new Response(
          JSON.stringify({ error: 'Connection already exists' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      const { data: connection, error } = await supabaseClient
        .from('connections')
        .insert({
          student_id: user.id,
          alumni_id,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating connection:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ connection }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
      );
    }

    // PUT /connections/:id - Update connection status (accept/reject)
    if (req.method === 'PUT' && pathParts.length === 2) {
      const connectionId = pathParts[1];
      const { status } = await req.json();

      if (!['accepted', 'rejected'].includes(status)) {
        return new Response(
          JSON.stringify({ error: 'Invalid status' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Verify user is the alumni in this connection
      const { data: connection } = await supabaseClient
        .from('connections')
        .select('alumni_id')
        .eq('id', connectionId)
        .single();

      if (!connection || connection.alumni_id !== user.id) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }

      const { data: updatedConnection, error } = await supabaseClient
        .from('connections')
        .update({ status })
        .eq('id', connectionId)
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ connection: updatedConnection }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // DELETE /connections/:id - Remove connection
    if (req.method === 'DELETE' && pathParts.length === 2) {
      const connectionId = pathParts[1];

      // Verify user is part of this connection
      const { data: connection } = await supabaseClient
        .from('connections')
        .select('student_id, alumni_id')
        .eq('id', connectionId)
        .single();

      if (!connection || (connection.student_id !== user.id && connection.alumni_id !== user.id)) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }

      const { error } = await supabaseClient
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ message: 'Connection removed successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
    );
  } catch (error) {
    console.error('Error in connections function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
