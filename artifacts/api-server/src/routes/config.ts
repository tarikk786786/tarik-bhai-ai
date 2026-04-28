import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  const hasOpenRouter = !!process.env.OPENROUTER_API_KEY;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasBackendKey = hasOpenRouter || hasOpenAI;

  res.json({
    hasBackendKey,
    keyType: hasOpenRouter ? "openrouter" : hasOpenAI ? "openai" : null,
    models: hasOpenRouter ? "800+" : hasOpenAI ? "OpenAI" : "none",
  });
});

export default router;
