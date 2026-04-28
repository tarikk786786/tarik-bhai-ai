import { pgTable, text, integer, real, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const historyTable = pgTable("history", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: text("session_id"),
  type: text("type").notNull(), // "chat" | "race"
  prompt: text("prompt").notNull(),
  winner: text("winner"),
  score: real("score"),
  model: text("model"),
  modelsRaced: integer("models_raced"),
  tier: text("tier"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertHistorySchema = createInsertSchema(historyTable).omit({ id: true, createdAt: true });
export type InsertHistory = z.infer<typeof insertHistorySchema>;
export type History = typeof historyTable.$inferSelect;
