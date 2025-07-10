import { generateMenuImage } from "./generateMenuImage";

(async () => {
  const prompt = "A delicious Margherita pizza on a wooden table with fresh basil and mozzarella";
  const imageUrl = await generateMenuImage(prompt);
  console.log("🔗 Final URL:", imageUrl);
})();

