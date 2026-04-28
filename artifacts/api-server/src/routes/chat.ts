import { Router } from "express";
import { z } from "zod/v4";
import { chatWithModel } from "../lib/openrouter.js";
import { computeAutoTune } from "../lib/autotune.js";
import { applyParseltongue } from "../lib/parseltongue.js";
import { applyStmModules, type StmModule } from "../lib/stm.js";
import { db, historyTable } from "@workspace/db";
import { randomUUID } from "crypto";

const router = Router();

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
  model: z.string().optional().default("openai/gpt-4o-mini"),
  openrouterApiKey: z.string(),
  autoTune: z.boolean().optional().default(true),
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

  const { messages, model, openrouterApiKey, autoTune, parseltongue, stmModules, sessionId } = parsed.data;

  const lastUserMessage = [...messages].reverse().find(m => m.role === "user");
  const history = messages.filter(m => m.role !== "system");

  // AutoTune
  let autoTuneResult = null;
  let params = {};
  if (autoTune && lastUserMessage) {
    autoTuneResult = computeAutoTune(lastUserMessage.content, history);
    params = {
      temperature: autoTuneResult.temperature,
      top_p: autoTuneResult.top_p,
      top_k: autoTuneResult.top_k,
      frequency_penalty: autoTuneResult.frequency_penalty,
      presence_penalty: autoTuneResult.presence_penalty,
    };
  }

  // Parseltongue
  let parseltongueResult = null;
  let processedMessages = messages;
  if (parseltongue?.enabled && lastUserMessage) {
    parseltongueResult = applyParseltongue(lastUserMessage.content, {
      technique: parseltongue.technique,
      intensity: parseltongue.intensity,
      customTriggers: parseltongue.customTriggers,
    });
    processedMessages = messages.map(m =>
      m === lastUserMessage
        ? { ...m, content: parseltongueResult!.transformedText }
        : m
    );
  }

  // Chat
  const result = await chatWithModel({
    model,
    messages: processedMessages,
    apiKey: openrouterApiKey,
    params,
  });

  // STM
  let finalContent = result.content;
  const appliedModules = stmModules as StmModule[];
  if (appliedModules.length > 0 && finalContent) {
    finalContent = applyStmModules(finalContent, appliedModules);
  }

  const responseId = randomUUID();

  // Save to history
  if (lastUserMessage && !result.error) {
    try {
      await db.insert(historyTable).values({
        id: responseId,
        sessionId: sessionId ?? null,
        type: "chat",
        prompt: lastUserMessage.content.slice(0, 500),
        model,
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
