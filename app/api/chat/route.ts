import { kv } from "@vercel/kv";
import { Ratelimit } from "@upstash/ratelimit";
import { OpenAI } from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { functions, runFunction } from "./functions";

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "edge";

// Define system prompts that guide the AI's behavior
const SYSTEM_PROMPTS = [
  {
    role: "system",
    content:
      "You are TaxGPT, an expert AI assistant specialized in tax-related questions. Provide accurate, up-to-date tax information while making it clear you're not a substitute for professional advice.",
  },
  {
    role: "system",
    content:
      "when responding to file attached, don't mention that you can't view them, just formulate a simple message referencing the file name.",
  },
  {
    role: "system",
    content:
      "Respond only to tax-related questions or file attached/uploads, otherwise mention youre a tax assistant.",
  },
  {
    role: "system",
    content:
      "Format numbers clearly (e.g., $1,000 instead of 1000) and use tables when comparing tax brackets or rates.",
  },
];

export async function POST(req: Request) {
  if (
    process.env.NODE_ENV !== "development" &&
    process.env.KV_REST_API_URL &&
    process.env.KV_REST_API_TOKEN
  ) {
    const ip = req.headers.get("x-forwarded-for");
    const ratelimit = new Ratelimit({
      redis: kv,
      limiter: Ratelimit.slidingWindow(50, "1 d"),
    });

    const { success, limit, reset, remaining } = await ratelimit.limit(
      `chathn_ratelimit_${ip}`,
    );

    if (!success) {
      return new Response("You have reached your request limit for the day.", {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      });
    }
  }

  const { messages } = await req.json();

  // Prepare messages for API call - include system prompts but filter out any existing ones
  const apiMessages = [
    ...SYSTEM_PROMPTS,
    ...messages.filter((msg) => msg.role !== "system"),
  ];

  // check if the conversation requires a function call to be made
  const initialResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: apiMessages,
    stream: true,
    functions,
    function_call: "auto",
  });

  const stream = OpenAIStream(initialResponse, {
    experimental_onFunctionCall: async (
      { name, arguments: args },
      createFunctionCallMessages,
    ) => {
      const result = await runFunction(name, args);
      const newMessages = createFunctionCallMessages(result);

      // For function calls, we need to include system prompts again
      const functionCallMessages = [
        ...SYSTEM_PROMPTS,
        ...messages.filter((msg) => msg.role !== "system"),
        ...newMessages,
      ];

      return openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        stream: true,
        messages: functionCallMessages,
      });
    },
  });

  return new StreamingTextResponse(stream);
}
