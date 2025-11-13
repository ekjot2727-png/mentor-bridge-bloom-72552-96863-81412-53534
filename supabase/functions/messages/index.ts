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

    // GET /messages/conversations - Get all conversations for current user
    if (req.method === 'GET' && pathParts[1] === 'conversations') {
      const { data: conversations, error } = await supabaseClient
        .from('conversations')
        .select(`
          *,
          participant1:profiles!conversations_participant1_id_fkey(id, full_name, avatar_url),
          participant2:profiles!conversations_participant2_id_fkey(id, full_name, avatar_url),
          last_message:messages(content, created_at, sender_id)
        `)
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ conversations }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // GET /messages/conversation/:id - Get messages in a conversation
    if (req.method === 'GET' && pathParts[1] === 'conversation' && pathParts.length === 3) {
      const conversationId = pathParts[2];

      // Verify user is part of conversation
      const { data: conversation } = await supabaseClient
        .from('conversations')
        .select('participant1_id, participant2_id')
        .eq('id', conversationId)
        .single();

      if (!conversation || (conversation.participant1_id !== user.id && conversation.participant2_id !== user.id)) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }

      const { data: messages, error } = await supabaseClient
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      // Mark messages as read
      await supabaseClient
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id);

      return new Response(
        JSON.stringify({ messages }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // POST /messages/conversation - Create or get conversation with another user
    if (req.method === 'POST' && pathParts[1] === 'conversation' && pathParts.length === 2) {
      const { otherUserId } = await req.json();

      // Check if conversation already exists
      const { data: existingConversation } = await supabaseClient
        .from('conversations')
        .select('*')
        .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${user.id})`)
        .maybeSingle();

      if (existingConversation) {
        return new Response(
          JSON.stringify({ conversation: existingConversation }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      // Create new conversation
      const { data: conversation, error } = await supabaseClient
        .from('conversations')
        .insert({
          participant1_id: user.id,
          participant2_id: otherUserId,
        })
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ conversation }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
      );
    }

    // POST /messages - Send a message
    if (req.method === 'POST' && pathParts.length === 1) {
      const { conversation_id, content } = await req.json();

      // Verify user is part of conversation
      const { data: conversation } = await supabaseClient
        .from('conversations')
        .select('participant1_id, participant2_id')
        .eq('id', conversation_id)
        .single();

      if (!conversation || (conversation.participant1_id !== user.id && conversation.participant2_id !== user.id)) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }

      const { data: message, error } = await supabaseClient
        .from('messages')
        .insert({
          conversation_id,
          sender_id: user.id,
          content,
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      // Update conversation timestamp
      await supabaseClient
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation_id);

      return new Response(
        JSON.stringify({ message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
      );
    }

    // DELETE /messages/:id - Delete a message
    if (req.method === 'DELETE' && pathParts.length === 2) {
      const messageId = pathParts[1];

      // Verify user is sender
      const { data: message } = await supabaseClient
        .from('messages')
        .select('sender_id')
        .eq('id', messageId)
        .single();

      if (!message || message.sender_id !== user.id) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }

      const { error } = await supabaseClient
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ message: 'Message deleted successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
    );
  } catch (error) {
    console.error('Error in messages function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
