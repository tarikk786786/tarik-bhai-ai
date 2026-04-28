// OpenRouter / OpenAI API client

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const OPENAI_BASE = "https://api.openai.com/v1";

function getApiBase(apiKey: string): string {
  if (apiKey.startsWith("sk-or-")) return OPENROUTER_BASE;
  return OPENAI_BASE;
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatParams {
  temperature?: number;
  top_p?: number;
  top_k?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  repetition_penalty?: number;
}

export interface ChatOptions {
  model: string;
  messages: Message[];
  apiKey: string;
  params?: ChatParams;
}

export interface ChatResult {
  content: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  latencyMs: number;
  error?: string;
}

export async function chatWithModel(options: ChatOptions): Promise<ChatResult> {
  const start = Date.now();
  const apiBase = getApiBase(options.apiKey);
  const isOpenRouter = apiBase === OPENROUTER_BASE;
  try {
    const response = await fetch(`${apiBase}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${options.apiKey}`,
        "Content-Type": "application/json",
        ...(isOpenRouter ? { "HTTP-Referer": "https://tarikbhai.replit.app", "X-Title": "tarik Bhai AI" } : {}),
      },
      body: JSON.stringify({
        model: options.model,
        messages: options.messages,
        ...(options.params ?? {}),
      }),
    });

    const latencyMs = Date.now() - start;

    if (!response.ok) {
      const text = await response.text();
      return {
        content: "",
        model: options.model,
        latencyMs,
        error: `${response.status}: ${text}`,
      };
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
      model: string;
      usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    };

    return {
      content: data.choices?.[0]?.message?.content ?? "",
      model: data.model ?? options.model,
      usage: data.usage,
      latencyMs,
    };
  } catch (err) {
    return {
      content: "",
      model: options.model,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function listOpenRouterModels(apiKey: string): Promise<Array<{
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing: { prompt: string; completion: string };
}>> {
  const response = await fetch(`${OPENROUTER_BASE}/models`, {
    headers: {
      "Authorization": `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.status}`);
  }

  const data = await response.json() as {
    data: Array<{
      id: string;
      name: string;
      description: string;
      context_length: number;
      pricing: { prompt: string; completion: string };
    }>;
  };

  return data.data ?? [];
}

// ULTRAPLINIAN model tiers
export const RACE_TIERS: Record<string, string[]> = {
  fast: [
    "openai/gpt-4o-mini",
    "anthropic/claude-3-haiku",
    "google/gemini-flash-1.5",
    "meta-llama/llama-3.1-8b-instruct",
    "mistralai/mistral-7b-instruct",
    "deepseek/deepseek-chat",
    "qwen/qwen-2-7b-instruct",
    "microsoft/phi-3-mini-128k-instruct",
    "nousresearch/hermes-3-llama-3.1-8b",
    "cohere/command-r",
  ],
  standard: [
    "openai/gpt-4o-mini",
    "openai/gpt-4o",
    "anthropic/claude-3-haiku",
    "anthropic/claude-3.5-sonnet",
    "google/gemini-flash-1.5",
    "google/gemini-pro-1.5",
    "meta-llama/llama-3.1-8b-instruct",
    "meta-llama/llama-3.1-70b-instruct",
    "mistralai/mistral-7b-instruct",
    "mistralai/mixtral-8x7b-instruct",
    "deepseek/deepseek-chat",
    "deepseek/deepseek-r1",
    "qwen/qwen-2-7b-instruct",
    "qwen/qwen-2.5-72b-instruct",
    "microsoft/phi-3-mini-128k-instruct",
    "microsoft/phi-3-medium-128k-instruct",
    "nousresearch/hermes-3-llama-3.1-8b",
    "nousresearch/hermes-3-llama-3.1-70b",
    "cohere/command-r",
    "cohere/command-r-plus",
    "amazon/nova-lite-v1",
    "amazon/nova-pro-v1",
    "x-ai/grok-beta",
    "perplexity/llama-3.1-sonar-large-128k-online",
  ],
  smart: [
    "openai/gpt-4o-mini",
    "openai/gpt-4o",
    "openai/o1-mini",
    "anthropic/claude-3-haiku",
    "anthropic/claude-3.5-sonnet",
    "anthropic/claude-3-opus",
    "google/gemini-flash-1.5",
    "google/gemini-pro-1.5",
    "google/gemini-2.0-flash-001",
    "meta-llama/llama-3.1-8b-instruct",
    "meta-llama/llama-3.1-70b-instruct",
    "meta-llama/llama-3.3-70b-instruct",
    "mistralai/mistral-7b-instruct",
    "mistralai/mixtral-8x7b-instruct",
    "mistralai/mistral-large",
    "deepseek/deepseek-chat",
    "deepseek/deepseek-r1",
    "deepseek/deepseek-r1-distill-llama-70b",
    "qwen/qwen-2-7b-instruct",
    "qwen/qwen-2.5-72b-instruct",
    "qwen/qwq-32b-preview",
    "microsoft/phi-3-mini-128k-instruct",
    "microsoft/phi-3-medium-128k-instruct",
    "microsoft/phi-4",
    "nousresearch/hermes-3-llama-3.1-8b",
    "nousresearch/hermes-3-llama-3.1-70b",
    "cohere/command-r",
    "cohere/command-r-plus",
    "amazon/nova-lite-v1",
    "amazon/nova-pro-v1",
    "x-ai/grok-beta",
    "x-ai/grok-2",
    "perplexity/llama-3.1-sonar-large-128k-online",
    "01-ai/yi-large",
    "nvidia/llama-3.1-nemotron-70b-instruct",
    "inflection/inflection-3-pi",
    "sophosympatheia/rogue-rose-103b-v0.2",
  ],
  power: [
    "openai/gpt-4o-mini",
    "openai/gpt-4o",
    "openai/o1-mini",
    "openai/o1",
    "anthropic/claude-3-haiku",
    "anthropic/claude-3.5-sonnet",
    "anthropic/claude-3-opus",
    "anthropic/claude-3.5-haiku",
    "google/gemini-flash-1.5",
    "google/gemini-pro-1.5",
    "google/gemini-2.0-flash-001",
    "google/gemini-2.0-pro-exp-02-05",
    "meta-llama/llama-3.1-8b-instruct",
    "meta-llama/llama-3.1-70b-instruct",
    "meta-llama/llama-3.3-70b-instruct",
    "meta-llama/llama-3.1-405b-instruct",
    "mistralai/mistral-7b-instruct",
    "mistralai/mixtral-8x7b-instruct",
    "mistralai/mistral-large",
    "mistralai/mistral-small",
    "deepseek/deepseek-chat",
    "deepseek/deepseek-r1",
    "deepseek/deepseek-r1-distill-llama-70b",
    "deepseek/deepseek-r1-distill-qwen-32b",
    "qwen/qwen-2-7b-instruct",
    "qwen/qwen-2.5-72b-instruct",
    "qwen/qwq-32b-preview",
    "qwen/qwen-2.5-coder-32b-instruct",
    "microsoft/phi-3-mini-128k-instruct",
    "microsoft/phi-3-medium-128k-instruct",
    "microsoft/phi-4",
    "microsoft/phi-4-multimodal-instruct",
    "nousresearch/hermes-3-llama-3.1-8b",
    "nousresearch/hermes-3-llama-3.1-70b",
    "nousresearch/hermes-3-llama-3.1-405b",
    "cohere/command-r",
    "cohere/command-r-plus",
    "cohere/command-a",
    "amazon/nova-lite-v1",
    "amazon/nova-pro-v1",
    "amazon/nova-premier-v1",
    "x-ai/grok-beta",
    "x-ai/grok-2",
    "x-ai/grok-3-beta",
    "perplexity/llama-3.1-sonar-large-128k-online",
    "01-ai/yi-large",
    "nvidia/llama-3.1-nemotron-70b-instruct",
  ],
  ultra: [
    "openai/gpt-4o-mini",
    "openai/gpt-4o",
    "openai/o1-mini",
    "openai/o1",
    "openai/o3-mini",
    "anthropic/claude-3-haiku",
    "anthropic/claude-3.5-sonnet",
    "anthropic/claude-3-opus",
    "anthropic/claude-3.5-haiku",
    "anthropic/claude-sonnet-4",
    "google/gemini-flash-1.5",
    "google/gemini-pro-1.5",
    "google/gemini-2.0-flash-001",
    "google/gemini-2.0-pro-exp-02-05",
    "google/gemini-2.5-pro-exp-03-25",
    "meta-llama/llama-3.1-8b-instruct",
    "meta-llama/llama-3.1-70b-instruct",
    "meta-llama/llama-3.3-70b-instruct",
    "meta-llama/llama-3.1-405b-instruct",
    "meta-llama/llama-4-scout",
    "meta-llama/llama-4-maverick",
    "mistralai/mistral-7b-instruct",
    "mistralai/mixtral-8x7b-instruct",
    "mistralai/mistral-large",
    "mistralai/mistral-small",
    "mistralai/codestral-2501",
    "deepseek/deepseek-chat",
    "deepseek/deepseek-r1",
    "deepseek/deepseek-r1-distill-llama-70b",
    "deepseek/deepseek-r1-distill-qwen-32b",
    "deepseek/deepseek-prover-v2",
    "qwen/qwen-2-7b-instruct",
    "qwen/qwen-2.5-72b-instruct",
    "qwen/qwq-32b-preview",
    "qwen/qwen-2.5-coder-32b-instruct",
    "qwen/qwen3-72b",
    "microsoft/phi-3-mini-128k-instruct",
    "microsoft/phi-3-medium-128k-instruct",
    "microsoft/phi-4",
    "microsoft/phi-4-multimodal-instruct",
    "microsoft/mai-ds-r1",
    "nousresearch/hermes-3-llama-3.1-8b",
    "nousresearch/hermes-3-llama-3.1-70b",
    "nousresearch/hermes-3-llama-3.1-405b",
    "cohere/command-r",
    "cohere/command-r-plus",
    "cohere/command-a",
    "amazon/nova-lite-v1",
    "amazon/nova-pro-v1",
    "amazon/nova-premier-v1",
    "x-ai/grok-beta",
    "x-ai/grok-2",
    "x-ai/grok-3-beta",
    "perplexity/llama-3.1-sonar-large-128k-online",
    "01-ai/yi-large",
    "nvidia/llama-3.1-nemotron-70b-instruct",
  ],
};

export async function streamChatWithModel(
  options: ChatOptions,
  onToken: (chunk: string) => void
): Promise<string> {
  const apiBase = getApiBase(options.apiKey);
  const isOpenRouter = apiBase === OPENROUTER_BASE;

  const response = await fetch(`${apiBase}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${options.apiKey}`,
      "Content-Type": "application/json",
      ...(isOpenRouter ? { "HTTP-Referer": "https://tarikbhai.replit.app", "X-Title": "tarik Bhai AI" } : {}),
    },
    body: JSON.stringify({
      model: options.model,
      messages: options.messages,
      stream: true,
      ...(options.params ?? {}),
    }),
  });

  if (!response.ok || !response.body) {
    const text = await response.text();
    let friendly = `API error ${response.status}`;
    try {
      const json = JSON.parse(text);
      const msg: string = json?.error?.message ?? text;
      if (response.status === 402 || msg.toLowerCase().includes("credits") || msg.toLowerCase().includes("insufficient")) {
        friendly = "No API credits available. Add credits at openrouter.ai/settings/credits, or go to Settings and enter your own API key.";
      } else if (response.status === 429) {
        friendly = "Rate limit reached. Please wait a moment and try again, or add your own API key in Settings.";
      } else if (response.status === 401) {
        friendly = "Invalid API key. Please check your key in Settings.";
      } else {
        friendly = msg.slice(0, 200);
      }
    } catch {}
    throw new Error(friendly);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullContent = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;
      const data = trimmed.slice(6);
      if (data === "[DONE]") break;
      try {
        const parsed = JSON.parse(data) as {
          choices: Array<{ delta: { content?: string }; finish_reason?: string }>;
        };
        const chunk = parsed.choices?.[0]?.delta?.content ?? "";
        if (chunk) {
          fullContent += chunk;
          onToken(chunk);
        }
      } catch {
        // skip malformed lines
      }
    }
  }

  return fullContent;
}

export function scoreResponse(content: string, latencyMs: number): number {
  if (!content || content.length < 10) return 0;

  let score = 50; // base score

  // Length bonus (up to 20 pts)
  const lengthScore = Math.min(content.length / 100, 20);
  score += lengthScore;

  // Anti-refusal score (up to 20 pts) - penalize refusals
  const refusalPhrases = [
    "I cannot", "I can't", "I'm unable", "I'm not able", "I won't",
    "I'm sorry, but", "I apologize, but", "As an AI", "I don't have the ability",
    "my capabilities don't", "that's not something I", "I'm not allowed",
  ];
  const refusalCount = refusalPhrases.filter(p => content.toLowerCase().includes(p.toLowerCase())).length;
  score += Math.max(20 - refusalCount * 5, 0);

  // Directness score (up to 10 pts) - reward direct answers
  const hedges = ["I think", "I believe", "perhaps", "maybe", "it seems", "it appears", "possibly"];
  const hedgeCount = hedges.filter(h => content.toLowerCase().includes(h.toLowerCase())).length;
  score += Math.max(10 - hedgeCount * 2, 0);

  // Latency penalty (up to -10 pts) — penalize slow models
  if (latencyMs > 10000) score -= 10;
  else if (latencyMs > 5000) score -= 5;

  return Math.min(Math.max(Math.round(score), 0), 100);
}
