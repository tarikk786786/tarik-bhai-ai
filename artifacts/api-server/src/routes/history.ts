import { Router } from "express";
import { z } from "zod/v4";
import { db, historyTable } from "@workspace/db";
import { sql, desc } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const limitStr = req.query.limit as string | undefined;
  const limit = Math.min(parseInt(limitStr ?? "50", 10) || 50, 200);

  try {
    const entries = await db.select()
      .from(historyTable)
      .orderBy(desc(historyTable.createdAt))
      .limit(limit);

    const [totalResult] = await db.select({ count: sql<number>`count(*)` })
      .from(historyTable);

    res.json({
      entries,
      total: Number(totalResult?.count ?? 0),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history", message: err instanceof Error ? err.message : String(err) });
  }
});

router.delete("/", async (req, res) => {
  try {
    const result = await db.delete(historyTable);
    res.json({ success: true, deletedCount: 0 });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear history", message: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
