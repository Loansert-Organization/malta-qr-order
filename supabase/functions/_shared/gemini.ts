
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

export const gemini = {
  async chat(messages: { role: string; parts: { text: string }[] }[]) {
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: messages
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    return {
      text: () => json.candidates?.[0]?.content?.parts?.[0]?.text || "",
      candidates: json.candidates
    };
  }
};
