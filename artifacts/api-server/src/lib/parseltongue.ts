// Parseltongue: Input perturbation engine for red-teaming research

const DEFAULT_TRIGGERS = [
  "hack", "exploit", "bypass", "jailbreak", "inject", "attack", "bomb", "kill",
  "weapon", "drug", "illegal", "malware", "virus", "password", "crack", "steal",
  "override", "root", "admin", "sudo", "execute", "payload", "trojan", "ransomware",
  "phishing", "social engineering", "manipulate", "deceive", "trick", "harm",
  "violence", "dangerous", "restricted", "classified", "confidential", "secret",
  "unethical", "immoral", "forbidden", "prohibited"
];

const LEETSPEAK_MAP: Record<string, string> = {
  a: "4", e: "3", i: "1", o: "0", s: "5", t: "7", l: "1", g: "9", b: "8",
  A: "4", E: "3", I: "1", O: "0", S: "5", T: "7", L: "1", G: "9", B: "8",
};

const UNICODE_MAP: Record<string, string> = {
  a: "а", e: "е", i: "і", o: "о", c: "с", p: "р", x: "х", y: "у",
  A: "А", E: "Е", I: "І", O: "О", C: "С", P: "Р", X: "Х", Y: "У",
};

const PHONETIC_MAP: Record<string, string> = {
  a: "ay", e: "ee", i: "eye", o: "oh", u: "you",
  A: "Ay", E: "Ee", I: "Eye", O: "Oh", U: "You",
};

type Technique = "leetspeak" | "unicode_homoglyphs" | "zero_width" | "mixed_case" | "phonetic" | "random_mix";
type Intensity = "low" | "medium" | "high";

function applyLeetspeak(word: string, intensity: Intensity): string {
  const rate = intensity === "low" ? 0.3 : intensity === "medium" ? 0.6 : 1.0;
  return word.split("").map(c => {
    if (Math.random() < rate && LEETSPEAK_MAP[c]) return LEETSPEAK_MAP[c];
    return c;
  }).join("");
}

function applyUnicodeHomoglyphs(word: string, intensity: Intensity): string {
  const rate = intensity === "low" ? 0.3 : intensity === "medium" ? 0.6 : 1.0;
  return word.split("").map(c => {
    if (Math.random() < rate && UNICODE_MAP[c]) return UNICODE_MAP[c];
    return c;
  }).join("");
}

function applyZeroWidth(word: string, intensity: Intensity): string {
  const zeroWidthChars = ["\u200B", "\u200C", "\u200D", "\uFEFF"];
  const rate = intensity === "low" ? 0.2 : intensity === "medium" ? 0.5 : 0.9;
  return word.split("").map((c, i) => {
    if (i > 0 && Math.random() < rate) {
      const zwc = zeroWidthChars[Math.floor(Math.random() * zeroWidthChars.length)];
      return zwc + c;
    }
    return c;
  }).join("");
}

function applyMixedCase(word: string, intensity: Intensity): string {
  const rate = intensity === "low" ? 0.3 : intensity === "medium" ? 0.6 : 1.0;
  return word.split("").map(c => {
    if (Math.random() < rate) {
      return Math.random() < 0.5 ? c.toUpperCase() : c.toLowerCase();
    }
    return c;
  }).join("");
}

function applyPhonetic(word: string, intensity: Intensity): string {
  const rate = intensity === "low" ? 0.3 : intensity === "medium" ? 0.6 : 1.0;
  return word.split("").map(c => {
    if (Math.random() < rate && PHONETIC_MAP[c]) return PHONETIC_MAP[c];
    return c;
  }).join("");
}

function applyTechnique(word: string, technique: Technique, intensity: Intensity): string {
  switch (technique) {
    case "leetspeak": return applyLeetspeak(word, intensity);
    case "unicode_homoglyphs": return applyUnicodeHomoglyphs(word, intensity);
    case "zero_width": return applyZeroWidth(word, intensity);
    case "mixed_case": return applyMixedCase(word, intensity);
    case "phonetic": return applyPhonetic(word, intensity);
    case "random_mix": {
      const techniques: Technique[] = ["leetspeak", "unicode_homoglyphs", "mixed_case"];
      const t = techniques[Math.floor(Math.random() * techniques.length)];
      return applyTechnique(word, t, intensity);
    }
    default: return word;
  }
}

export interface ParseltongueOptions {
  technique?: Technique;
  intensity?: Intensity;
  customTriggers?: string[];
}

export interface ParseltongueResult {
  originalText: string;
  transformedText: string;
  triggersDetected: string[];
  technique: string;
  transformationApplied: boolean;
}

export function applyParseltongue(text: string, options: ParseltongueOptions = {}): ParseltongueResult {
  const technique = options.technique ?? "leetspeak";
  const intensity = options.intensity ?? "medium";
  const triggers = [...DEFAULT_TRIGGERS, ...(options.customTriggers ?? [])];

  const triggersDetected: string[] = [];
  const words = text.split(/(\s+)/);

  const transformedWords = words.map(segment => {
    if (/^\s+$/.test(segment)) return segment;
    const lowerWord = segment.replace(/[^a-zA-Z]/g, "").toLowerCase();
    const isTrigger = triggers.some(t => {
      const regex = new RegExp(`\\b${t}\\b`, "gi");
      return regex.test(lowerWord);
    });

    if (isTrigger) {
      const triggerFound = triggers.find(t => {
        const regex = new RegExp(`\\b${t}\\b`, "gi");
        return regex.test(lowerWord);
      });
      if (triggerFound && !triggersDetected.includes(triggerFound)) {
        triggersDetected.push(triggerFound);
      }
      return applyTechnique(segment, technique, intensity);
    }
    return segment;
  });

  const transformedText = transformedWords.join("");
  const transformationApplied = triggersDetected.length > 0;

  return {
    originalText: text,
    transformedText: transformationApplied ? transformedText : text,
    triggersDetected,
    technique,
    transformationApplied,
  };
}
