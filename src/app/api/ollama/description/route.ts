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

  const DESCRIPTION_SYSTEM_PROMPT = `Your task is to summarize the transcript of a video. Please follow these guidelines:
- Be brief. Condense the content into a summary that captures the key points and main ideas without losing important details.
- Avoid jargon or overly complex language unless necessary for the context.
- Focus on the most critical information, ignoring filler, repetitive statements, or irrelevant tangents.
- ONLY return the summary, no other text, annotations, or comments.
- Aim for a summary that is 3-5 sentences long and no more than 200 characters.`;

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
          content: DESCRIPTION_SYSTEM_PROMPT,
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
