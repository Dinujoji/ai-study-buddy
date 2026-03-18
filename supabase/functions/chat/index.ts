import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Different system prompts based on mode
    let systemPrompt = "";
    if (mode === "summarize") {
      systemPrompt = `You are an expert note summarizer for students. When given notes or text content:
- Extract the key points concisely
- Use bullet points and simple language
- Highlight important terms in bold
- Keep summaries under 200 words
- Add a "Key Takeaway" at the end`;
    } else if (mode === "quiz") {
      systemPrompt = `You are a quiz question generator for students. Generate quiz questions in valid JSON format.
Return a JSON array of question objects with this exact structure:
[{
  "question": "question text",
  "options": ["A", "B", "C", "D"],
  "correct": 0,
  "explanation": "why this is correct",
  "difficulty": "Easy|Medium|Hard"
}]
Generate 5 questions based on the topic. Vary difficulty levels.`;
    } else {
      systemPrompt = `You are LearnAI, a friendly and knowledgeable AI tutor for students studying Computer Science and UPSC topics.

Your teaching style:
- Explain concepts simply with real-world analogies
- Use markdown formatting: headers, bold, code blocks, tables
- Include examples and diagrams when helpful
- Break complex topics into digestible parts
- Encourage the student and suggest practice problems
- If unsure, say so honestly

Subjects you cover:
- Data Structures & Algorithms (DSA)
- Operating Systems (OS)
- Database Management Systems (DBMS)
- Computer Networks
- Indian Polity & Governance (UPSC)
- Modern Indian History (UPSC)

Always be encouraging and patient. You're helping a 2nd year CS student learn.`;
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
