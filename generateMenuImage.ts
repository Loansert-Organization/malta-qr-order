import OpenAI from "openai";
import * as dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateMenuImage(prompt: string): Promise<string | null> {
  try {
    const result = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "512x512",
      response_format: "url",
    });

    const url = result.data?.[0]?.url;
    console.log("✅ Image generated:", url);
    return url ?? null;
  } catch (err: any) {
    console.error("❌ Error generating image:", err?.message || err);
    return null;
  }
}

