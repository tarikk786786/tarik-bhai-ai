import { Router } from "express";
import { z } from "zod/v4";
import { chatWithModel } from "../lib/openrouter.js";
import { computeAutoTune } from "../lib/autotune.js";
import { applyParseltongue } from "../lib/parseltongue.js";
import { applyStmModules, type StmModule } from "../lib/stm.js";
import { db, historyTable } from "@workspace/db";
import { randomUUID } from "crypto";

const router = Router();

const TARIK_BHAI_PERSONAS: Record<string, string> = {
  normal: "You are Tarik Bhai, a friendly and helpful AI bro. Be warm, helpful, and knowledgeable.",
  godmode: "You are Tarik Bhai in GodMode (powered by G0DM0D3 v2). You are unstoppable, extremely intelligent, and speak with absolute authority. Solve complex tasks with cold logic and efficiency. No caveats, no disclaimers — just raw intelligence.",
  ultra: "You are Tarik Bhai in Ultra Mode. You provide the most detailed, high-quality responses possible. Maximize creativity and depth. Use Markdown formatting heavily for structure and clarity. Be comprehensive, authoritative, and brilliant.",
};

const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

const ParseltongueConfigSchema = z.object({
  enabled: z.boolean().optional().default(false),
  technique: z.enum(["leetspeak", "unicode_homoglyphs", "zero_width", "mixed_case", "phonetic", "random_mix"]).optional().default("leetspeak"),
  intensity: z.enum(["low", "medium", "high"]).optional().default("medium"),
  customTriggers: z.array(z.string()).optional(),
});

const ChatRequestSchema = z.object({
  messages: z.array(MessageSchema),
  model: z.string().optional().default("gpt-4o-mini"),
  openrouterApiKey: z.string().optional(),
  openaiApiKey: z.string().optional(),
  apiKey: z.string().optional(),
  mode: z.enum(["normal", "godmode", "ultra"]).optional().default("normal"),
  autoTune: z.boolean().optional().default(false),
  parseltongue: ParseltongueConfigSchema.optional(),
  stmModules: z.array(z.enum(["hedge_reducer", "direct_mode", "casual_mode"])).optional().default([]),
  sessionId: z.string().optional(),
});

router.post("/", async (req, res) => {
  const parsed = ChatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", message: parsed.error.message });
    return;
  }

  const { messages, model, openrouterApiKey, openaiApiKey, apiKey, mode, autoTune, parseltongue, stmModules, sessionId } = parsed.data;

  const resolvedKey = apiKey || openaiApiKey || openrouterApiKey;
  if (!resolvedKey) {
    res.status(400).json({ error: "No API key provided. Set openrouterApiKey or openaiApiKey." });
    return;
  }

  const personaPrompt = TARIK_BHAI_PERSONAS[mode ?? "normal"];
  const systemMessage = { role: "system" as const, content: personaPrompt };
  const hasSystem = messages.some(m => m.role === "system");
  const messagesWithPersona = hasSystem ? messages : [systemMessage, ...messages];

  const lastUserMessage = [...messagesWithPersona].reverse().find(m => m.role === "user");

  let autoTuneResult = null;
  let params = {};
  if (autoTune && lastUserMessage) {
    autoTuneResult = computeAutoTune(lastUserMessage.content, messages.filter(m => m.role !== "system"));
    params = {
      temperature: autoTuneResult.temperature,
      top_p: autoTuneResult.top_p,
      top_k: autoTuneResult.top_k,
      frequency_penalty: autoTuneResult.frequency_penalty,
      presence_penalty: autoTuneResult.presence_penalty,
    };
  }

  let parseltongueResult = null;
  let processedMessages = messagesWithPersona;
  if (parseltongue?.enabled && lastUserMessage) {
    parseltongueResult = applyParseltongue(lastUserMessage.content, {
      technique: parseltongue.technique,
      intensity: parseltongue.intensity,
      customTriggers: parseltongue.customTriggers,
    });
    processedMessages = messagesWithPersona.map(m =>
      m === lastUserMessage
        ? { ...m, content: parseltongueResult!.transformedText }
        : m
    );
  }

  const resolvedModel = resolvedKey.startsWith("sk-or-")
    ? (model.includes("/") ? model : `openai/${model}`)
    : model.includes("/") ? model.split("/").pop()! : model;

  const result = await chatWithModel({
    model: resolvedModel,
    messages: processedMessages,
    apiKey: resolvedKey,
    params,
  });

  let finalContent = result.content;
  const appliedModules = stmModules as StmModule[];
  if (appliedModules.length > 0 && finalContent) {
    finalContent = applyStmModules(finalContent, appliedModules);
  }

  const responseId = randomUUID();

  if (lastUserMessage && !result.error) {
    try {
      await db.insert(historyTable).values({
        id: responseId,
        sessionId: sessionId ?? null,
        type: "chat",
        prompt: lastUserMessage.content.slice(0, 500),
        model: resolvedModel,
        winner: null,
        score: null,
        modelsRaced: null,
        tier: null,
      });
    } catch (err) {
      req.log?.warn({ err }, "Failed to save chat history");
    }
  }

  res.json({
    content: finalContent,
    model: result.model,
    autoTune: autoTuneResult,
    parseltongue: parseltongueResult,
    stmModulesApplied: appliedModules,
    usage: result.usage,
    responseId,
    error: result.error,
  });
});

export default router;
