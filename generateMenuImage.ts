import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function generateMenuImage(prompt: string): Promise<string> {
  try {
    // 1. Generate image
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    });

    const base64Image = response.data[0]?.b64_json;
    if (!base64Image) throw new Error("No image data returned.");

    // 2. Save locally
    const outputPath = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "menu-image.png"
    );
    fs.writeFileSync(outputPath, Buffer.from(base64Image, "base64"));
    console.log("✅ Image saved locally to:", outputPath);

    // 3. Upload to Supabase
    const fileName = `menu-${Date.now()}.png`;
    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .upload(fileName, Buffer.from(base64Image, "base64"), {
        contentType: "image/png",
        upsert: true,
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .getPublicUrl(fileName);

    if (!publicUrlData?.publicUrl) throw new Error("No public URL returned.");

    console.log("🌐 Public URL:", publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  } catch (error: any) {
    console.error("❌ Failed to generate/upload image:", error.message || error);
    throw error;
  }
}

