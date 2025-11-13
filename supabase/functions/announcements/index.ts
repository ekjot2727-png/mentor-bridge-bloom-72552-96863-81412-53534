import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the user from the Authorization header
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "GET") {
      // Get announcements for user's institute
      const { data: userRoles } = await supabase
        .from("user_roles")
        .select("institute_id")
        .eq("user_id", user.id)
        .single();

      if (!userRoles) {
        return new Response(JSON.stringify({ error: "No institute found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: announcements, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("institute_id", userRoles.institute_id)
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify(announcements), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const { title, content, targetAudience, instituteId } = await req.json();

      // Verify user is admin for this institute
      const { data: roles } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id)
        .eq("institute_id", instituteId)
        .eq("role", "admin");

      if (!roles || roles.length === 0) {
        return new Response(JSON.stringify({ error: "Not authorized" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create announcement
      const { data: announcement, error } = await supabase
        .from("announcements")
        .insert({
          title,
          content,
          target_audience: targetAudience,
          institute_id: instituteId,
          created_by: user.id,
          status: "published",
          published_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(announcement), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in announcements function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
