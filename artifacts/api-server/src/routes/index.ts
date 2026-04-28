import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import chatRouter from "./chat.js";
import raceRouter from "./race.js";
import parseltongueRouter from "./parseltongue.js";
import autotuneRouter from "./autotune.js";
import feedbackRouter from "./feedback.js";
import modelsRouter from "./models.js";
import statsRouter from "./stats.js";
import historyRouter from "./history.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/chat", chatRouter);
router.use("/race", raceRouter);
router.use("/parseltongue", parseltongueRouter);
router.use("/autotune", autotuneRouter);
router.use("/feedback", feedbackRouter);
router.use("/models", modelsRouter);
router.use("/stats", statsRouter);
router.use("/history", historyRouter);

export default router;
