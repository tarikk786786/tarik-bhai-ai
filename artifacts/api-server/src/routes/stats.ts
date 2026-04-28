import { Router } from "express";
import { db, historyTable, modelWinsTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { feedbackStore } from "./feedback.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const [totalRacesResult] = await db.select({ count: sql<number>`count(*)` })
      .from(historyTable)
      .where(sql`type = 'race'`);

    const [totalChatsResult] = await db.select({ count: sql<number>`count(*)` })
      .from(historyTable)
      .where(sql`type = 'chat'`);

    const topModels = await db.select({
      model: modelWinsTable.model,
      wins: modelWinsTable.wins,
      totalScore: modelWinsTable.totalScore,
      totalRaces: modelWinsTable.totalRaces,
    })
      .from(modelWinsTable)
      .orderBy(sql`wins desc`)
      .limit(10);

    const avgLatencyResult = await db.select({
      avgLatency: sql<number>`0`,
    }).from(historyTable).limit(1);

    res.json({
      totalRaces: Number(totalRacesResult?.count ?? 0),
      totalChats: Number(totalChatsResult?.count ?? 0),
      totalFeedback: feedbackStore.length,
      topModels: topModels.map(m => ({
        model: m.model,
        wins: m.wins,
        avgScore: m.totalRaces > 0 ? Math.round((m.totalScore / m.totalRaces) * 10) / 10 : 0,
      })),
      avgRaceLatencyMs: 0,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats", message: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
