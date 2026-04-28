import { Router } from "express";
import { z } from "zod/v4";
import { listOpenRouterModels } from "../lib/openrouter.js";

const router = Router();

const QuerySchema = z.object({
  openrouterApiKey: z.string(),
});

router.get("/", async (req, res) => {
  const parsed = QuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Missing openrouterApiKey query parameter" });
    return;
  }

  try {
    const models = await listOpenRouterModels(parsed.data.openrouterApiKey);
    res.json({
      models: models.map(m => ({
        id: m.id,
        name: m.name,
        description: m.description,
        context_length: m.context_length,
        pricing: m.pricing,
      })),
      count: models.length,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch models", message: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
