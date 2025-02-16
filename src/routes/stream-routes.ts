import { Router } from "express";
import { startStreamController } from "../controllers/stream-controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
router.use(authMiddleware);
router.post("/start-stream", startStreamController);

export default router;
