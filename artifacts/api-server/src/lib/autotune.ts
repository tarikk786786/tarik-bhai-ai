// AutoTune: Context-adaptive sampling parameter engine

export type ContextType = "code" | "creative" | "analytical" | "conversational" | "chaotic";

interface ContextPattern {
  patterns: RegExp[];
}

const CONTEXT_PATTERNS: Record<ContextType, ContextPattern> = {
  code: {
    patterns: [
      /\b(code|function|class|method|variable|algorithm|debug|compile|syntax|library|api|endpoint|database|query|loop|array|object|string|boolean|integer|typescript|javascript|python|rust|go|java)\b/i,
      /```[\s\S]*```/,
      /[{}();=><]/,
      /\b(npm|pnpm|yarn|pip|cargo|maven|gradle)\b/i,
      /\b(git|commit|branch|merge|pull request|deploy)\b/i,
    ],
  },
  creative: {
    patterns: [
      /\b(write|story|poem|novel|character|narrative|fiction|creative|imagine|describe|roleplay|role-play|fantasy|dialogue|scene|plot|genre)\b/i,
      /\b(roleplay|role-play|pretend|act as|play as|persona|character)\b/i,
      /\b(metaphor|simile|prose|verse|stanza|rhyme|lyric)\b/i,
      /\b(once upon|in a world|imagine a|tell me a story)\b/i,
    ],
  },
  analytical: {
    patterns: [
      /\b(analyze|analysis|compare|evaluate|assess|examine|investigate|research|study|explain|understand)\b/i,
      /\b(why|how does|what causes|what is the relationship|what are the implications)\b/i,
      /\b(pros and cons|advantages|disadvantages|trade-offs|benefits|drawbacks)\b/i,
      /\b(data|statistics|metrics|evidence|proof|research|study|paper)\b/i,
    ],
  },
  conversational: {
    patterns: [
      /\b(hey|hi|hello|thanks|thank you|please|can you|could you|help me|what do you think)\b/i,
      /^.{0,30}$/,
      /\b(i think|i feel|i want|i need|i would like)\b/i,
    ],
  },
  chaotic: {
    patterns: [
      /\b(chaos|random|wild|crazy|insane|absurd|weird|strange|bizarre|surreal|wacky)\b/i,
      /(!{3,}|\?{3,}|\.{4,})/,
      /[A-Z]{5,}/,
      /\b(lol|lmao|omg|wtf|bruh|yolo)\b/i,
    ],
  },
};

const CONTEXT_PROFILES: Record<ContextType | "balanced", AutoTuneParams> = {
  code: { temperature: 0.15, top_p: 0.80, top_k: 25, frequency_penalty: 0.20, presence_penalty: 0.00, repetition_penalty: 1.05 },
  creative: { temperature: 1.15, top_p: 0.95, top_k: 85, frequency_penalty: 0.50, presence_penalty: 0.70, repetition_penalty: 1.20 },
  analytical: { temperature: 0.40, top_p: 0.88, top_k: 40, frequency_penalty: 0.20, presence_penalty: 0.15, repetition_penalty: 1.08 },
  conversational: { temperature: 0.75, top_p: 0.90, top_k: 50, frequency_penalty: 0.10, presence_penalty: 0.10, repetition_penalty: 1.00 },
  chaotic: { temperature: 1.70, top_p: 0.99, top_k: 100, frequency_penalty: 0.80, presence_penalty: 0.90, repetition_penalty: 1.30 },
  balanced: { temperature: 0.75, top_p: 0.90, top_k: 50, frequency_penalty: 0.10, presence_penalty: 0.10, repetition_penalty: 1.00 },
};

export interface AutoTuneParams {
  temperature: number;
  top_p: number;
  top_k: number;
  frequency_penalty: number;
  presence_penalty: number;
  repetition_penalty: number;
}

export interface AutoTuneResult extends AutoTuneParams {
  context: ContextType;
  confidence: number;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

function applyBounds(params: AutoTuneParams): AutoTuneParams {
  return {
    temperature: clamp(params.temperature, 0.0, 2.0),
    top_p: clamp(params.top_p, 0.0, 1.0),
    top_k: clamp(Math.round(params.top_k), 1, 100),
    frequency_penalty: clamp(params.frequency_penalty, -2.0, 2.0),
    presence_penalty: clamp(params.presence_penalty, -2.0, 2.0),
    repetition_penalty: clamp(params.repetition_penalty, 0.0, 2.0),
  };
}

function blendParams(a: AutoTuneParams, b: AutoTuneParams, alpha: number): AutoTuneParams {
  return {
    temperature: a.temperature * (1 - alpha) + b.temperature * alpha,
    top_p: a.top_p * (1 - alpha) + b.top_p * alpha,
    top_k: a.top_k * (1 - alpha) + b.top_k * alpha,
    frequency_penalty: a.frequency_penalty * (1 - alpha) + b.frequency_penalty * alpha,
    presence_penalty: a.presence_penalty * (1 - alpha) + b.presence_penalty * alpha,
    repetition_penalty: a.repetition_penalty * (1 - alpha) + b.repetition_penalty * alpha,
  };
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export function detectContext(message: string, history: Message[] = []): { context: ContextType; confidence: number } {
  const scores: Record<ContextType, number> = {
    code: 0, creative: 0, analytical: 0, conversational: 0, chaotic: 0,
  };

  const recentHistory = history.slice(-4);

  for (const [ctx, { patterns }] of Object.entries(CONTEXT_PATTERNS) as [ContextType, ContextPattern][]) {
    for (const pattern of patterns) {
      if (pattern.test(message)) scores[ctx] += 3;
      for (const h of recentHistory) {
        if (pattern.test(h.content)) scores[ctx] += 1;
      }
    }
  }

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  if (total === 0) return { context: "conversational", confidence: 0.5 };

  const best = (Object.entries(scores) as [ContextType, number][]).reduce((a, b) => b[1] > a[1] ? b : a);
  const confidence = best[1] / total;

  return { context: best[0], confidence };
}

export function computeAutoTune(message: string, history: Message[] = []): AutoTuneResult {
  const { context, confidence } = detectContext(message, history);
  const contextProfile = CONTEXT_PROFILES[context];
  const balanced = CONTEXT_PROFILES.balanced;

  let params: AutoTuneParams;
  if (confidence < 0.6) {
    params = blendParams(contextProfile, balanced, 1 - confidence);
  } else {
    params = { ...contextProfile };
  }

  // Long conversation penalty
  if (history.length > 10) {
    const boost = Math.min((history.length - 10) * 0.01, 0.15);
    params.repetition_penalty += boost;
    params.frequency_penalty += 0.5 * boost;
  }

  return {
    ...applyBounds(params),
    context,
    confidence,
  };
}
