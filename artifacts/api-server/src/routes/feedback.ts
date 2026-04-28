import { Router } from "express";
import { z } from "zod/v4";

const router = Router();

// In-memory feedback store (could be persisted to DB)
const feedbackStore: Array<{
  responseId: string;
  rating: number;
  context: string | undefined;
  timestamp: number;
}> = [];

const FeedbackRequestSchema = z.object({
  responseId: z.string(),
  rating: z.union([z.literal(1), z.literal(-1)]),
  context: z.string().optional(),
  parameters: z.record(z.string(), z.unknown()).optional(),
  responseText: z.string().optional(),
});

router.post("/", (req, res) => {
  const parsed = FeedbackRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", message: parsed.error.message });
    return;
  }

  const { responseId, rating, context } = parsed.data;

  feedbackStore.push({
    responseId,
    rating,
    context,
    timestamp: Date.now(),
  });

  // Keep last 500 entries
  if (feedbackStore.length > 500) {
    feedbackStore.splice(0, feedbackStore.length - 500);
  }

  res.json({ success: true, message: "Feedback recorded", total: feedbackStore.length });
});

export { feedbackStore };
export default router;
