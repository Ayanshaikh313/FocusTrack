// src/services/ai.ts
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

type UsageStats = {
  appName: string;
  packageName: string;
  duration: number;
  category: "social" | "entertainment" | "productivity" | "other";
};

export async function getAIInsights(usageData: UsageStats[]) {
  const prompt = `
    Analyze this screen time data and give 3 short, friendly insights:
    ${JSON.stringify(usageData)}
    Keep each insight under 2 sentences.
  `;

  const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}
