import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { subject, difficulty, count = 5, previousScore } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Adapt difficulty based on previous score
    let adaptedDifficulty = difficulty || "medium";
    if (previousScore !== undefined) {
      if (previousScore >= 80) adaptedDifficulty = "hard";
      else if (previousScore <= 40) adaptedDifficulty = "easy";
      else adaptedDifficulty = "medium";
    }

    const prompt = `Generate exactly ${count} multiple-choice questions about "${subject}" at "${adaptedDifficulty}" difficulty level for a student.

Return ONLY a valid JSON array with this exact structure (no markdown, no explanation):
[
  {
    "question": "question text",
    "options": ["option A", "option B", "option C", "option D"],
    "correct": 0,
    "explanation": "why the answer is correct",
    "difficulty": "${adaptedDifficulty}",
    "topic": "specific topic within the subject"
  }
]

Make questions challenging but fair. Include detailed explanations. The "correct" field is the 0-based index of the correct option.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert quiz generator for educational purposes. Always return valid JSON only." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "[]";
    
    // Clean markdown code fences if present
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    const questions = JSON.parse(content);

    return new Response(JSON.stringify({ questions, difficulty: adaptedDifficulty }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("quiz generation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Failed to generate quiz" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
