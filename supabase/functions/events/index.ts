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

    // GET /events - Get all events
    if (req.method === 'GET' && pathParts.length === 1) {
      const { data: events, error } = await supabaseClient
        .from('events')
        .select(`
          *,
          profiles:created_by (
            username,
            full_name,
            avatar_url
          ),
          event_rsvps (
            count
          )
        `)
        .order('event_date', { ascending: true });

      if (error) throw error;

      return new Response(JSON.stringify({ events }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /events/:id - Get single event
    if (req.method === 'GET' && pathParts.length === 2 && !path.includes('/rsvp/')) {
      const eventId = pathParts[1];
      const { data: event, error } = await supabaseClient
        .from('events')
        .select(`
          *,
          profiles:created_by (
            username,
            full_name,
            avatar_url
          ),
          event_rsvps (
            id,
            status,
            profiles:user_id (
              id,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('id', eventId)
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ event }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /events - Create a new event (Alumni only)
    if (req.method === 'POST' && !path.includes('/rsvp/')) {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();

      if (profile?.user_type !== 'alumni') {
        return new Response(JSON.stringify({ error: 'Only alumni can create events' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const eventData = await req.json();
      const { data: event, error } = await supabaseClient
        .from('events')
        .insert({
          ...eventData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ event }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PUT /events/:id - Update event (Alumni only, owner only)
    if (req.method === 'PUT' && pathParts.length === 2) {
      const eventId = pathParts[1];

      // Verify ownership
      const { data: event } = await supabaseClient
        .from('events')
        .select('created_by')
        .eq('id', eventId)
        .single();

      if (!event || event.created_by !== user.id) {
        return new Response(JSON.stringify({ error: 'Unauthorized to update this event' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const eventData = await req.json();
      const { data: updatedEvent, error } = await supabaseClient
        .from('events')
        .update(eventData)
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ event: updatedEvent }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE /events/:id - Delete event (Alumni only, owner only)
    if (req.method === 'DELETE' && pathParts.length === 2) {
      const eventId = pathParts[1];

      // Verify ownership
      const { data: event } = await supabaseClient
        .from('events')
        .select('created_by')
        .eq('id', eventId)
        .single();

      if (!event || event.created_by !== user.id) {
        return new Response(JSON.stringify({ error: 'Unauthorized to delete this event' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error } = await supabaseClient
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      return new Response(JSON.stringify({ message: 'Event deleted successfully' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /events/rsvp/:id - RSVP for an event
    if (req.method === 'POST' && path.includes('/rsvp/')) {
      const eventId = path.split('/').pop();
      const { status: rsvpStatus } = await req.json();

      // Check if user already has an RSVP
      const { data: existingRsvp } = await supabaseClient
        .from('event_rsvps')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      let rsvp;
      if (existingRsvp) {
        const { data, error } = await supabaseClient
          .from('event_rsvps')
          .update({ status: rsvpStatus })
          .eq('id', existingRsvp.id)
          .select()
          .single();

        if (error) throw error;
        rsvp = data;
      } else {
        const { data, error } = await supabaseClient
          .from('event_rsvps')
          .insert({
            event_id: eventId,
            user_id: user.id,
            status: rsvpStatus,
          })
          .select()
          .single();

        if (error) throw error;
        rsvp = data;
      }

      return new Response(JSON.stringify({ rsvp }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE /events/rsvp/:id - Cancel RSVP
    if (req.method === 'DELETE' && path.includes('/rsvp/')) {
      const eventId = path.split('/').pop();

      const { error } = await supabaseClient
        .from('event_rsvps')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;

      return new Response(JSON.stringify({ message: 'RSVP cancelled successfully' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Events API error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
