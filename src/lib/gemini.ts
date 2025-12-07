import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function callGeminiAPI(prompt: string, maxTokens = 1000): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('gemini-proxy', {
      body: { prompt, maxTokens },
    });

    if (error) {
      console.error("Supabase Edge Function error:", error);
      toast.error(`AI Error: ${error.message}`);
      return null;
    }

    if (data.error) {
      console.error("Gemini API error via proxy:", data.error);
      if (data.error.includes("API key not configured")) {
        toast.error("Gemini API key not configured. Please ensure it's set correctly in Supabase secrets.");
      } else if (data.error.includes("rate limit")) {
        toast.error("Gemini API rate limit hit. Please try again in a moment.");
      } else {
        toast.error(`AI Error: ${data.error}`);
      }
      return null;
    }
    
    return data.content; // Gemini response structure is different
  } catch (error) {
    console.error("Error invoking Gemini proxy:", error);
    toast.error("Failed to connect to AI. Please try again.");
    return null;
  }
}