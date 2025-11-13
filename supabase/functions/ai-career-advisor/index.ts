import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

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

    const { prompt, studentProfile } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Get user profile if not provided
    let profile = studentProfile;
    if (!profile) {
      const { data } = await supabaseClient
        .from('profiles')
        .select(`
          *,
          student_profiles (*),
          alumni_profiles (*)
        `)
        .eq('id', user.id)
        .single();
      profile = data;
    }

    // Build profile context
    const profileContext = profile ? `
Student Profile:
- Name: ${profile.full_name || 'Not provided'}
- Branch: ${profile.student_profiles?.[0]?.branch || 'Not specified'}
- Semester: ${profile.student_profiles?.[0]?.semester || 'Not specified'}
- CGPA: ${profile.student_profiles?.[0]?.cgpa || 'Not specified'}
- Skills: ${profile.student_profiles?.[0]?.skills?.join(', ') || 'None listed'}
- Interests: ${profile.student_profiles?.[0]?.interests?.join(', ') || 'None listed'}
- Career Goals: ${profile.student_profiles?.[0]?.career_goals || 'Not specified'}
    `.trim() : 'No profile available';

    const systemPrompt = prompt 
      ? `You are an expert career advisor for university students. Provide personalized, actionable career advice. Be specific, encouraging, and include concrete steps.`
      : `You are an AI career advisor for JECRC Foundation students. Conduct COMPREHENSIVE research and provide DETAILED analysis in JSON format with: research, careerAdvice, careerPaths (with title, match %, description, salary, growth, industryOutlook), skillGaps, and nextSteps.`;

    const userMessage = prompt 
      ? `${profileContext}\n\nQuestion: ${prompt}`
      : `Analyze this student profile and provide comprehensive career guidance: ${profileContext}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI service credits exhausted.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // If it's a direct question (with prompt), return as plain text
    if (prompt) {
      return new Response(JSON.stringify({ advice: aiResponse }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Otherwise parse JSON from AI response for comprehensive analysis
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    const careerAdvice = jsonMatch ? JSON.parse(jsonMatch[0]) : { 
      careerPaths: [], 
      skillGaps: [], 
      nextSteps: [],
      research: aiResponse,
      careerAdvice: 'Unable to parse structured response'
    };

    return new Response(JSON.stringify(careerAdvice), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-career-advisor:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
