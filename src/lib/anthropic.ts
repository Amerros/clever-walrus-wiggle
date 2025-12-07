import { useAppStore } from './store';

export async function callClaudeAPI(prompt: string, maxTokens = 1000): Promise<string | null> {
  const userApiKey = useAppStore.getState().userProfile?.anthropicApiKey;

  if (!userApiKey) {
    console.error("Anthropic API key is not set.");
    // TODO: Show a toast notification to the user
    return null;
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": userApiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620", // Using the latest Sonnet model
        max_tokens: maxTokens,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Claude API error:", errorData);
      // TODO: Show a more specific toast notification based on errorData
      if (response.status === 401) {
        // Invalid API key
        throw new Error("Invalid Anthropic API key. Please check your settings.");
      } else if (response.status === 429) {
        // Rate limit hit
        throw new Error("Anthropic API rate limit hit. Please try again in a moment.");
      } else {
        throw new Error(`Anthropic API error: ${errorData.error?.message || response.statusText}`);
      }
    }
    
    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error("Error calling Claude API:", error);
    // TODO: Show a toast notification
    return null;
  }
}