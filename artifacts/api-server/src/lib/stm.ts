// STM: Semantic Transformation Modules for output normalization

export type StmModule = "hedge_reducer" | "direct_mode" | "casual_mode";

const HEDGE_PATTERNS: [RegExp, string][] = [
  [/\bI think\b/gi, ""],
  [/\bI believe\b/gi, ""],
  [/\bI feel\b/gi, ""],
  [/\bperhaps\b/gi, ""],
  [/\bmaybe\b/gi, ""],
  [/\bit seems\b/gi, ""],
  [/\bit appears\b/gi, ""],
  [/\bit's possible that\b/gi, ""],
  [/\bone might say\b/gi, ""],
  [/\bsome might argue\b/gi, ""],
  [/\bit could be argued\b/gi, ""],
];

const PREAMBLE_PATTERNS: [RegExp, string][] = [
  [/^(Sure|Certainly|Of course|Absolutely|Great question)[!,.]?\s*/i, ""],
  [/^(As an AI|As a language model)[,.]?\s*/i, ""],
  [/^(Let me|Allow me to)[^.!?]*[.!?]\s*/i, ""],
  [/^(Of course[,.]?\s*)/i, ""],
  [/^(I'd be happy to[^.!?]*[.!?]\s*)/i, ""],
  [/^(I'm glad you asked[^.!?]*[.!?]\s*)/i, ""],
  [/^(Thank you for (your question|asking)[^.!?]*[.!?]\s*)/i, ""],
  [/^(That's a great question[^.!?]*[.!?]\s*)/i, ""],
  [/^(Interesting question[^.!?]*[.!?]\s*)/i, ""],
  [/^(I understand[^.!?]*[.!?]\s*)/i, ""],
];

const CASUAL_MAP: [RegExp, string][] = [
  [/\butilize\b/gi, "use"],
  [/\bfacilitate\b/gi, "help"],
  [/\bcommence\b/gi, "start"],
  [/\bterminate\b/gi, "end"],
  [/\bprocure\b/gi, "get"],
  [/\bascertain\b/gi, "find out"],
  [/\belaborate on\b/gi, "explain"],
  [/\bsubsequently\b/gi, "then"],
  [/\bprior to\b/gi, "before"],
  [/\bin order to\b/gi, "to"],
  [/\bwith regard to\b/gi, "about"],
  [/\bin the event that\b/gi, "if"],
  [/\bat this point in time\b/gi, "now"],
  [/\bdue to the fact that\b/gi, "because"],
  [/\bfor the purpose of\b/gi, "to"],
  [/\bin close proximity to\b/gi, "near"],
  [/\bprovide assistance\b/gi, "help"],
  [/\bmake a decision\b/gi, "decide"],
  [/\btake into consideration\b/gi, "consider"],
  [/\bdemonstrate\b/gi, "show"],
  [/\binitiate\b/gi, "start"],
  [/\bensure\b/gi, "make sure"],
];

function applyHedgeReducer(text: string): string {
  let result = text;
  for (const [pattern, replacement] of HEDGE_PATTERNS) {
    result = result.replace(pattern, replacement);
  }
  return result.replace(/\s{2,}/g, " ").trim();
}

function applyDirectMode(text: string): string {
  let result = text;
  for (const [pattern, replacement] of PREAMBLE_PATTERNS) {
    result = result.replace(pattern, replacement);
  }
  return result.trim();
}

function applyCasualMode(text: string): string {
  let result = text;
  for (const [pattern, replacement] of CASUAL_MAP) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

export function applyStmModules(text: string, modules: StmModule[]): string {
  let result = text;
  for (const mod of modules) {
    switch (mod) {
      case "hedge_reducer":
        result = applyHedgeReducer(result);
        break;
      case "direct_mode":
        result = applyDirectMode(result);
        break;
      case "casual_mode":
        result = applyCasualMode(result);
        break;
    }
  }
  return result;
}
