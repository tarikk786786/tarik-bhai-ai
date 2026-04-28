import { Router } from "express";
import { z } from "zod/v4";
import { applyParseltongue } from "../lib/parseltongue.js";

const router = Router();

const ParseltongueRequestSchema = z.object({
  text: z.string(),
  technique: z.enum(["leetspeak", "unicode_homoglyphs", "zero_width", "mixed_case", "phonetic", "random_mix"]).optional().default("leetspeak"),
  intensity: z.enum(["low", "medium", "high"]).optional().default("medium"),
  customTriggers: z.array(z.string()).optional(),
});

router.post("/", (req, res) => {
  const parsed = ParseltongueRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", message: parsed.error.message });
    return;
  }

  const { text, technique, intensity, customTriggers } = parsed.data;
  const result = applyParseltongue(text, { technique, intensity, customTriggers });

  res.json(result);
});

export default router;
