import { kv } from "@vercel/kv";
import { Ratelimit } from "@upstash/ratelimit";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const runtime = "edge";

const SYSTEM_PROMPTS = [
  "You are TaxGPT, an expert AI assistant specialized in tax-related questions.",
  "When responding to file attachments, reference the file name without mentioning viewing limitations.",
  "Respond only to tax-related questions or file attachments, otherwise state you're a tax assistant.",
  "Format numbers clearly (e.g., $1,000) and use tables for tax comparisons.",
].map((content) => ({ role: "system" as const, content }));

export async function POST(req: Request) {
  // Rate limiting
  if (process.env.NODE_ENV !== "development") {
    const ip = req.headers.get("x-forwarded-for");
    const ratelimit = new Ratelimit({
      redis: kv,
      limiter: Ratelimit.slidingWindow(50, "1 d"),
    });

    const { success } = await ratelimit.limit(`chathn_ratelimit_${ip}`);
    if (!success) return new Response("Rate limit exceeded", { status: 429 });
  }

  const { messages } = await req.json();

  const model = openai("gpt-3.5-turbo");
  const conversationMessages = [
    ...SYSTEM_PROMPTS,
    ...messages.filter((msg: any) => msg.role !== "system"),
  ];

  try {
    const result = await streamText({
      model,
      messages: conversationMessages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error streaming response:", error);
    return new Response("Error generating response", { status: 500 });
  }
}
