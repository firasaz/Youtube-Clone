type OllamaChatResponse = {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
};

function cleanOllamaResponse(raw: string): string {
  // Remove everything between <think>...</think> (non-greedy)
  const withoutThinking = raw.replace(/<think>[\s\S]*?<\/think>/g, "");

  // Trim leading/trailing whitespace
  const trimmed = withoutThinking.trim();

  // Optional: Remove any empty lines or markdown artifacts (if needed)
  const cleaned = trimmed.replace(/^\s*[\r\n]/gm, "");

  return cleaned;
}

export async function POST(req: Request) {
  const { prompt, model = "deepseek-r1:1.5b" } = await req.json();

  const TITLE_SYSTEM_PROMPT = `Your task is to generate an SEO-focused title for a YouTube video based on its transcript. Please follow these guidelines:
- Be concise but descriptive, using relevant keywords to improve discoverability.
- Highlight the most compelling or unique aspect of the video content.
- Avoid jargon or overly complex language unless it directly supports searchability.
- Use action-oriented phrasing or clear value propositions where applicable.
- Ensure the title is 3-8 words long and no more than 100 characters.
- ONLY return the title as plain text. Do not add quotes or any additional formatting.`;

  console.log("fetching AI-generated title...");
  const AI_URL = process.env.NGROK_URL || "http://localhost:11434";

  const response = await fetch(`${AI_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: TITLE_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: false,
    }),
  });

  console.log("done fetching AI-generated title!!!");
  console.log("cleaning AI response");

  const data = (await response.json()) as OllamaChatResponse;
  const raw = data.message?.content ?? "";
  const cleaned = cleanOllamaResponse(raw);

  return Response.json({ response: cleaned ?? "No response" });
}
