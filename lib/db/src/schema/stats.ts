import { pgTable, text, integer, real, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const modelWinsTable = pgTable("model_wins", {
  id: uuid("id").primaryKey().defaultRandom(),
  model: text("model").notNull().unique(),
  wins: integer("wins").notNull().default(0),
  totalScore: real("total_score").notNull().default(0),
  totalRaces: integer("total_races").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertModelWinsSchema = createInsertSchema(modelWinsTable).omit({ id: true, updatedAt: true });
export type InsertModelWins = z.infer<typeof insertModelWinsSchema>;
export type ModelWins = typeof modelWinsTable.$inferSelect;
