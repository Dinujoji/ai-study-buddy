import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { subjects, weakTopics, goal, examDate, hoursPerDay = 4 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `Create a personalized daily study plan for a student with these details:
- Goal: ${goal || "General exam preparation"}
- Exam date: ${examDate || "Not specified"}
- Available hours per day: ${hoursPerDay}
- Subjects: ${JSON.stringify(subjects || [])}
- Weak topics needing extra focus: ${JSON.stringify(weakTopics || [])}

Return ONLY valid JSON with this structure (no markdown):
{
  "dailyPlan": [
    { "time": "9:00 AM", "task": "description", "duration": "45 min", "subject": "subject name", "priority": "high|medium|low" }
  ],
  "weeklyGoals": ["goal 1", "goal 2"],
  "tips": ["tip 1", "tip 2"]
}

Allocate 70% time to weak topics, 30% to revision. Include breaks.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert study planner. Always return valid JSON only." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) throw new Error(`AI error: ${response.status}`);

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "{}";
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const plan = JSON.parse(content);

    return new Response(JSON.stringify(plan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("study-plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Failed to generate plan" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
