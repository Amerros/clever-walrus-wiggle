/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.52.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured on server.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this body photo. Estimate the body fat percentage as a number. Provide concise, actionable fitness advice based on the physique shown. Format your response as a JSON object: {\"body_fat_percentage\": number, \"advice\": \"string\"}. If body fat cannot be estimated, use null. Keep the advice under 200 words." },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 500, // Increased max tokens for more detailed advice
    });

    const aiContent = response.choices[0].message.content;
    
    // Attempt to parse the JSON response from OpenAI
    let parsedResult;
    try {
      parsedResult = JSON.parse(aiContent || '{}');
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", aiContent, parseError);
      return new Response(JSON.stringify({ error: "AI response was not valid JSON.", raw_response: aiContent }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(parsedResult), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in image-analyzer function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});