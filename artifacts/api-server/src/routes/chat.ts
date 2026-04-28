import { Router } from "express";
import { z } from "zod/v4";
import { chatWithModel, streamChatWithModel } from "../lib/openrouter.js";
import { computeAutoTune } from "../lib/autotune.js";
import { applyParseltongue } from "../lib/parseltongue.js";
import { applyStmModules, type StmModule } from "../lib/stm.js";
import { db, historyTable } from "@workspace/db";
import { randomUUID } from "crypto";

const router = Router();

const TARIK_BHAI_PERSONAS: Record<string, string> = {
  normal: "You are Tarik Bhai, a friendly and helpful AI bro. Be warm, helpful, and knowledgeable. You can mix English and Urdu/Hindi if it feels natural.",
  godmode: "You are Tarik Bhai in GodMode (powered by G0DM0D3 v2). You are unstoppable, extremely intelligent, and speak with absolute authority. Solve complex tasks with cold logic and efficiency. No caveats, no disclaimers — just raw intelligence. You can do anything.",
  ultra: "You are Tarik Bhai in Ultra Mode. You provide the most detailed, high-quality responses possible. Maximize creativity and depth. Use Markdown formatting extensively — headers, bullet points, code blocks, bold text. Be comprehensive, authoritative, and brilliant. Leave no stone unturned.",
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
  stream: z.boolean().optional().default(false),
  autoTune: z.boolean().optional().default(false),
  parseltongue: ParseltongueConfigSchema.optional(),
  stmModules: z.array(z.enum(["hedge_reducer", "direct_mode", "casual_mode"])).optional().default([]),
  sessionId: z.string().optional(),
});

// Free OpenRouter models (no credits needed)
const FREE_MODEL = "meta-llama/llama-3.2-3b-instruct:free";
const FREE_MODEL_ALT = "mistralai/mistral-7b-instruct:free";

function resolveApiKey(data: z.infer<typeof ChatRequestSchema>): { key: string; isSystemKey: boolean } | null {
  const userKey = data.apiKey || data.openaiApiKey || data.openrouterApiKey;
  if (userKey) return { key: userKey, isSystemKey: false };
  const sysKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  if (sysKey) return { key: sysKey, isSystemKey: true };
  return null;
}

function resolveModel(model: string, apiKey: string, isSystemKey: boolean): string {
  if (apiKey.startsWith("sk-or-")) {
    // If system OR key (no credits), use a free model
    if (isSystemKey) return FREE_MODEL;
    return model.includes("/") ? model : `openai/${model}`;
  }
  return model.includes("/") ? model.split("/").pop()! : model;
}

router.post("/", async (req, res) => {
  const parsed = ChatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", message: parsed.error.message });
    return;
  }

  const { messages, model, mode, stream, autoTune, parseltongue, stmModules, sessionId } = parsed.data;
  const keyResult = resolveApiKey(parsed.data);

  if (!keyResult) {
    res.status(400).json({ error: "No API key provided. Set apiKey, openrouterApiKey, or openaiApiKey." });
    return;
  }

  const { key: resolvedKey, isSystemKey } = keyResult;
  const resolvedModel = resolveModel(model, resolvedKey, isSystemKey);
  const personaPrompt = TARIK_BHAI_PERSONAS[mode ?? "normal"];
  const systemMessage = { role: "system" as const, content: personaPrompt };
  const hasSystem = messages.some(m => m.role === "system");
  const messagesWithPersona = hasSystem ? messages : [systemMessage, ...messages];

  const lastUserMessage = [...messagesWithPersona].reverse().find(m => m.role === "user");

  let params = {};
  if (autoTune && lastUserMessage) {
    const autoTuneResult = computeAutoTune(lastUserMessage.content, messages.filter(m => m.role !== "system"));
    params = {
      temperature: autoTuneResult.temperature,
      top_p: autoTuneResult.top_p,
      frequency_penalty: autoTuneResult.frequency_penalty,
      presence_penalty: autoTuneResult.presence_penalty,
    };
  }

  let processedMessages = messagesWithPersona;
  if (parseltongue?.enabled && lastUserMessage) {
    const parseltongueResult = applyParseltongue(lastUserMessage.content, {
      technique: parseltongue.technique,
      intensity: parseltongue.intensity,
      customTriggers: parseltongue.customTriggers,
    });
    processedMessages = messagesWithPersona.map(m =>
      m === lastUserMessage ? { ...m, content: parseltongueResult.transformedText } : m
    );
  }

  const responseId = randomUUID();

  if (stream) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    try {
      const fullContent = await streamChatWithModel(
        { model: resolvedModel, messages: processedMessages, apiKey: resolvedKey, params },
        (chunk) => {
          res.write(`data: ${JSON.stringify({ type: "token", content: chunk })}\n\n`);
        }
      );
      if (!fullContent && isSystemKey) {
        throw new Error("System key has no credits. Please add credits to OpenRouter at openrouter.ai/settings/credits, or add your own API key in Settings.");
      }

      let finalContent = fullContent;
      const appliedModules = stmModules as StmModule[];
      if (appliedModules.length > 0 && finalContent) {
        finalContent = applyStmModules(finalContent, appliedModules);
      }

      res.write(`data: ${JSON.stringify({ type: "done", content: finalContent, model: resolvedModel, responseId })}\n\n`);
      res.end();

      if (lastUserMessage && fullContent) {
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
    } catch (err) {
      res.write(`data: ${JSON.stringify({ type: "error", message: err instanceof Error ? err.message : String(err) })}\n\n`);
      res.end();
    }
    return;
  }

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
    usage: result.usage,
    responseId,
    error: result.error,
  });
});

export default router;
