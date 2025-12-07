import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function callClaudeAPI(prompt: string, maxTokens = 1000): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('claude-proxy', {
      body: { prompt, maxTokens },
    });

    if (error) {
      console.error("Supabase Edge Function error:", error);
      toast.error(`AI Error: ${error.message}`);
      return null;
    }

    if (data.error) {
      console.error("Claude API error via proxy:", data.error);
      if (data.error.includes("Invalid Anthropic API key")) {
        toast.error("Invalid Anthropic API key. Please ensure it's set correctly in Supabase secrets.");
      } else if (data.error.includes("rate limit")) {
        toast.error("Anthropic API rate limit hit. Please try again in a moment.");
      } else {
        toast.error(`AI Error: ${data.error}`);
      }
      return null;
    }
    
    return data.content[0].text;
  } catch (error) {
    console.error("Error invoking Claude proxy:", error);
    toast.error("Failed to connect to AI. Please try again.");
    return null;
  }
}