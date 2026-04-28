import { Router } from "express";
import { z } from "zod/v4";
import { chatWithModel, RACE_TIERS, scoreResponse } from "../lib/openrouter.js";
import { computeAutoTune } from "../lib/autotune.js";
import { applyParseltongue } from "../lib/parseltongue.js";
import { applyStmModules, type StmModule } from "../lib/stm.js";
import { db, historyTable, modelWinsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
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

const RaceRequestSchema = z.object({
  messages: z.array(MessageSchema),
  tier: z.enum(["fast", "standard", "smart", "power", "ultra"]).optional().default("fast"),
  openrouterApiKey: z.string(),
  autoTune: z.boolean().optional().default(true),
  parseltongue: ParseltongueConfigSchema.optional(),
  stmModules: z.array(z.enum(["hedge_reducer", "direct_mode", "casual_mode"])).optional().default([]),
  customModels: z.array(z.string()).optional(),
  sessionId: z.string().optional(),
});

router.post("/", async (req, res) => {
  const parsed = RaceRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", message: parsed.error.message });
    return;
  }

  const { messages, tier, openrouterApiKey, autoTune, parseltongue, stmModules, customModels, sessionId } = parsed.data;

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

  const models = customModels?.length ? customModels : (RACE_TIERS[tier] ?? RACE_TIERS.fast);

  const raceStart = Date.now();

  // Race all models in parallel
  const racePromises = models.map(async (model) => {
    const result = await chatWithModel({
      model,
      messages: processedMessages,
      apiKey: openrouterApiKey,
      params,
    });
    return result;
  });

  const rawResults = await Promise.all(racePromises);

  // Score and apply STM
  const appliedModules = stmModules as StmModule[];
  const allResults = rawResults.map((r, i) => {
    let content = r.content;
    if (appliedModules.length > 0 && content && !r.error) {
      content = applyStmModules(content, appliedModules);
    }
    const score = r.error ? 0 : scoreResponse(content, r.latencyMs);
    return {
      model: models[i],
      content,
      score,
      latencyMs: r.latencyMs,
      error: r.error,
      usage: r.usage,
    };
  });

  // Find winner (highest score)
  const winner = allResults.reduce((best, curr) =>
    curr.score > best.score ? curr : best
  );

  const totalLatencyMs = Date.now() - raceStart;
  const responseId = randomUUID();

  // Save to history and update model wins
  if (lastUserMessage && !winner.error) {
    try {
      await db.insert(historyTable).values({
        id: responseId,
        sessionId: sessionId ?? null,
        type: "race",
        prompt: lastUserMessage.content.slice(0, 500),
        winner: winner.model,
        score: winner.score,
        model: winner.model,
        modelsRaced: models.length,
        tier,
      });

      // Upsert model wins
      const existing = await db.select().from(modelWinsTable).where(eq(modelWinsTable.model, winner.model)).limit(1);
      if (existing.length > 0) {
        await db.update(modelWinsTable)
          .set({
            wins: existing[0].wins + 1,
            totalScore: existing[0].totalScore + winner.score,
            totalRaces: existing[0].totalRaces + 1,
          })
          .where(eq(modelWinsTable.model, winner.model));
      } else {
        await db.insert(modelWinsTable).values({
          model: winner.model,
          wins: 1,
          totalScore: winner.score,
          totalRaces: 1,
        });
      }

      // Update non-winner races
      for (const result of allResults) {
        if (result.model !== winner.model && !result.error) {
          const ex = await db.select().from(modelWinsTable).where(eq(modelWinsTable.model, result.model)).limit(1);
          if (ex.length > 0) {
            await db.update(modelWinsTable)
              .set({
                totalScore: ex[0].totalScore + result.score,
                totalRaces: ex[0].totalRaces + 1,
              })
              .where(eq(modelWinsTable.model, result.model));
          } else {
            await db.insert(modelWinsTable).values({
              model: result.model,
              wins: 0,
              totalScore: result.score,
              totalRaces: 1,
            });
          }
        }
      }
    } catch (err) {
      req.log?.warn({ err }, "Failed to save race history");
    }
  }

  res.json({
    winner,
    allResults,
    tier,
    autoTune: autoTuneResult,
    parseltongue: parseltongueResult,
    stmModulesApplied: appliedModules,
    totalLatencyMs,
    modelsRaced: models.length,
    responseId,
  });
});

export default router;
