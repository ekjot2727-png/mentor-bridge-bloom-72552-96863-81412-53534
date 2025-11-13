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

    const { uploadType, records, instituteId } = await req.json();

    // Validate input
    if (!uploadType || !records || !instituteId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!Array.isArray(records) || records.length === 0) {
      return new Response(JSON.stringify({ error: "Records must be a non-empty array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Validate each record
    for (const record of records) {
      if (!record.email || !emailRegex.test(record.email)) {
        return new Response(JSON.stringify({ error: `Invalid email format: ${record.email}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (record.email.length > 255) {
        return new Response(JSON.stringify({ error: "Email must be less than 255 characters" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (record.full_name && record.full_name.length > 100) {
        return new Response(JSON.stringify({ error: "Name must be less than 100 characters" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Validate username format (alphanumeric and underscore only)
      if (record.username && !/^[a-zA-Z0-9_]+$/.test(record.username)) {
        return new Response(JSON.stringify({ error: "Username can only contain letters, numbers, and underscores" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

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

    const results = {
      processed: 0,
      failed: 0,
      errors: [] as any[],
    };

    // Process records based on upload type
    for (const record of records) {
      try {
        if (uploadType === "alumni") {
          // Create user profile
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert({
              email: record.email,
              username: record.email.split("@")[0],
              full_name: record.full_name,
              user_type: "alumni",
              institute_id: instituteId,
            });

          if (profileError) throw profileError;

          // Create alumni profile
          const { error: alumniError } = await supabase
            .from("alumni_profiles")
            .upsert({
              company: record.company,
              position: record.position,
              linkedin_url: record.linkedin_url,
              industry: record.industry,
            });

          if (alumniError) throw alumniError;
        } else if (uploadType === "students") {
          // Create user profile
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert({
              email: record.email,
              username: record.email.split("@")[0],
              full_name: record.full_name,
              user_type: "student",
              student_id: record.student_id,
              institute_id: instituteId,
            });

          if (profileError) throw profileError;
        }

        results.processed++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          record,
          error: error.message,
        });
      }
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in bulk-upload function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
