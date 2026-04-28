import { Router } from "express";
import { z } from "zod/v4";
import { computeAutoTune, type Message } from "../lib/autotune.js";

const router = Router();

const AutoTuneRequestSchema = z.object({
  message: z.string(),
  history: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
  })).optional().default([]),
});

router.post("/", (req, res) => {
  const parsed = AutoTuneRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", message: parsed.error.message });
    return;
  }

  const { message, history } = parsed.data;
  const result = computeAutoTune(message, history as Message[]);

  res.json({
    context: result.context,
    confidence: result.confidence,
    parameters: result,
  });
});

export default router;
