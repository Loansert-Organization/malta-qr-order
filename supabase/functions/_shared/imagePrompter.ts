export async function generateFoodImagePrompt(openaiKey: string, itemName: string, itemDescription?: string): Promise<string> {
  // Base fallback prompt
  let prompt = `Professional food photography of ${itemName}${itemDescription ? `: ${itemDescription}` : ''}. High-quality restaurant menu photo, appetizing presentation, natural lighting, shallow depth of field. No text, no watermark.`

  try {
    const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert food-photography prompt engineer for DALL·E. Produce vivid, camera-ready prompts describing professional restaurant dishes. Avoid any mention of text, logos or watermarks.'
          },
          {
            role: 'user',
            content: `Dish name: ${itemName}\nDescription: ${itemDescription ?? 'N/A'}\nGenerate ONE detailed DALL·E 3 prompt for a square menu photo.`
          }
        ],
        temperature: 0.6,
        max_tokens: 150
      })
    })

    if (chatRes.ok) {
      const json = await chatRes.json()
      const candidate = json.choices?.[0]?.message?.content?.trim()
      if (candidate) {
        prompt = candidate
      }
    }
  } catch (_) {
    // Silent fail – keep fallback prompt
  }

  return prompt
} 